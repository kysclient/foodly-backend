import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: '알림 제목',
    example: '식단 계획 알림',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '알림 메시지',
    example: '오늘의 식단을 확인해보세요!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: '알림 타입',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: '추가 메타데이터',
    example: { mealPlanId: '123' },
  })
  @IsOptional()
  metadata?: any;
}