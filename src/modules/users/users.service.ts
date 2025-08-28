import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities/user.entity';
import { UserPreference } from '../../database/entities/user-preference.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { PaginationUtil } from 'src/common/utils/pagination.util';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserPreference)
        private preferenceRepository: Repository<UserPreference>,
    ) { }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['preference'],
        });

        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        return user;
    }

    async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(userId);

        // 이메일 중복 확인
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new ConflictException('이미 사용 중인 이메일입니다.');
            }
        }

        // 비밀번호 해시화
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
        }

        await this.userRepository.update(userId, updateUserDto);
        return this.findById(userId);
    }

    async updatePreferences(userId: string, preferences: Partial<UserPreference>): Promise<UserPreference> {
        let userPreference = await this.preferenceRepository.findOne({
            where: { userId },
        });

        if (!userPreference) {
            userPreference = this.preferenceRepository.create({
                userId,
                ...preferences,
            });
        } else {
            Object.assign(userPreference, preferences);
        }

        return this.preferenceRepository.save(userPreference);
    }

    async getUserProfile(userId: string): Promise<UserProfileDto> {
        return await this.findById(userId);
    }

    async deactivateAccount(userId: string): Promise<void> {
        await this.userRepository.update(userId, { isActive: false });
    }

    async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        // 이메일 중복 확인
        if (updateUserDto.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser && existingUser.id !== userId) {
                throw new ConflictException('이미 사용 중인 이메일입니다.');
            }
        }

        // 비밀번호 해시화
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
        }

        await this.userRepository.update(userId, updateUserDto);
        return this.findById(userId);
    }

    async findPreferences(userId: string): Promise<UserPreference> {
        let userPreference = await this.preferenceRepository.findOne({
            where: { userId },
        });

        if (!userPreference) {
            // 기본 설정으로 생성
            userPreference = this.preferenceRepository.create({
                userId,
                activityLevel: 'moderate' as any,
                goal: 'maintenance' as any,
                allergies: [],
                dietaryRestrictions: [],
                favoriteFood: [],
                dislikedFood: [],
                cuisinePreferences: [],
            });
            userPreference = await this.preferenceRepository.save(userPreference);
        }

        return userPreference;
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: ['preference'],
            order: { createdAt: 'DESC' },
        });
    }

    async remove(userId: string): Promise<void> {
        await this.findById(userId); // 존재하는지 확인
        await this.userRepository.softDelete(userId);
    }

    async getAllUsers(page: number = 1, limit: number = 10) {
        const [users, total] = await this.userRepository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
            relations: ['preference'],
            order: { createdAt: 'DESC' },
        });

        return PaginationUtil.paginate(users, total, page, limit);
    }
}