import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { News } from '../entities/news.entity';

interface CreateNewsDto {
  title: string;
  content: string;
  imageUrl?: string;
  categoryId: number;
}

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<News[]> {
    return this.newsService.findAll();
  }

  @Get('latest')
  async findLatest(@Query('limit') limit?: number): Promise<News[]> {
    return this.newsService.findLatest(limit);
  }

  @Get('most-viewed')
  async findMostViewed(@Query('limit') limit?: number): Promise<News[]> {
    return this.newsService.findMostViewed(limit);
  }

  @Get('category/:id')
  async findByCategory(@Param('id') id: string): Promise<News[]> {
    return this.newsService.findByCategory(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<News> {
    const news = await this.newsService.findOne(+id);
    await this.newsService.incrementViewCount(+id);
    return news;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() newsData: CreateNewsDto, @Request() req): Promise<News> {
    return this.newsService.create(newsData, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() newsData: Partial<CreateNewsDto>
  ): Promise<News> {
    return this.newsService.update(+id, newsData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.newsService.delete(+id);
  }
} 