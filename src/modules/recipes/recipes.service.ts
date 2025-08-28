import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private recipeIngredientRepository: Repository<RecipeIngredient>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto, userId: string): Promise<Recipe> {
    const recipe = this.recipeRepository.create({
      ...createRecipeDto,
      createdBy: userId,
    });
    
    const savedRecipe = await this.recipeRepository.save(recipe);

    if (createRecipeDto.ingredients) {
      const ingredients = createRecipeDto.ingredients.map(ingredient =>
        this.recipeIngredientRepository.create({
          ...ingredient,
          recipe: savedRecipe,
        })
      );
      await this.recipeIngredientRepository.save(ingredients);
    }

    return this.findOne(savedRecipe.id);
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
  }) {
    const { page, limit, search, category } = options;
    const queryBuilder = this.recipeRepository.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.food', 'food');

    if (search) {
      queryBuilder.andWhere('recipe.name LIKE :search OR recipe.description LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('recipe.category = :category', { category });
    }

    const [recipes, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string, page: number, limit: number) {
    const [recipes, total] = await this.recipeRepository.findAndCount({
      where: { createdBy: userId },
      relations: ['ingredients', 'ingredients.food'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({
      where: { id },
      relations: ['ingredients', 'ingredients.food'],
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto, userId: string): Promise<Recipe> {
    const recipe = await this.findOne(id);
    
    if (recipe.createdBy !== userId) {
      throw new ForbiddenException('You can only update your own recipes');
    }

    Object.assign(recipe, updateRecipeDto);
    await this.recipeRepository.save(recipe);

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const recipe = await this.findOne(id);
    
    if (recipe.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own recipes');
    }

    await this.recipeRepository.remove(recipe);
  }

  async addToFavorites(id: string, userId: string): Promise<Recipe> {
    const recipe = await this.findOne(id);
    // TODO: Implement favorites logic
    return recipe;
  }

  async removeFromFavorites(id: string, userId: string): Promise<Recipe> {
    const recipe = await this.findOne(id);
    // TODO: Implement favorites logic
    return recipe;
  }
}