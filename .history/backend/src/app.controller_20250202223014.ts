import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-db')
  async testDb() {
    try {
      const result = await this.dataSource.query('SELECT NOW()');
      return { success: true, timestamp: result[0].now };
    } catch (error) {
      console.error('Database connection error:', error);
      return { success: false, error: error.message };
    }
  }
}
