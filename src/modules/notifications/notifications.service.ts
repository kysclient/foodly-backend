import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private notificationPreferenceRepository: Repository<NotificationPreference>,
    @InjectQueue('notifications')
    private notificationQueue: Queue,
  ) {}

  async create(createNotificationDto: CreateNotificationDto & { userId: string }): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);

    // Queue for push notification, email, etc.
    await this.notificationQueue.add('send-notification', {
      notification: savedNotification,
    });

    return savedNotification;
  }

  async findByUser(userId: string, options: {
    page: number;
    limit: number;
    unreadOnly?: boolean;
  }) {
    const { page, limit, unreadOnly } = options;
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (unreadOnly) {
      queryBuilder.andWhere('notification.isRead = false');
    }

    const [notifications, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.notificationRepository.remove(notification);
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.notificationPreferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.notificationPreferenceRepository.create({
        userId,
        emailEnabled: true,
        pushEnabled: true,
        mealPlanReminders: true,
        nutritionAlerts: true,
        recipeRecommendations: true,
      });
      preferences = await this.notificationPreferenceRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    updatePreferenceDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    let preferences = await this.getPreferences(userId);
    Object.assign(preferences, updatePreferenceDto);
    return this.notificationPreferenceRepository.save(preferences);
  }

  async sendMealPlanReminder(userId: string, mealPlanName: string): Promise<void> {
    await this.create({
      userId,
      title: '식단 계획 알림',
      message: `${mealPlanName} 식단 계획을 확인해보세요!`,
      type: NotificationType.MEAL_PLAN_REMINDER,
    });
  }

  async sendNutritionAlert(userId: string, message: string): Promise<void> {
    await this.create({
      userId,
      title: '영양 알림',
      message,
      type: NotificationType.NUTRITION_ALERT,
    });
  }
}