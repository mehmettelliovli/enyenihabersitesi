import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from '../entities/news.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([News, Category, User])
  ],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {} 