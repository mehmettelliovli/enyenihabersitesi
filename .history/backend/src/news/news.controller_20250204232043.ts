import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, UnauthorizedException, ParseIntPipe } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll() {
    return this.newsService.findAll();
  }

  @Get('latest')
  async findLatest(@Query('limit', ParseIntPipe) limit?: number) {
    return this.newsService.findLatest(limit);
  }

  @Get('most-viewed')
  async findMostViewed(@Query('limit', ParseIntPipe) limit?: number) {
    return this.newsService.findMostViewed(limit);
  }

  @Get('category/:id')
  async findByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findByCategory(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const news = await this.newsService.findOne(id);
    await this.newsService.incrementViewCount(id);
    return news;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AUTHOR')
  async create(@Body() createNewsDto: any, @Request() req) {
    return this.newsService.create(createNewsDto, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AUTHOR')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateNewsDto: any, @Request() req) {
    const news = await this.newsService.findOne(id);
    if (req.user.roles.some(role => role.name === 'AUTHOR') && news.author.id !== req.user.id) {
      throw new UnauthorizedException('You can only update your own news');
    }
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'AUTHOR')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const news = await this.newsService.findOne(id);
    if (req.user.roles.some(role => role.name === 'AUTHOR') && news.author.id !== req.user.id) {
      throw new UnauthorizedException('You can only delete your own news');
    }
    return this.newsService.delete(id);
  }
} 