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
      console.log('Fetching all news...');
      const news = await this.newsRepository.find({
        where: { isActive: true },
        relations: ['author', 'category'],
        order: { createdAt: 'DESC' },
      });
      console.log(`Found ${news.length} news items`);
      console.log('News items:', JSON.stringify(news, null, 2));
      return news;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<News> {
    try {
      console.log(`Fetching news with ID: ${id}`);
      const news = await this.newsRepository.findOne({
        where: { id, isActive: true },
        relations: ['author', 'category'],
      });

      if (!news) {
        console.log(`News with ID ${id} not found`);
        throw new NotFoundException(`Haber bulunamadı (ID: ${id})`);
      }

      console.log('Found news:', JSON.stringify(news, null, 2));
      return news;
    } catch (error) {
      console.error(`Error in findOne(${id}):`, error);
      throw error;
    }
  }

  async create(newsData: CreateNewsDto, author: User): Promise<News> {
    try {
      console.log('Creating news with data:', JSON.stringify(newsData, null, 2));
      const { categoryId, ...rest } = newsData;
      
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId, isActive: true }
      });

      if (!category) {
        console.log(`Category with ID ${categoryId} not found`);
        throw new NotFoundException(`Kategori bulunamadı (ID: ${categoryId})`);
      }

      const user = await this.userRepository.findOne({
        where: { id: author.id, isActive: true }
      });

      if (!user) {
        console.log(`User with ID ${author.id} not found or not active`);
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
      console.log('Created news:', JSON.stringify(savedNews, null, 2));
      return this.findOne(savedNews.id);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: number, newsData: Partial<CreateNewsDto>): Promise<News> {
    try {
      console.log(`Updating news ${id} with data:`, JSON.stringify(newsData, null, 2));
      const news = await this.findOne(id);
      const { categoryId, ...rest } = newsData;
      
      if (categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: categoryId, isActive: true }
        });

        if (!category) {
          console.log(`Category with ID ${categoryId} not found`);
          throw new NotFoundException(`Kategori bulunamadı (ID: ${categoryId})`);
        }

        news.category = category;
      }

      Object.assign(news, rest);
      const updatedNews = await this.newsRepository.save(news);
      console.log('Updated news:', JSON.stringify(updatedNews, null, 2));
      return this.findOne(news.id);
    } catch (error) {
      console.error(`Error in update(${id}):`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`Deleting news with ID: ${id}`);
      const news = await this.findOne(id);
      news.isActive = false;
      await this.newsRepository.save(news);
      console.log(`News with ID ${id} marked as inactive`);
    } catch (error) {
      console.error(`Error in delete(${id}):`, error);
      throw error;
    }
  }

  async findMostViewed(limit: number = 5): Promise<News[]> {
    try {
      console.log(`Fetching ${limit} most viewed news`);
      const news = await this.newsRepository.find({
        where: { isActive: true },
        relations: ['author', 'category'],
        order: { viewCount: 'DESC' },
        take: limit,
      });
      console.log(`Found ${news.length} most viewed news items`);
      return news;
    } catch (error) {
      console.error(`Error in findMostViewed(${limit}):`, error);
      throw error;
    }
  }

  async findByCategory(categoryId: number): Promise<News[]> {
    try {
      console.log(`Fetching news for category ${categoryId}`);
      const news = await this.newsRepository.find({
        where: { 
          category: { id: categoryId, isActive: true },
          isActive: true 
        },
        relations: ['author', 'category'],
        order: { createdAt: 'DESC' },
      });
      console.log(`Found ${news.length} news items for category ${categoryId}`);
      return news;
    } catch (error) {
      console.error(`Error in findByCategory(${categoryId}):`, error);
      throw error;
    }
  }

  async incrementViewCount(id: number): Promise<void> {
    try {
      console.log(`Incrementing view count for news ${id}`);
      const news = await this.findOne(id);
      news.viewCount += 1;
      await this.newsRepository.save(news);
      console.log(`View count incremented for news ${id}`);
    } catch (error) {
      console.error(`Error in incrementViewCount(${id}):`, error);
      throw error;
    }
  }

  async findLatest(limit: number = 5): Promise<News[]> {
    try {
      console.log(`Fetching ${limit} latest news`);
      const news = await this.newsRepository.find({
        where: { isActive: true },
        relations: ['author', 'category'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
      console.log(`Found ${news.length} latest news items`);
      return news;
    } catch (error) {
      console.error(`Error in findLatest(${limit}):`, error);
      throw error;
    }
  }
} 