import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Recipe } from './recipe.entity';
import { Food } from '../../../database/entities/food.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient extends BaseEntity {
  @Column()
  amount: number;

  @Column({ nullable: true })
  unit: string; // grams, pieces, cups, etc.

  @Column({ nullable: true })
  notes: string; // preparation notes like "chopped", "diced"

  @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  @Column()
  recipeId: string;

  @ManyToOne(() => Food, { eager: true })
  @JoinColumn({ name: 'foodId' })
  food: Food;

  @Column()
  foodId: string;
}