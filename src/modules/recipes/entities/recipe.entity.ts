import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Entity('recipes')
export class Recipe extends BaseEntity {
  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('json')
  instructions: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  prepTime: number; // in minutes

  @Column({ default: 0 })
  cookTime: number; // in minutes

  @Column({ default: 1 })
  servings: number;

  @Column({ nullable: true })
  difficulty: string; // easy, medium, hard

  @Column({ nullable: true })
  imageUrl: string;

  @Column('json', { nullable: true })
  tags: string[];

  @Column()
  createdBy: string; // user id

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  ratingCount: number;

  @OneToMany(() => RecipeIngredient, (ingredient) => ingredient.recipe, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  ingredients: RecipeIngredient[];

}