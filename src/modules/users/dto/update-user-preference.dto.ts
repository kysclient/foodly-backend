import {
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DietaryRestriction {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  NUT_FREE = 'nut_free',
  HALAL = 'halal',
  KOSHER = 'kosher',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active',
}

export class UpdateUserPreferenceDto {
  @ApiPropertyOptional({
    description: '식이 제한 사항',
    enum: DietaryRestriction,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DietaryRestriction, { each: true })
  dietaryRestrictions?: DietaryRestriction[];

  @ApiPropertyOptional({
    description: '알레르기 정보',
    type: [String],
    example: ['땅콩', '새우'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({
    description: '선호하는 음식',
    type: [String],
    example: ['한식', '이탈리안'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCuisines?: string[];

  @ApiPropertyOptional({
    description: '싫어하는 음식',
    type: [String],
    example: ['브로콜리', '당근'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dislikedFoods?: string[];

  @ApiPropertyOptional({
    description: '일일 칼로리 목표',
    example: 2000,
    minimum: 1000,
    maximum: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(5000)
  dailyCalorieGoal?: number;

  @ApiPropertyOptional({
    description: '활동 수준',
    enum: ActivityLevel,
    example: ActivityLevel.MODERATE,
  })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;
}