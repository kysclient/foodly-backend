import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  Min,
} from 'class-validator';
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
    description: '브랜드명',
    example: 'Dole',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: '카테고리',
    example: '과일',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '바코드',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: '1회 제공량 (그램)',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  servingSize: number;

  @ApiPropertyOptional({
    description: '식품 이미지 URL',
    example: 'https://example.com/banana.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: '식품 설명',
    example: '달콤하고 부드러운 열대과일',
  })
  @IsOptional()
  @IsString()
  description?: string;
}