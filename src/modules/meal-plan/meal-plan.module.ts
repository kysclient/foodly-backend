import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';
import { MealPlanGateway } from './meal-plan.gateway';
import { MealPlan } from '../../database/entities/meal-plan.entity';
import { Food } from '../../database/entities/food.entity';
import { User } from '../../database/entities/user.entity';
import { UserPreference } from '../../database/entities/user-preference.entity';
import { MealPlanGenerationProcessor } from 'src/jobs/meal-plan-generation.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlan, Food, User, UserPreference]),
    BullModule.registerQueue({
      name: 'meal-plan-generation',
    }),
  ],
  controllers: [MealPlanController],
  providers: [MealPlanService, MealPlanGateway, MealPlanGenerationProcessor],
  exports: [MealPlanService],
})
export class MealPlanModule {}