import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { Nutrition } from '../../database/entities/nutrition.entity';
import { Food } from '../../database/entities/food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nutrition, Food])],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}