import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Food } from '../../database/entities/food.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeIngredient, Food])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}