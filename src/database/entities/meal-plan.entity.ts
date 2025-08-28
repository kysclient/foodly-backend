import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum MealPlanStatus {
    GENERATING = 'generating',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('meal_plans')
@Index(['userId', 'startDate'])
export class MealPlan extends BaseEntity {
    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.mealPlans, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    title: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ type: 'int' })
    dailyCalories: number;

    @Column({ type: 'enum', enum: MealPlanStatus, default: MealPlanStatus.GENERATING })
    status: MealPlanStatus;

    @Column({ type: 'json' })
    mealPlanData: any;

    @Column({ type: 'json', nullable: true })
    nutritionSummary?: any;

    @Column({ default: false })
    isFavorite: boolean;

    @Column({ type: 'text', nullable: true })
    notes?: string;
}