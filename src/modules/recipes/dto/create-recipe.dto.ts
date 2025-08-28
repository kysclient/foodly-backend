import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsUrl,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecipeIngredientDto {
  @ApiProperty({
    description: '식품 ID',
    example: '12345678-1234-5678-9012-123456789012',
  })
  @IsString()
  @IsNotEmpty()
  foodId: string;

  @ApiProperty({
    description: '양',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({
    description: '단위',
    example: 'g',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: '준비 방법 메모',
    example: '잘게 다진',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRecipeDto {
  @ApiProperty({
    description: '레시피 이름',
    example: '토마토 파스타',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '레시피 설명',
    example: '간단하고 맛있는 토마토 파스타 레시피',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '조리 방법',
    type: [String],
    example: ['물을 끓인다', '파스타를 넣는다', '토마토 소스를 만든다'],
  })
  @IsArray()
  @IsString({ each: true })
  instructions: string[];

  @ApiPropertyOptional({
    description: '카테고리',
    example: '이탈리안',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '준비 시간 (분)',
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prepTime?: number;

  @ApiPropertyOptional({
    description: '조리 시간 (분)',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cookTime?: number;

  @ApiPropertyOptional({
    description: '인분',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  servings?: number;

  @ApiPropertyOptional({
    description: '난이도',
    example: 'easy',
    enum: ['easy', 'medium', 'hard'],
  })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({
    description: '레시피 이미지 URL',
    example: 'https://example.com/pasta.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: '태그',
    type: [String],
    example: ['이탈리안', '파스타', '간단한'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: '재료 목록',
    type: [RecipeIngredientDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients?: RecipeIngredientDto[];
}