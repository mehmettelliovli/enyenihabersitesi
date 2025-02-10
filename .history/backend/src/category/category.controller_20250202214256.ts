import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Category } from '../entities/category.entity';

interface CreateCategoryDto {
  name: string;
  description?: string;
}

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() categoryData: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(categoryData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() categoryData: Partial<CreateCategoryDto>
  ): Promise<Category> {
    return this.categoryService.update(+id, categoryData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.delete(+id);
  }
} 