import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export enum NotificationType {
  MEAL_PLAN_REMINDER = 'meal_plan_reminder',
  NUTRITION_ALERT = 'nutrition_alert',
  RECIPE_RECOMMENDATION = 'recipe_recommendation',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column('json', { nullable: true })
  metadata: any;

}