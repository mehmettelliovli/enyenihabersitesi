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
        relations: {
          author: true,
          category: true
        },
        where: { isActive: true },
        order: { createdAt: 'DESC' },
        take: 5,
        select: {
          id: true,
          title: true,
          content: true,
          imageUrl: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          author: {
            id: true,
            fullName: true,
            email: true
          },
          category: {
            id: true,
            name: true
          }
        }
      }),
    ]);

    const topAuthors = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.news', 'news', 'news.isActive = :isActive', { isActive: true })
      .select([
        'user.id as id',
        'user.email as email',
        'user.fullName as fullName',
        'user.bio as bio',
        'user.profileImage as profileImage',
        'user.isActive as isActive',
        'COUNT(news.id) as newsCount'
      ])
      .where('user.isActive = :userActive', { userActive: true })
      .groupBy('user.id, user.email, user.fullName, user.bio, user.profileImage, user.isActive')
      .orderBy('newsCount', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalNews: newsCount,
      totalUsers: userCount,
      recentNews: latestNews.map(news => ({
        id: news.id,
        title: news.title,
        createdAt: news.createdAt
      })),
      topAuthors: topAuthors.map(author => ({
        id: author.id,
        fullName: author.fullName,
        newsCount: parseInt(author.newsCount)
      }))
    };
  }
}
