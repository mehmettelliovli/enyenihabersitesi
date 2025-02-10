import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  @Get('latest')
  async findLatest(@Query('limit') limit?: number) {
    return this.newsService.findLatest(limit);
  }

  @Get('most-viewed')
  async findMostViewed(@Query('limit') limit?: number) {
    return this.newsService.findMostViewed(limit);
  }

  @Get('category/:id')
  async findByCategory(@Param('id') id: string) {
    return this.newsService.findByCategory(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const news = await this.newsService.findOne(+id);
    await this.newsService.incrementViewCount(+id);
    return news;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() newsData: any, @Request() req) {
    return this.newsService.create(newsData, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() newsData: any) {
    return this.newsService.update(+id, newsData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.newsService.delete(+id);
  }
} 