import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UserAnalytics } from './entities/user-analytics.entity';
import { MealPlanAnalytics } from './entities/meal-plan-analytics.entity';
import { MealPlan } from '../../database/entities/meal-plan.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAnalytics, MealPlanAnalytics, MealPlan, User]),
    BullModule.registerQueue({
      name: 'analytics',
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}