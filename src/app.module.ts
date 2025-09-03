import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// 설정 파일들
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// 공통 모듈들
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// 기능 모듈들
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { FoodsModule } from './modules/foods/foods.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // 환경 설정
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 데이터베이스
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database')!,
      inject: [ConfigService],
    }),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtModuleOptions>('jwt');
        console.log('>>> JWT CONFIG:', jwtConfig); // 여기에 디버깅
        if (!jwtConfig) {
          throw new Error('JWT configuration not found');
        }
        return {
          secret: jwtConfig.secret,
          signOptions: jwtConfig.signOptions,
        };
      },
      inject: [ConfigService],
      global: true,
    }),

    // Redis & Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'meal-plan-generation' },
      { name: 'notifications' },
      { name: 'analytics' },
    ),

    // 캐싱
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5분
      max: 1000,
    }),

    // 스케줄링
    ScheduleModule.forRoot(),

    // 요청 제한
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1분
      limit: 100, // 1분당 100회
    }]),

    // 기능 모듈들
    AuthModule,
    UsersModule,
    MealPlanModule,
    NutritionModule,
    RecipesModule,
    FoodsModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
  ],
  providers: [
    // 글로벌 가드
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // 글로벌 인터셉터
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // 글로벌 필터
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }