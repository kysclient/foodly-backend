import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from '../../database/entities/food.entity';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private foodRepository: Repository<Food>,
  ) {}

  async create(createFoodDto: CreateFoodDto): Promise<Food> {
    const food = this.foodRepository.create(createFoodDto);
    return this.foodRepository.save(food);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
  }) {
    const { page, limit, search, category } = options;
    const queryBuilder = this.foodRepository.createQueryBuilder('food')
      .leftJoinAndSelect('food.nutrition', 'nutrition');

    if (search) {
      queryBuilder.andWhere('food.name LIKE :search OR food.brand LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('food.category = :category', { category });
    }

    const [foods, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      foods,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Food> {
    const food = await this.foodRepository.findOne({
      where: { id },
      relations: ['nutrition'],
    });

    if (!food) {
      throw new NotFoundException(`Food with ID ${id} not found`);
    }

    return food;
  }

  async update(id: string, updateFoodDto: UpdateFoodDto): Promise<Food> {
    const food = await this.findOne(id);
    Object.assign(food, updateFoodDto);
    return this.foodRepository.save(food);
  }

  async remove(id: string): Promise<void> {
    const food = await this.findOne(id);
    await this.foodRepository.remove(food);
  }

  async findByBarcode(barcode: string): Promise<Food> {
    const food = await this.foodRepository.findOne({
      where: { barcode },
      relations: ['nutrition'],
    });

    if (!food) {
      throw new NotFoundException(`Food with barcode ${barcode} not found`);
    }

    return food;
  }
}