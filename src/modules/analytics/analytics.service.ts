import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MealPlan } from '../../database/entities/meal-plan.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserAnalytics(userId: string, startDate: Date, endDate: Date) {
    const mealPlans = await this.mealPlanRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
    });

    const nutritionTrends = this.calculateNutritionTrends(mealPlans);
    const calorieConsistency = this.calculateCalorieConsistency(mealPlans);
    const goalProgress = await this.calculateGoalProgress(userId, mealPlans);

    return {
      totalMealPlans: mealPlans.length,
      nutritionTrends,
      calorieConsistency,
      goalProgress,
      achievements: await this.getUserAchievements(userId),
    };
  }

  async getAdminDashboard() {
    const totalUsers = await this.userRepository.count({ where: { isActive: true } });
    const totalMealPlans = await this.mealPlanRepository.count();
    
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentUsers = await this.userRepository.count({
      where: { createdAt: Between(last30Days, new Date()) },
    });
    
    const recentMealPlans = await this.mealPlanRepository.count({
      where: { createdAt: Between(last30Days, new Date()) },
    });

    const userGrowth = await this.getUserGrowthData();
    const popularGoals = await this.getPopularGoals();

    return {
      summary: {
        totalUsers,
        totalMealPlans,
        recentUsers,
        recentMealPlans,
      },
      userGrowth,
      popularGoals,
    };
  }

  private calculateNutritionTrends(mealPlans: MealPlan[]) {
    const trends = mealPlans.map(plan => ({
      date: plan.createdAt,
      calories: plan.dailyCalories,
      nutrients: plan.nutritionSummary?.averageNutrients || {},
    }));

    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculateCalorieConsistency(mealPlans: MealPlan[]) {
    if (mealPlans.length === 0) return { score: 0, variance: 0 };

    const calories = mealPlans.map(plan => plan.dailyCalories);
    const average = calories.reduce((sum, cal) => sum + cal, 0) / calories.length;
    const variance = calories.reduce((sum, cal) => sum + Math.pow(cal - average, 2), 0) / calories.length;
    
    // 일관성 점수 (0-100)
    const score = Math.max(0, 100 - (Math.sqrt(variance) / average) * 100);

    return { score: Math.round(score), variance: Math.round(variance) };
  }

  private async calculateGoalProgress(userId: string, mealPlans: MealPlan[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['preference'],
    });

    if (!user?.preference) return null;

    const goal = user.preference.goal;
    const completedPlans = mealPlans.filter(plan => plan.status === 'completed').length;
    const totalPlans = mealPlans.length;
    
    return {
      goal,
      completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
      completedPlans,
      totalPlans,
    };
  }

  private async getUserAchievements(userId: string) {
    const achievements: Array<{
      id: string;
      title: string;
      description: string;
      unlockedAt: Date;
    }> = [];
    const mealPlans = await this.mealPlanRepository.find({ where: { userId } });
    
    // 첫 식단 완성
    if (mealPlans.length > 0) {
      achievements.push({
        id: 'first_meal_plan',
        title: '첫 식단 완성',
        description: '첫 번째 식단을 성공적으로 생성했습니다!',
        unlockedAt: mealPlans[0].createdAt,
      });
    }

    // 식단 마스터 (10개 이상)
    if (mealPlans.length >= 10) {
      achievements.push({
        id: 'meal_plan_master',
        title: '식단 마스터',
        description: '10개 이상의 식단을 생성했습니다!',
        unlockedAt: mealPlans[9].createdAt,
      });
    }

    return achievements;
  }

  private async getUserGrowthData() {
    // 월별 사용자 증가 데이터
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE_FORMAT(user.createdAt, "%Y-%m") as month')
      .addSelect('COUNT(*) as count')
      .where('user.createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)')
      .groupBy('month')
      .orderBy('month')
      .getRawMany();

    return result;
  }

  private async getPopularGoals() {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.preference', 'preference')
      .select('preference.goal as goal')
      .addSelect('COUNT(*) as count')
      .where('preference.goal IS NOT NULL')
      .groupBy('preference.goal')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result;
  }

  async getUserDashboard(userId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const analytics = await this.getUserAnalytics(userId, startDate, endDate);
    const achievements = await this.getUserAchievements(userId);
    
    return {
      ...analytics,
      achievements: achievements.slice(0, 3), // Latest 3 achievements
      summary: {
        activeDays: Math.floor(Math.random() * 30), // Mock data
        streak: Math.floor(Math.random() * 10),
        totalCaloriesBurned: Math.floor(Math.random() * 5000),
      }
    };
  }

  async getNutritionTrends(userId: string, period: string = 'week') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'year':
        startDate.setDate(startDate.getDate() - 365);
        break;
    }

    const mealPlans = await this.mealPlanRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
    });

    return this.calculateNutritionTrends(mealPlans);
  }

  async getMealPlanStats(userId: string) {
    const totalPlans = await this.mealPlanRepository.count({
      where: { userId }
    });

    const completedPlans = await this.mealPlanRepository.count({
      where: { userId, status: 'completed' as any }
    });

    const favoritePlans = await this.mealPlanRepository.count({
      where: { userId, isFavorite: true }
    });

    return {
      totalPlans,
      completedPlans,
      favoritePlans,
      completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
    };
  }

  async getAdminOverview() {
    const totalUsers = await this.userRepository.count();
    const totalMealPlans = await this.mealPlanRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true }
    });

    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const newUsersThisWeek = await this.userRepository.count({
      where: {
        createdAt: Between(lastWeek, today)
      }
    });

    const newMealPlansThisWeek = await this.mealPlanRepository.count({
      where: {
        createdAt: Between(lastWeek, today)
      }
    });

    return {
      totalUsers,
      activeUsers,
      totalMealPlans,
      newUsersThisWeek,
      newMealPlansThisWeek,
      userGrowthRate: totalUsers > 0 ? (newUsersThisWeek / totalUsers) * 100 : 0,
    };
  }

  async getUserEngagement(period: string = 'month') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'year':
        startDate.setDate(startDate.getDate() - 365);
        break;
    }

    const activeUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLoginAt >= :startDate', { startDate })
      .getCount();

    const totalUsers = await this.userRepository.count();

    return {
      activeUsers,
      totalUsers,
      engagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      period,
    };
  }

  async getPopularFoods(limit: number = 10) {
    // Mock implementation - would need to track food usage in real app
    return [
      { name: '닭가슴살', usageCount: 150, category: '단백질' },
      { name: '바나나', usageCount: 120, category: '과일' },
      { name: '현미', usageCount: 100, category: '곡류' },
      { name: '브로콜리', usageCount: 85, category: '채소' },
      { name: '계란', usageCount: 80, category: '단백질' },
    ].slice(0, limit);
  }
}