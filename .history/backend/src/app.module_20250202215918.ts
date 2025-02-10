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
import { News } from './entities/news.entity';
import { Category } from './entities/category.entity';
import { UserRoleMapping } from './entities/user-role-mapping.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, UserRoleMapping, News, Category],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false
      },
      logging: ['error', 'warn']
    }),
    AuthModule,
    UsersModule,
    NewsModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
