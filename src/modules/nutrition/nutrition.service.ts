import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Food } from '../../database/entities/food.entity';
import { Nutrition } from '../../database/entities/nutrition.entity';
import { CreateFoodDto } from './dto/create-food.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
    @InjectRepository(Nutrition)
    private nutritionRepository: Repository<Nutrition>,
  ) {}

  async searchFoods(query: string, category?: string) {
    const whereClause: any = [
      { name: Like(`%${query}%`) },
      { nameEn: Like(`%${query}%`) },
    ];

    if (category) {
      whereClause.forEach((clause: any) => clause.category = category);
    }

    return this.foodRepository.find({
      where: whereClause,
      relations: ['nutrition'],
      take: 20,
    });
  }

  async getFoodById(id: string): Promise<Food> {
    const food = await this.foodRepository.findOne({
      where: { id },
      relations: ['nutrition'],
    });

    if (!food) {
      throw new NotFoundException('음식 정보를 찾을 수 없습니다.');
    }

    return food;
  }

  async createFood(createFoodDto: CreateFoodDto): Promise<Food> {
    const food = this.foodRepository.create({
      ...createFoodDto,
      servingUnit: 'g', // 기본 단위
    });
    
    const savedFood = await this.foodRepository.save(food);
    
    // 영양 정보 생성
    const nutrition = this.nutritionRepository.create({
      foodId: savedFood.id,
      calories: createFoodDto.calories,
      protein: createFoodDto.protein,
      carbohydrates: createFoodDto.carbs,
      fat: createFoodDto.fat,
    });
    
    await this.nutritionRepository.save(nutrition);
    
    return this.foodRepository.findOne({
      where: { id: savedFood.id },
      relations: ['nutrition'],
    }) as Promise<Food>;
  }

  async getFoodCategories(): Promise<string[]> {
    const result = await this.foodRepository
      .createQueryBuilder('food')
      .select('DISTINCT food.category', 'category')
      .where('food.category IS NOT NULL')
      .getRawMany();

    return result.map(item => item.category);
  }

  async calculateMealNutrition(foodItems: Array<{ foodId: string; amount: number }>) {
    const nutritionData = { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 };

    for (const item of foodItems) {
      const food = await this.getFoodById(item.foodId);
      const nutrition = food.nutrition[0];

      if (nutrition) {
        const multiplier = item.amount / food.servingSize;
        nutritionData.calories += nutrition.calories * multiplier;
        nutritionData.protein += nutrition.protein * multiplier;
        nutritionData.carbohydrates += nutrition.carbohydrates * multiplier;
        nutritionData.fat += nutrition.fat * multiplier;
        nutritionData.fiber += nutrition.fiber * multiplier;
      }
    }

    return nutritionData;
  }

  async getFoodNutrition(foodId: string) {
    const food = await this.foodRepository.findOne({
      where: { id: foodId },
      relations: ['nutrition'],
    });

    if (!food) {
      throw new NotFoundException(`Food with ID ${foodId} not found`);
    }

    return {
      food: {
        id: food.id,
        name: food.name,
        category: food.category,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
      },
      nutrition: food.nutrition[0] || null,
    };
  }

  async analyzeNutrition(nutritionData: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) {
    const { calories, protein, carbs, fat } = nutritionData;

    // 영양소 비율 계산
    const proteinCalories = protein * 4;
    const carbsCalories = carbs * 4;
    const fatCalories = fat * 9;
    const totalMacroCalories = proteinCalories + carbsCalories + fatCalories;

    const proteinPercentage = totalMacroCalories > 0 ? (proteinCalories / totalMacroCalories) * 100 : 0;
    const carbsPercentage = totalMacroCalories > 0 ? (carbsCalories / totalMacroCalories) * 100 : 0;
    const fatPercentage = totalMacroCalories > 0 ? (fatCalories / totalMacroCalories) * 100 : 0;

    // 권장사항 생성
    const recommendations: string[] = [];

    if (proteinPercentage < 10) {
      recommendations.push('단백질 섭취량을 늘려보세요. 권장 비율은 10-35%입니다.');
    } else if (proteinPercentage > 35) {
      recommendations.push('단백질 섭취량이 너무 높습니다. 균형을 맞춰보세요.');
    }

    if (carbsPercentage < 45) {
      recommendations.push('탄수화물 섭취량을 늘려보세요. 권장 비율은 45-65%입니다.');
    } else if (carbsPercentage > 65) {
      recommendations.push('탄수화물 섭취량을 줄이고 다른 영양소를 늘려보세요.');
    }

    if (fatPercentage < 20) {
      recommendations.push('건강한 지방 섭취량을 늘려보세요. 권장 비율은 20-35%입니다.');
    } else if (fatPercentage > 35) {
      recommendations.push('지방 섭취량을 줄여보세요.');
    }

    return {
      totalCalories: calories,
      macronutrients: {
        protein: { grams: protein, calories: proteinCalories, percentage: proteinPercentage },
        carbs: { grams: carbs, calories: carbsCalories, percentage: carbsPercentage },
        fat: { grams: fat, calories: fatCalories, percentage: fatPercentage },
      },
      recommendations,
      analysis: {
        balanced: recommendations.length === 0,
        score: Math.max(0, 100 - recommendations.length * 20), // 권장사항이 적을수록 높은 점수
      },
    };
  }

  async calculateDailyNeeds(userId: string) {
    // 기본 권장 영양소 (성인 기준)
    const baseNeeds = {
      calories: 2000,
      protein: 50, // g
      carbs: 250, // g
      fat: 67, // g
      fiber: 25, // g
      sodium: 2300, // mg
    };

    // 실제로는 사용자 정보(나이, 성별, 체중, 키, 활동량)를 고려해야 함
    // 여기서는 기본값을 반환
    return {
      userId,
      dailyNeeds: baseNeeds,
      recommendations: [
        '개인의 나이, 성별, 체중, 키, 활동량을 고려한 맞춤 영양 계획을 위해 프로필을 완성해주세요.',
        '균형 잡힌 식사를 위해 다양한 식품군에서 영양소를 섭취하세요.',
        '충분한 수분 섭취(하루 8잔 이상)를 권장합니다.',
      ],
    };
  }
}