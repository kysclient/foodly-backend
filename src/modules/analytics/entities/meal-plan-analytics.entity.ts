import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('meal_plan_analytics')
@Index(['mealPlanId', 'date'])
export class MealPlanAnalytics extends BaseEntity {
  @Column()
  mealPlanId: string;

  @Column()
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  completionRate: number; // 0-100

  @Column({ default: 0 })
  recipesFollowed: number;

  @Column('json', { nullable: true })
  nutritionGoalsAchieved: {
    calories?: boolean;
    protein?: boolean;
    carbs?: boolean;
    fat?: boolean;
  };

  @Column('json', { nullable: true })
  userFeedback: {
    rating?: number; // 1-5
    difficulty?: number; // 1-5
    taste?: number; // 1-5
    comments?: string;
  };

}