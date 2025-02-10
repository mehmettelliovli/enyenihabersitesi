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
    const [newsCount, userCount, latestNews] = await Promise.all([
      this.newsRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { isActive: true } }),
      this.newsRepository.find({
        where: { isActive: true },
        relations: ['author'],
        order: { createdAt: 'DESC' },
        take: 5,
      })
    ]);

    const topAuthors = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.news', 'news')
      .select([
        'user.id as id',
        'user.email as email',
        'user.fullName as "fullName"',
        'COUNT(news.id) as "newsCount"'
      ])
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('news.isActive = :newsActive', { newsActive: true })
      .groupBy('user.id')
      .orderBy('"newsCount"', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      newsCount,
      userCount,
      latestNews,
      topAuthors
    };
  }
}
