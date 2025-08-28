import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; tokens: any }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const tokens = await this.generateTokens(savedUser);

    await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

    return { user: savedUser, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: any }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.generateTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    return { user, tokens };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['preference'],
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return user;
  }

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(refreshToken: string) {
    try {
      // 리프레시 토큰에서 userId 추출
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const userId = payload.sub;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.refreshToken || !await bcrypt.compare(refreshToken, user.refreshToken)) {
        throw new UnauthorizedException('액세스가 거부되었습니다.');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: undefined,
    });
  }
}