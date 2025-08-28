import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { MealPlan, MealPlanStatus } from '../../database/entities/meal-plan.entity';
import { User } from '../../database/entities/user.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { MealPlanGateway } from './meal-plan.gateway';

@Injectable()
export class MealPlanService {

  constructor(
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('meal-plan-generation')
    private mealPlanQueue: Queue,
    private mealPlanGateway: MealPlanGateway,
  ) {}

  async createMealPlan(userId: string, createMealPlanDto: CreateMealPlanDto): Promise<MealPlan> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['preference'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 식단 계획 생성
    const mealPlan = this.mealPlanRepository.create({
      userId,
      title: createMealPlanDto.name,
      startDate: createMealPlanDto.startDate,
      endDate: createMealPlanDto.endDate,
      dailyCalories: this.calculateDailyCalories(user, createMealPlanDto),
      status: MealPlanStatus.GENERATING,
    });

    const savedMealPlan = await this.mealPlanRepository.save(mealPlan);

    // 큐에 작업 추가 (백그라운드 처리)
    await this.mealPlanQueue.add('generate-meal-plan', {
      mealPlanId: savedMealPlan.id,
      userId,
      userPreferences: user.preference,
      dailyCalories: savedMealPlan.dailyCalories,
    });

    // WebSocket으로 상태 알림
    this.mealPlanGateway.notifyMealPlanStatus(userId, {
      mealPlanId: savedMealPlan.id,
      status: MealPlanStatus.GENERATING,
      message: '식단 생성을 시작합니다...',
    });

    return savedMealPlan;
  }

  async findUserMealPlans(userId: string, page: number = 1, limit: number = 10) {
    const [mealPlans, total] = await this.mealPlanRepository.findAndCount({
      where: { userId },
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: mealPlans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMealPlanById(id: string, userId?: string): Promise<MealPlan> {
    const whereClause: any = { id };
    if (userId) {
      whereClause.userId = userId;
    }

    const mealPlan = await this.mealPlanRepository.findOne({
      where: whereClause,
      relations: ['user'],
    });

    if (!mealPlan) {
      throw new NotFoundException('식단 계획을 찾을 수 없습니다.');
    }

    return mealPlan;
  }

  async updateMealPlan(id: string, userId: string, updateMealPlanDto: UpdateMealPlanDto): Promise<MealPlan> {
    await this.findMealPlanById(id, userId);

    await this.mealPlanRepository.update(id, updateMealPlanDto);
    return this.findMealPlanById(id, userId);
  }

  async deleteMealPlan(id: string, userId: string): Promise<void> {
    await this.findMealPlanById(id, userId);
    await this.mealPlanRepository.softDelete(id);
  }

  async toggleFavorite(id: string, userId: string): Promise<MealPlan> {
    const mealPlan = await this.findMealPlanById(id, userId);
    
    await this.mealPlanRepository.update(id, {
      isFavorite: !mealPlan.isFavorite,
    });

    return this.findMealPlanById(id, userId);
  }

  private calculateDailyCalories(user: User, _dto: CreateMealPlanDto): number {
    // BMR 계산 (Harris-Benedict 공식)
    let bmr: number;
    
    if (user.gender === 'male') {
      bmr = 88.362 + (13.397 * (user.weight || 70)) + (4.799 * (user.height || 170)) - (5.677 * (user.age || 25));
    } else {
      bmr = 447.593 + (9.247 * (user.weight || 60)) + (3.098 * (user.height || 160)) - (4.33 * (user.age || 25));
    }

    // 활동량 계수
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    // 목표에 따른 조정
    const goalAdjustments = {
      weight_loss: 0.8,
      weight_gain: 1.2,
      maintenance: 1.0,
      muscle_gain: 1.15,
    };

    const tdee = bmr * (activityMultipliers[user.preference?.activityLevel] || 1.55);
    const adjustedCalories = tdee * (goalAdjustments[user.preference?.goal] || 1.0);

    return Math.round(adjustedCalories);
  }

  async findAllByUser(userId: string, page: number, limit: number) {
    const [mealPlans, total] = await this.mealPlanRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      mealPlans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<MealPlan> {
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id, userId },
    });

    if (!mealPlan) {
      throw new NotFoundException('식단 계획을 찾을 수 없습니다.');
    }

    return mealPlan;
  }

  async update(id: string, updateMealPlanDto: UpdateMealPlanDto, userId: string): Promise<MealPlan> {
    await this.findOne(id, userId); // 권한 확인
    
    await this.mealPlanRepository.update(id, updateMealPlanDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId); // 권한 확인
    await this.mealPlanRepository.softDelete(id);
  }

  async addToFavorites(id: string, userId: string): Promise<MealPlan> {
    await this.findOne(id, userId); // 권한 확인
    
    await this.mealPlanRepository.update(id, { isFavorite: true });
    return this.findOne(id, userId);
  }

  async removeFromFavorites(id: string, userId: string): Promise<MealPlan> {
    await this.findOne(id, userId); // 권한 확인
    
    await this.mealPlanRepository.update(id, { isFavorite: false });
    return this.findOne(id, userId);
  }

  async getMealPlanAnalytics(userId: string, startDate: Date, endDate: Date) {
    const mealPlans = await this.mealPlanRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
    });

    return {
      totalMealPlans: mealPlans.length,
      completedPlans: mealPlans.filter(mp => mp.status === MealPlanStatus.COMPLETED).length,
      favoritePlans: mealPlans.filter(mp => mp.isFavorite).length,
      averageCalories: mealPlans.reduce((acc, mp) => acc + mp.dailyCalories, 0) / mealPlans.length || 0,
    };
  }
}