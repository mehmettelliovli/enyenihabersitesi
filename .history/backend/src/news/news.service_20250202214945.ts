import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';

interface CreateNewsDto {
  title: string;
  content: string;
  imageUrl?: string;
  categoryId: number;
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<News[]> {
    try {
      return await this.newsRepository.find({
        where: { isActive: true },
        relations: ['author', 'category'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<News> {
    try {
      const news = await this.newsRepository.findOne({
        where: { id, isActive: true },
        relations: ['author', 'category'],
      });

      if (!news) {
        throw new NotFoundException(`Haber bulunamadı (ID: ${id})`);
      }

      return news;
    } catch (error) {
      console.error(`Error in findOne(${id}):`, error);
      throw error;
    }
  }

  async create(newsData: CreateNewsDto, author: User): Promise<News> {
    try {
      const { categoryId, ...rest } = newsData;
      
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId, isActive: true }
      });

      if (!category) {
        throw new NotFoundException(`Kategori bulunamadı (ID: ${categoryId})`);
      }

      const user = await this.userRepository.findOne({
        where: { id: author.id, isActive: true }
      });

      if (!user) {
        throw new UnauthorizedException('Kullanıcı aktif değil');
      }

      const news = this.newsRepository.create({
        ...rest,
        category,
        author: user,
        isActive: true,
        viewCount: 0
      });

      const savedNews = await this.newsRepository.save(news);
      return this.findOne(savedNews.id);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: number, newsData: Partial<CreateNewsDto>): Promise<News> {
    try {
      const news = await this.findOne(id);
      const { categoryId, ...rest } = newsData;
      
      if (categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: categoryId, isActive: true }
        });

        if (!category) {
          throw new NotFoundException(`Kategori bulunamadı (ID: ${categoryId})`);
        }

        news.category = category;
      }

      Object.assign(news, rest);
      await this.newsRepository.save(news);
      return this.findOne(news.id);
    } catch (error) {
      console.error(`Error in update(${id}):`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const news = await this.findOne(id);
      news.isActive = false;
      await this.newsRepository.save(news);
    } catch (error) {
      console.error(`Error in delete(${id}):`, error);
      throw error;
    }
  }

  async findMostViewed(limit: number = 5): Promise<News[]> {
    try {
      return await this.newsRepository.find({
        where: { isActive: true },
        relations: ['author', 'category'],
        order: { viewCount: 'DESC' },
        take: limit,
      });
    } catch (error) {
      console.error(`Error in findMostViewed(${limit}):`, error);
      throw error;
    }
  }

  async findByCategory(categoryId: number): Promise<News[]> {
    try {
      return await this.newsRepository.find({
        where: { 
          category: { id: categoryId, isActive: true },
          isActive: true 
        },
        relations: ['author', 'category'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error(`Error in findByCategory(${categoryId}):`, error);
      throw error;
    }
  }

  async incrementViewCount(id: number): Promise<void> {
    try {
      const news = await this.findOne(id);
      news.viewCount += 1;
      await this.newsRepository.save(news);
    } catch (error) {
      console.error(`Error in incrementViewCount(${id}):`, error);
      throw error;
    }
  }

  async findLatest(limit: number = 5): Promise<News[]> {
    try {
      return await this.newsRepository.find({
        where: { isActive: true },
        relations: ['author', 'category'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
    } catch (error) {
      console.error(`Error in findLatest(${limit}):`, error);
      throw error;
    }
  }
} 