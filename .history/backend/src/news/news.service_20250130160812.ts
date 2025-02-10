import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async findAll(): Promise<News[]> {
    return this.newsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async create(newsData: any, author: any): Promise<News> {
    const newNews = this.newsRepository.create({
      ...newsData,
      author,
    });
    const savedNews = await this.newsRepository.save(newNews);
    return Array.isArray(savedNews) ? savedNews[0] : savedNews;
  }

  async update(id: number, newsData: any): Promise<News> {
    await this.newsRepository.update(id, newsData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.newsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
  }

  async findMostViewed(): Promise<News[]> {
    return this.newsRepository.find({
      relations: ['author'],
      order: { viewCount: 'DESC' },
      take: 10,
    });
  }

  async findByCategory(category: string): Promise<News[]> {
    return this.newsRepository.find({
      where: { category },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.newsRepository.increment({ id }, 'viewCount', 1);
  }
} 