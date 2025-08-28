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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationUtil } from '../../common/utils/pagination.util';

@ApiTags('meal-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post('generate')
  @ApiOperation({ summary: 'AI 기반 식단 계획 생성' })
  generateMealPlan(@Request() req, @Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlanService.createMealPlan(req.user.id, createMealPlanDto);
  }

  @Get()
  @ApiOperation({ summary: '사용자 식단 계획 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Request() req, @Query() query: any) {
    const { page, limit } = PaginationUtil.getPaginationParams(query);
    return this.mealPlanService.findAllByUser(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 식단 계획 조회' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.mealPlanService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '식단 계획 수정' })
  update(
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
    @Request() req,
  ) {
    return this.mealPlanService.update(id, updateMealPlanDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '식단 계획 삭제' })
  remove(@Param('id') id: string, @Request() req) {
    return this.mealPlanService.remove(id, req.user.id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: '식단 계획 즐겨찾기 추가' })
  addToFavorites(@Param('id') id: string, @Request() req) {
    return this.mealPlanService.addToFavorites(id, req.user.id);
  }

  @Delete(':id/favorite')
  @ApiOperation({ summary: '식단 계획 즐겨찾기 제거' })
  removeFromFavorites(@Param('id') id: string, @Request() req) {
    return this.mealPlanService.removeFromFavorites(id, req.user.id);
  }
}