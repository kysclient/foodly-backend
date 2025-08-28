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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/entities/user.entity';
import { PaginationUtil } from '../../common/utils/pagination.util';

@ApiTags('foods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '새 식품 추가 (관리자 전용)' })
  create(@Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(createFoodDto);
  }

  @Get()
  @ApiOperation({ summary: '식품 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  findAll(@Query() query: any) {
    const { page, limit } = PaginationUtil.getPaginationParams(query);
    return this.foodsService.findAll({
      page,
      limit,
      search: query.search,
      category: query.category,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 식품 조회' })
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: '식품 정보 수정 (관리자 전용)' })
  update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodsService.update(id, updateFoodDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: '식품 삭제 (관리자 전용)' })
  remove(@Param('id') id: string) {
    return this.foodsService.remove(id);
  }

  @Get('search/barcode/:barcode')
  @ApiOperation({ summary: '바코드로 식품 검색' })
  findByBarcode(@Param('barcode') barcode: string) {
    return this.foodsService.findByBarcode(barcode);
  }
}