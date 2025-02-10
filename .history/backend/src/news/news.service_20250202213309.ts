import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<News[]> {
    return this.newsRepository.find({
      where: { isActive: true },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { id, isActive: true },
      relations: ['author', 'category'],
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return news;
  }

  async create(newsData: any, author: User): Promise<News> {
    const { categoryId, ...rest } = newsData;
    
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId }
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const news = this.newsRepository.create({
      ...rest,
      category,
      author,
      isActive: true,
      viewCount: 0
    });

    return this.newsRepository.save(news);
  }

  async update(id: number, newsData: any): Promise<News> {
    const news = await this.findOne(id);
    const { categoryId, ...rest } = newsData;
    
    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId }
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      news.category = category;
    }

    Object.assign(news, rest);
    return this.newsRepository.save(news);
  }

  async delete(id: number): Promise<void> {
    const news = await this.findOne(id);
    news.isActive = false;
    await this.newsRepository.save(news);
  }

  async findMostViewed(limit: number = 5): Promise<News[]> {
    return this.newsRepository.find({
      where: { isActive: true },
      relations: ['author', 'category'],
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }

  async findByCategory(categoryId: number): Promise<News[]> {
    return this.newsRepository.find({
      where: { 
        category: { id: categoryId },
        isActive: true 
      },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async incrementViewCount(id: number): Promise<void> {
    const news = await this.findOne(id);
    news.viewCount += 1;
    await this.newsRepository.save(news);
  }

  async findLatest(limit: number = 5): Promise<News[]> {
    return this.newsRepository.find({
      where: { isActive: true },
      relations: ['author', 'category'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
} 