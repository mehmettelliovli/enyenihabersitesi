import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';
import { User } from './entities/user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDashboardStats() {
    const [totalNews, totalUsers, recentNews, authors] = await Promise.all([
      this.newsRepository.count(),
      this.userRepository.count(),
      this.newsRepository.find({
        relations: ['author'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.userRepository
        .createQueryBuilder('user')
        .loadRelationCountAndMap('user.newsCount', 'user.news')
        .orderBy('user.newsCount', 'DESC')
        .take(5)
        .getMany(),
    ]);

    return {
      totalNews,
      totalUsers,
      recentNews: recentNews.map(news => ({
        id: news.id,
        title: news.title,
        createdAt: news.createdAt,
      })),
      topAuthors: authors.map(author => ({
        id: author.id,
        fullName: author.fullName,
        newsCount: author['newsCount'] || 0,
      })),
    };
  }
}
