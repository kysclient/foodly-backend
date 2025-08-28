import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('user_analytics')
@Index(['userId', 'date'])
export class UserAnalytics extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalCalories: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalProtein: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalCarbs: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalFat: number;

  @Column({ default: 0 })
  mealsLogged: number;

  @Column({ default: 0 })
  recipesViewed: number;

  @Column({ default: 0 })
  mealPlansCreated: number;

  @Column({ type: 'time', nullable: true })
  firstLoginTime: string;

  @Column({ type: 'time', nullable: true })
  lastLoginTime: string;

  @Column('json', { nullable: true })
  deviceInfo: {
    platform?: string;
    version?: string;
    browser?: string;
  };

}