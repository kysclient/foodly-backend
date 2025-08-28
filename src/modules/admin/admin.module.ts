import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../database/entities/user.entity';
import { Food } from '../../database/entities/food.entity';
import { MealPlan } from '../../database/entities/meal-plan.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Food, MealPlan, Recipe, Notification]), // 엔티티만
    AnalyticsModule, 
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }