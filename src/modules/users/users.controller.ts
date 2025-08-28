import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: '현재 사용자 프로필 조회' })
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: '현재 사용자 프로필 수정' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get('preferences')
  @ApiOperation({ summary: '사용자 선호도 조회' })
  getPreferences(@Request() req) {
    return this.usersService.findPreferences(req.user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: '사용자 선호도 업데이트' })
  updatePreferences(
    @Request() req,
    @Body() updatePreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.usersService.updatePreferences(req.user.id, updatePreferenceDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '모든 사용자 조회 (관리자 전용)' })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: '특정 사용자 조회 (관리자 전용)' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제 (관리자 전용)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}