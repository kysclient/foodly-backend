import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional({
    description: '이메일 알림 사용 여부',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({
    description: '푸시 알림 사용 여부',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({
    description: '식단 계획 알림 사용 여부',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  mealPlanReminders?: boolean;

  @ApiPropertyOptional({
    description: '영양 알림 사용 여부',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  nutritionAlerts?: boolean;

  @ApiPropertyOptional({
    description: '레시피 추천 알림 사용 여부',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  recipeRecommendations?: boolean;

  @ApiPropertyOptional({
    description: '알림 시간 (HH:MM 형식)',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  reminderTime?: string;
}