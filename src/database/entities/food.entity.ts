import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Nutrition } from './nutrition.entity';

@Entity('foods')
@Index(['name'])
export class Food extends BaseEntity {
    @Column()
    name: string;

    @Column({ nullable: true })
    nameEn?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    category: string;

    @Column({ nullable: true })
    brand?: string;

    @Column({ nullable: true })
    barcode?: string;

    @Column({ type: 'decimal', precision: 8, scale: 2 })
    servingSize: number;

    @Column()
    servingUnit: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @Column({ type: 'json', nullable: true })
    tags?: string[];

    @OneToMany(() => Nutrition, nutrition => nutrition.food, { cascade: true })
    nutrition: Nutrition[];
}