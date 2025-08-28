import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('notification_preferences')
export class NotificationPreference extends BaseEntity {
  @Column({ unique: true })
  userId: string;

  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column({ default: true })
  mealPlanReminders: boolean;

  @Column({ default: true })
  nutritionAlerts: boolean;

  @Column({ default: true })
  recipeRecommendations: boolean;

  @Column({ type: 'time', nullable: true })
  reminderTime: string; // Format: HH:MM

}