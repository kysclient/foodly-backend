import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { UserRole } from '../../database/entities/user.entity';
import { AdminService } from './admin.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly analyticsService: AnalyticsService,
    ) { }

    @Get('dashboard')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '관리자 대시보드 데이터' })
    async getDashboard() {
        return this.analyticsService.getAdminDashboard();
    }

    @Get('users')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '사용자 목록 조회' })
    async getUsers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
    ) {
        return this.adminService.getUsers(page, limit, search);
    }

    @Put('users/:id/role')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '사용자 권한 변경' })
    async updateUserRole(
        @Param('id') userId: string,
        @Body('role') role: UserRole,
    ) {
        return this.adminService.updateUserRole(userId, role);
    }

    @Put('users/:id/status')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '사용자 상태 변경' })
    async updateUserStatus(
        @Param('id') userId: string,
        @Body('isActive') isActive: boolean,
    ) {
        return this.adminService.updateUserStatus(userId, isActive);
    }

    @Get('meal-plans')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '모든 식단 계획 조회' })
    async getAllMealPlans(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('status') status?: string,
    ) {
        return this.adminService.getAllMealPlans(page, limit, status);
    }

    @Get('system-health')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '시스템 상태 확인' })
    async getSystemHealth() {
        return this.adminService.getSystemHealth();
    }
}