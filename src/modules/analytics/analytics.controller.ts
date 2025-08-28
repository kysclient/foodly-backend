import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('user/dashboard')
  @ApiOperation({ summary: '사용자 대시보드 데이터' })
  getUserDashboard(@Request() req) {
    return this.analyticsService.getUserDashboard(req.user.id);
  }

  @Get('user/nutrition-trends')
  @ApiOperation({ summary: '사용자 영양 트렌드' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'week, month, year' })
  getNutritionTrends(@Request() req, @Query('period') period = 'week') {
    return this.analyticsService.getNutritionTrends(req.user.id, period);
  }

  @Get('user/meal-plan-stats')
  @ApiOperation({ summary: '사용자 식단 계획 통계' })
  getMealPlanStats(@Request() req) {
    return this.analyticsService.getMealPlanStats(req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/overview')
  @ApiOperation({ summary: '관리자 전체 통계 (관리자 전용)' })
  getAdminOverview() {
    return this.analyticsService.getAdminOverview();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/user-engagement')
  @ApiOperation({ summary: '사용자 참여도 통계 (관리자 전용)' })
  @ApiQuery({ name: 'period', required: false, type: String })
  getUserEngagement(@Query('period') period = 'month') {
    return this.analyticsService.getUserEngagement(period);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/popular-foods')
  @ApiOperation({ summary: '인기 식품 통계 (관리자 전용)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPopularFoods(@Query('limit') limit = 10) {
    return this.analyticsService.getPopularFoods(Number(limit));
  }
}