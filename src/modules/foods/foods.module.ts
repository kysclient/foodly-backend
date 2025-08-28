import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { Food } from '../../database/entities/food.entity';
import { Nutrition } from '../../database/entities/nutrition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Food, Nutrition])],
  controllers: [FoodsController],
  providers: [FoodsService],
  exports: [FoodsService],
})
export class FoodsModule {}