import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Food } from '../../database/entities/food.entity';
import { MealPlan } from '../../database/entities/meal-plan.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getSystemStats() {
    const [
      totalUsers,
      totalFoods,
      totalMealPlans,
      totalRecipes,
      totalNotifications,
    ] = await Promise.all([
      this.userRepository.count(),
      this.foodRepository.count(),
      this.mealPlanRepository.count(),
      this.recipeRepository.count(),
      this.notificationRepository.count(),
    ]);

    return {
      totalUsers,
      totalFoods,
      totalMealPlans,
      totalRecipes,
      totalNotifications,
    };
  }

  async getRecentActivity(limit = 50) {
    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'name', 'email', 'createdAt'],
    });

    const recentMealPlans = await this.mealPlanRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'title', 'userId', 'createdAt'],
    });

    const recentRecipes = await this.recipeRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'name', 'createdBy', 'createdAt'],
    });

    return {
      recentUsers,
      recentMealPlans,
      recentRecipes,
    };
  }

  async getUserGrowth(period: 'week' | 'month' | 'year' = 'month') {
    let dateFormat: string;
    let interval: string;

    switch (period) {
      case 'week':
        dateFormat = '%Y-%m-%d';
        interval = '7 DAY';
        break;
      case 'month':
        dateFormat = '%Y-%m-%d';
        interval = '30 DAY';
        break;
      case 'year':
        dateFormat = '%Y-%m';
        interval = '365 DAY';
        break;
    }

    const growthData = await this.userRepository
      .createQueryBuilder('user')
      .select(`DATE_FORMAT(user.createdAt, '${dateFormat}') as date`)
      .addSelect('COUNT(*) as count')
      .where(`user.createdAt >= DATE_SUB(NOW(), INTERVAL ${interval})`)
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return growthData;
  }

  async getMostActiveUsers(limit = 10) {
    // This would require more complex analytics
    // For now, return users ordered by creation date
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      select: ['id', 'name', 'email', 'createdAt'],
    });
  }

  async getUsers(page: number = 1, limit: number = 20, search?: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where('user.name LIKE :search OR user.email LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(userId: string, role: string) {
    await this.userRepository.update(userId, { role: role as any });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    await this.userRepository.update(userId, { isActive });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getAllMealPlans(page: number = 1, limit: number = 20, status?: string) {
    const queryBuilder = this.mealPlanRepository.createQueryBuilder('mealPlan')
      .leftJoinAndSelect('mealPlan.user', 'user');

    if (status) {
      queryBuilder.where('mealPlan.status = :status', { status });
    }

    const [mealPlans, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('mealPlan.createdAt', 'DESC')
      .getManyAndCount();

    return {
      mealPlans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSystemHealth() {
    const stats = await this.getSystemStats();
    
    return {
      ...stats,
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date(),
    };
  }

  async sendSystemNotification(title: string, message: string, targetUserIds?: string[]) {
    const notifications: any = [];
    
    if (targetUserIds && targetUserIds.length > 0) {
      for (const userId of targetUserIds) {
        notifications.push(
          this.notificationRepository.create({
            userId,
            title,
            message,
            type: 'system' as any,
          })
        );
      }
    } else {
      // Send to all users
      const users = await this.userRepository.find({ select: ['id'] });
      for (const user of users) {
        notifications.push(
          this.notificationRepository.create({
            userId: user.id,
            title,
            message,
            type: 'system' as any,
          })
        );
      }
    }

    return this.notificationRepository.save(notifications);
  }
}