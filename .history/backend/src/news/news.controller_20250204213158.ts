import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll(@Request() req) {
    if (req.user.role === UserRole.AUTHOR) {
      return this.newsService.findByAuthor(req.user.id);
    }
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
  async findOne(@Param('id') id: string, @Request() req) {
    const news = await this.newsService.findOne(+id);
    if (req.user.role === UserRole.AUTHOR && news.author.id !== req.user.id) {
      throw new UnauthorizedException('You can only view your own news');
    }
    await this.newsService.incrementViewCount(+id);
    return news;
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUTHOR)
  async create(@Body() createNewsDto: any, @Request() req) {
    return this.newsService.create(createNewsDto, req.user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNewsDto: any, @Request() req) {
    const news = await this.newsService.findOne(+id);
    if (req.user.role === UserRole.AUTHOR && news.author.id !== req.user.id) {
      throw new UnauthorizedException('You can only update your own news');
    }
    return this.newsService.update(+id, updateNewsDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const news = await this.newsService.findOne(+id);
    if (req.user.role === UserRole.AUTHOR && news.author.id !== req.user.id) {
      throw new UnauthorizedException('You can only delete your own news');
    }
    return this.newsService.delete(+id);
  }
} 