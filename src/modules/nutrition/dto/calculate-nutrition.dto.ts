import { IsArray, IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FoodItemDto {
  @ApiProperty({
    description: '식품 ID',
    example: '12345678-1234-5678-9012-123456789012',
  })
  @IsString()
  @IsNotEmpty()
  foodId: string;

  @ApiProperty({
    description: '식품 양 (그램)',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CalculateNutritionDto {
  @ApiProperty({
    description: '계산할 식품 목록',
    type: [FoodItemDto],
  })
  @IsArray()
  @IsNotEmpty()
  foods: FoodItemDto[];
}