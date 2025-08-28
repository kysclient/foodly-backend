import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFoodDto {
  @ApiProperty({
    description: '식품명',
    example: '바나나',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '브랜드',
    example: 'Dole',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    description: '카테고리',
    example: '과일',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: '1회 제공량 (g)',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  servingSize: number;

  @ApiProperty({
    description: '칼로리 (kcal/100g)',
    example: 89,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({
    description: '단백질 (g/100g)',
    example: 1.1,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  protein: number;

  @ApiProperty({
    description: '탄수화물 (g/100g)', 
    example: 23,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  carbs: number;

  @ApiProperty({
    description: '지방 (g/100g)',
    example: 0.3,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  fat: number;
}