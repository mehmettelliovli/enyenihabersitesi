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
    const [newsCount, userCount, latestNews, topAuthors] = await Promise.all([
      this.newsRepository.count(),
      this.userRepository.count(),
      this.newsRepository.find({
        relations: ['author'],
        order: { createdAt: 'DESC' },
        take: 5,
      }),
      this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.news', 'news')
        .select(['user.id', 'user.email', 'user.fullName', 'user.bio', 'user.profileImage', 'user.isActive'])
        .addSelect('COUNT(news.id)', 'newsCount')
        .groupBy('user.id')
        .orderBy('newsCount', 'DESC')
        .limit(5)
        .getRawMany(),
    ]);

    return {
      newsCount,
      userCount,
      latestNews,
      topAuthors,
    };
  }
}
