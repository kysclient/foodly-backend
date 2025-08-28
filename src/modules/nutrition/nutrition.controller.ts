import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { CalculateNutritionDto } from './dto/calculate-nutrition.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('nutrition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('calculate')
  @ApiOperation({ summary: '식품들의 영양성분 계산' })
  calculateNutrition(@Body() calculateNutritionDto: CalculateNutritionDto) {
    return this.nutritionService.calculateMealNutrition(calculateNutritionDto.foods);
  }

  @Get('food/:id')
  @ApiOperation({ summary: '특정 식품의 영양성분 조회' })
  getFoodNutrition(@Param('id') id: string) {
    return this.nutritionService.getFoodNutrition(id);
  }

  @Get('analyze')
  @ApiOperation({ summary: '영양성분 분석 및 권장사항' })
  @ApiQuery({ name: 'calories', required: true, type: Number })
  @ApiQuery({ name: 'protein', required: true, type: Number })
  @ApiQuery({ name: 'carbs', required: true, type: Number })
  @ApiQuery({ name: 'fat', required: true, type: Number })
  analyzeNutrition(@Query() query: any) {
    return this.nutritionService.analyzeNutrition({
      calories: parseFloat(query.calories),
      protein: parseFloat(query.protein),
      carbs: parseFloat(query.carbs),
      fat: parseFloat(query.fat),
    });
  }

  @Get('daily-needs/:userId')
  @ApiOperation({ summary: '사용자 일일 영양 필요량 계산' })
  getDailyNeeds(@Param('userId') userId: string) {
    return this.nutritionService.calculateDailyNeeds(userId);
  }
}