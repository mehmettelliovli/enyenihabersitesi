import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { CategoryModule } from './category/category.module';
import { User } from './entities/user.entity';
import { UserRoleMapping } from './entities/user-role-mapping.entity';
import { News } from './entities/news.entity';
import { Category } from './entities/category.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'news_db',
      entities: [User, News, Category, UserRoleMapping],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    UsersModule,
    NewsModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }
}
