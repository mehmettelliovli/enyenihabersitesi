import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { News } from '../entities/news.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<News[]> {
    return this.newsRepository.createQueryBuilder('news')
      .leftJoinAndSelect('news.author', 'author')
      .leftJoinAndSelect('news.category', 'category')
      .where('news.isActive = :isActive', { isActive: true })
      .orderBy('news.createdAt', 'DESC')
      .select([
        'news.id',
        'news.title',
        'news.content',
        'news.imageUrl',
        'news.viewCount',
        'news.createdAt',
        'news.updatedAt',
        'news.isActive',
        'author.id',
        'author.fullName',
        'author.email',
        'category.id',
        'category.name'
      ])
      .getMany();
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.createQueryBuilder('news')
      .leftJoinAndSelect('news.author', 'author')
      .leftJoinAndSelect('news.category', 'category')
      .where('news.id = :id', { id })
      .andWhere('news.isActive = :isActive', { isActive: true })
      .select([
        'news.id',
        'news.title',
        'news.content',
        'news.imageUrl',
        'news.viewCount',
        'news.createdAt',
        'news.updatedAt',
        'news.isActive',
        'author.id',
        'author.fullName',
        'author.email',
        'category.id',
        'category.name'
      ])
      .getOne();

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    return news;
  }

  async create(newsData: any, author: any): Promise<News> {
    const { categoryId, ...rest } = newsData;
    
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId }
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const newsToCreate: DeepPartial<News> = {
      ...rest,
      category,
      author,
      isActive: true,
      viewCount: 0
    };

    const newNews = this.newsRepository.create(newsToCreate);
    const savedNews = await this.newsRepository.save(newNews);
    
    return this.findOne(savedNews.id);
  }

  async update(id: number, newsData: any): Promise<News> {
    const { categoryId, ...rest } = newsData;
    
    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId }
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      rest.category = category;
    }

    await this.newsRepository.update(id, rest);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const news = await this.newsRepository.findOne({
      where: { id, isActive: true }
    });

    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }

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
    const news = await this.newsRepository.findOne({
      where: { id }
    });
    if (news) {
      news.viewCount += 1;
      await this.newsRepository.save(news);
    }
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