import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMealPlanDto {
  @ApiProperty({
    description: '식단 계획 이름',
    example: '건강한 일주일 식단',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '시작 날짜',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: '종료 날짜',
    example: '2024-01-07',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: '목표 일일 칼로리',
    example: 2000,
    minimum: 1000,
    maximum: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(5000)
  targetCalories?: number;

  @ApiPropertyOptional({
    description: '특별한 요청사항',
    example: '저염식으로 준비해주세요',
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiPropertyOptional({
    description: '제외할 음식들',
    type: [String],
    example: ['브로콜리', '당근'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeFoods?: string[];
}