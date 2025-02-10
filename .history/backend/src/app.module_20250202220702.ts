import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NewsModule } from './news/news.module';
import { CategoryModule } from './category/category.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { User } from './entities/user.entity';
import { News } from './entities/news.entity';
import { Category } from './entities/category.entity';
import { UserRoleMapping } from './entities/user-role-mapping.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, UserRoleMapping, News, Category],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false
        },
        logging: true,
        extra: {
          max: 20,
          connectionTimeoutMillis: 5000,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    NewsModule,
    CategoryModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
