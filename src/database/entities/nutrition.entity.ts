import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Food } from './food.entity';

@Entity('nutrition')
export class Nutrition extends BaseEntity {
  @Column()
  foodId: string;

  @ManyToOne(() => Food, food => food.nutrition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'foodId' })
  food: Food;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  calories: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  protein: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  carbohydrates: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  fat: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  fiber: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  sugar: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  sodium: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  cholesterol: number;

  @Column({ type: 'json', nullable: true })
  vitamins?: any;

  @Column({ type: 'json', nullable: true })
  minerals?: any;
}