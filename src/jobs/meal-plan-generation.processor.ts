import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { MealPlan, MealPlanStatus } from '../database/entities/meal-plan.entity';
import { MealPlanGateway } from '../modules/meal-plan/meal-plan.gateway';

interface MealPlanJobData {
  mealPlanId: string;
  userId: string;
  userPreferences: any;
  dailyCalories: number;
}

@Processor('meal-plan-generation')
@Injectable()
export class MealPlanGenerationProcessor {
  private readonly logger = new Logger(MealPlanGenerationProcessor.name);

  constructor(
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
    private mealPlanGateway: MealPlanGateway,

  ) { }

  @Process('generate-meal-plan')
  async handleMealPlanGeneration(job: Job<MealPlanJobData>) {
    const { mealPlanId, userId, userPreferences, dailyCalories } = job.data;

    try {
      this.logger.log(`Starting meal plan generation for ${mealPlanId}`);

      // 진행률 업데이트
      job.progress(10);
      this.mealPlanGateway.notifyMealPlanStatus(userId, {
        mealPlanId,
        status: MealPlanStatus.GENERATING,
        progress: 10,
        message: 'AI 식단 생성 중...',
      });

      // AI를 통한 식단 생성
      const mealPlanData = await this.generateAIMealPlan(userPreferences, dailyCalories, job, userId, mealPlanId);

      job.progress(80);
      this.mealPlanGateway.notifyMealPlanStatus(userId, {
        mealPlanId,
        status: MealPlanStatus.GENERATING,
        progress: 80,
        message: '영양 정보 계산 중...',
      });

      // 영양 정보 요약 계산
      const nutritionSummary = this.calculateNutritionSummary(mealPlanData);

      // 데이터베이스 업데이트
      await this.mealPlanRepository.update(mealPlanId, {
        mealPlanData: mealPlanData as any,
        nutritionSummary: nutritionSummary as any,
        status: MealPlanStatus.COMPLETED,
      });

      job.progress(100);
      this.mealPlanGateway.notifyMealPlanStatus(userId, {
        mealPlanId,
        status: MealPlanStatus.COMPLETED,
        progress: 100,
        message: '식단 생성이 완료되었습니다!',
      });

      this.logger.log(`Meal plan generation completed for ${mealPlanId}`);

    } catch (error) {
      this.logger.error(`Meal plan generation failed for ${mealPlanId}:`, error);

      this.mealPlanGateway.notifyMealPlanStatus(userId, {
        mealPlanId,
        status: MealPlanStatus.FAILED,
        message: '식단 생성에 실패했습니다. 다시 시도해주세요.',
      });


      await this.mealPlanRepository.update(mealPlanId, {
        status: MealPlanStatus.FAILED,
      });

      throw error;
    }
  }

  private async generateAIMealPlan(userPreferences: any, dailyCalories: number, job: Job, userId: string, mealPlanId: string) {
    const systemPrompt = `
    당신은 전문 영양사이자 한국 음식 전문가입니다.
    개인의 건강 목표와 선호도에 맞는 실용적이고 맛있는 한국식 30일 식단을 계획해주세요.
    응답 형식:
    {
      "mealPlanData": [
        {
          "date": "YYYY-MM-DD",
          "breakfast": { "menu": "메뉴명", "calories": 칼로리, "nutrients": {...} },
          "lunch": { "menu": "메뉴명", "calories": 칼로리, "nutrients": {...} },
          "dinner": { "menu": "메뉴명", "calories": 칼로리, "nutrients": {...} },
          "snack": { "menu": "메뉴명", "calories": 칼로리, "nutrients": {...} },
          "totalCalories": 총칼로리,
          "dailyNutrients": { "protein": g, "carbs": g, "fat": g }
        }
      ]
    }
  `;

    const userPrompt = `
    사용자 선호도와 목표에 맞는 30일 식단을 생성해주세요:
    - 일일 목표 칼로리: ${dailyCalories}kcal
    - 활동 수준: ${userPreferences?.activityLevel || 'moderate'}
    - 건강 목표: ${userPreferences?.goal || 'maintenance'}
    - 알레르기: ${userPreferences?.allergies?.join(', ') || '없음'}
    - 식단 제한: ${userPreferences?.dietaryRestrictions?.join(', ') || '없음'}
    - 선호 음식: ${userPreferences?.favoriteFood?.join(', ') || '일반적인 한식'}
    - 싫어하는 음식: ${userPreferences?.dislikedFood?.join(', ') || '없음'}
    요구사항:
    1. 한국인 입맛에 맞는 건강한 식단
    2. 실용적이고 조리 가능한 메뉴
    3. 영양소 균형 고려
    4. 30일간 다양한 메뉴 구성
  `;

    try {
      job.progress(30);

      let text: string;
      try {
        const response = await generateText({
          model: openai('gpt-5-nano'),
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.7,
        });
        text = response.text;
      } catch (apiError: any) {

        this.mealPlanGateway.notifyMealPlanStatus(userId, {
          mealPlanId,
          status: MealPlanStatus.FAILED,
          message: '식단 생성에 실패했습니다. 다시 시도해주세요.',
        });


        await this.mealPlanRepository.update(mealPlanId, {
          status: MealPlanStatus.FAILED,
        });

        console.error('apiError : ', apiError)
        // Handle OpenAI API-specific errors
        if (apiError.status === 429) {
          return { error: 'OpenAI API 요금 한도 초과: 요청 횟수가 너무 많습니다. 나중에 다시 시도해주세요.' };
        } else if (apiError.status === 401) {
          return { error: 'OpenAI API 인증 오류: API 키를 확인해주세요.' };
        } else if (apiError.status === 500) {
          return { error: 'OpenAI 서버 오류: 서비스가 현재 응답하지 않습니다. 나중에 다시 시도해주세요.' };
        } else {
          return { error: `OpenAI API 호출 중 오류 발생: ${apiError.message || '알 수 없는 오류'}` };
        }
      }

      job.progress(60);

      // Clean the response text
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();

      // Parse the JSON response
      try {
        const parsedResult: MealPlan = JSON.parse(cleanedText);
        // Basic validation of the response structure
        if (!parsedResult.mealPlanData || !Array.isArray(parsedResult.mealPlanData)) {
          return { error: '잘못된 응답 형식: 유효한 식단 데이터가 포함되지 않았습니다.' };
        }
        job.progress(100);
        return parsedResult;
      } catch (parseError: any) {
        return { error: `JSON 파싱 오류: 응답 데이터를 처리할 수 없습니다. 오류: ${parseError.message}` };
      }
    } catch (generalError: any) {
      // Catch any unexpected errors
      return { error: `식단 생성 중 예기치 않은 오류 발생: ${generalError.message || '알 수 없는 오류'}` };
    }
  }

  private calculateNutritionSummary(mealPlanData: any) {
    const dailyPlans = mealPlanData.mealPlanData;

    const totalCalories = dailyPlans.reduce((sum: number, day: any) => sum + day.totalCalories, 0);
    const avgCalories = totalCalories / dailyPlans.length;

    const totalNutrients = dailyPlans.reduce((acc: any, day: any) => {
      acc.protein += day.dailyNutrients.protein || 0;
      acc.carbs += day.dailyNutrients.carbs || 0;
      acc.fat += day.dailyNutrients.fat || 0;
      return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    return {
      averageCalories: Math.round(avgCalories),
      averageNutrients: {
        protein: Math.round(totalNutrients.protein / dailyPlans.length),
        carbs: Math.round(totalNutrients.carbs / dailyPlans.length),
        fat: Math.round(totalNutrients.fat / dailyPlans.length),
      },
      totalDays: dailyPlans.length,
    };
  }
}