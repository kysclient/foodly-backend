import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationUtil } from '../../common/utils/pagination.util';

@ApiTags('recipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: '새 레시피 생성' })
  create(@Body() createRecipeDto: CreateRecipeDto, @Request() req) {
    return this.recipesService.create(createRecipeDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '레시피 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  findAll(@Query() query: any) {
    const { page, limit } = PaginationUtil.getPaginationParams(query);
    return this.recipesService.findAll({
      page,
      limit,
      search: query.search,
      category: query.category,
    });
  }

  @Get('my')
  @ApiOperation({ summary: '내 레시피 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMyRecipes(@Query() query: any, @Request() req) {
    const { page, limit } = PaginationUtil.getPaginationParams(query);
    return this.recipesService.findByUser(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 레시피 조회' })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '레시피 수정' })
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Request() req,
  ) {
    return this.recipesService.update(id, updateRecipeDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '레시피 삭제' })
  remove(@Param('id') id: string, @Request() req) {
    return this.recipesService.remove(id, req.user.id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: '레시피 즐겨찾기 추가' })
  addToFavorites(@Param('id') id: string, @Request() req) {
    return this.recipesService.addToFavorites(id, req.user.id);
  }

  @Delete(':id/favorite')
  @ApiOperation({ summary: '레시피 즐겨찾기 제거' })
  removeFromFavorites(@Param('id') id: string, @Request() req) {
    return this.recipesService.removeFromFavorites(id, req.user.id);
  }
}