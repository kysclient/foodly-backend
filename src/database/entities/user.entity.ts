import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';
import { MealPlan } from './meal-plan.entity';
import { UserPreference } from './user-preference.entity';

export enum UserRole {
    USER = 'user',
    PREMIUM = 'premium',
    ADMIN = 'admin',
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    profileImage?: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender?: Gender;

    @Column({ type: 'int', nullable: true })
    age?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    height?: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    weight?: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    lastLoginAt?: Date;

    @Column({ nullable: true })
    refreshToken?: string;

    @OneToMany(() => MealPlan, mealPlan => mealPlan.user)
    mealPlans: MealPlan[];

    @OneToOne(() => UserPreference, preference => preference.user, { cascade: true })
    preference: UserPreference;
}