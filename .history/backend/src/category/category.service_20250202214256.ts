import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

interface CreateCategoryDto {
  name: string;
  description?: string;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async create(categoryData: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      ...categoryData,
      isActive: true,
    });

    return this.categoryRepository.save(category);
  }

  async update(id: number, categoryData: Partial<CreateCategoryDto>): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, categoryData);
    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<void> {
    const category = await this.findOne(id);
    category.isActive = false;
    await this.categoryRepository.save(category);
  }
} 