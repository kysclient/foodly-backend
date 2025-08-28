import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class UserProfileDto {
  @ApiPropertyOptional({
    description: '사용자 나이',
    example: 25,
    minimum: 1,
    maximum: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({
    description: '성별',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: '키 (cm)',
    example: 170,
    minimum: 100,
    maximum: 250,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @ApiPropertyOptional({
    description: '몸무게 (kg)',
    example: 70,
    minimum: 30,
    maximum: 300,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  weight?: number;

  @ApiPropertyOptional({
    description: '생일',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}