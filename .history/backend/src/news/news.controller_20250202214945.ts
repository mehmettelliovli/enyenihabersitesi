import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, HttpException, HttpStatus } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { News } from '../entities/news.entity';

interface CreateNewsDto {
  title: string;
  content: string;
  imageUrl?: string;
  categoryId: number;
}

@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @Roles('admin', 'editor')
  async findAll(): Promise<News[]> {
    try {
      return await this.newsService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Haberler yüklenirken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('latest')
  async findLatest(@Query('limit') limit?: number): Promise<News[]> {
    try {
      return await this.newsService.findLatest(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Son haberler yüklenirken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('most-viewed')
  async findMostViewed(@Query('limit') limit?: number): Promise<News[]> {
    try {
      return await this.newsService.findMostViewed(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'En çok okunan haberler yüklenirken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('category/:id')
  async findByCategory(@Param('id') id: string): Promise<News[]> {
    try {
      return await this.newsService.findByCategory(+id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Kategori haberleri yüklenirken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<News> {
    try {
      const news = await this.newsService.findOne(+id);
      await this.newsService.incrementViewCount(+id);
      return news;
    } catch (error) {
      throw new HttpException(
        error.message || 'Haber yüklenirken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @Roles('admin', 'editor')
  async create(@Body() newsData: CreateNewsDto, @Request() req): Promise<News> {
    try {
      if (!newsData.title || !newsData.content || !newsData.categoryId) {
        throw new HttpException(
          'Başlık, içerik ve kategori zorunludur',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.newsService.create(newsData, req.user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Haber oluşturulurken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @Roles('admin', 'editor')
  async update(
    @Param('id') id: string,
    @Body() newsData: Partial<CreateNewsDto>
  ): Promise<News> {
    try {
      return await this.newsService.update(+id, newsData);
    } catch (error) {
      throw new HttpException(
        error.message || 'Haber güncellenirken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      return await this.newsService.delete(+id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Haber silinirken bir hata oluştu',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 