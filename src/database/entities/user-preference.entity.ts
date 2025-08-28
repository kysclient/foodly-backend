import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum ActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHT = 'light',
    MODERATE = 'moderate',
    ACTIVE = 'active',
    VERY_ACTIVE = 'very_active',
}

export enum Goal {
    WEIGHT_LOSS = 'weight_loss',
    WEIGHT_GAIN = 'weight_gain',
    MAINTENANCE = 'maintenance',
    MUSCLE_GAIN = 'muscle_gain',
}

@Entity('user_preferences')
export class UserPreference extends BaseEntity {
    @Column()
    userId: string;

    @OneToOne(() => User, user => user.preference, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'enum', enum: ActivityLevel, default: ActivityLevel.MODERATE })
    activityLevel: ActivityLevel;

    @Column({ type: 'enum', enum: Goal, default: Goal.MAINTENANCE })
    goal: Goal;

    @Column({ type: 'json', nullable: true })
    allergies: string[];

    @Column({ type: 'json', nullable: true })
    dietaryRestrictions: string[];

    @Column({ type: 'json', nullable: true })
    favoriteFood: string[];

    @Column({ type: 'json', nullable: true })
    dislikedFood: string[];

    @Column({ type: 'json', nullable: true })
    cuisinePreferences: string[];

    @Column({ default: true })
    notificationsEnabled: boolean;

    @Column({ type: 'time', nullable: true })
    breakfastTime?: string;

    @Column({ type: 'time', nullable: true })
    lunchTime?: string;

    @Column({ type: 'time', nullable: true })
    dinnerTime?: string;
}