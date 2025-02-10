import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { UserRoleMapping } from './entities/user-role-mapping.entity';
import { News } from './entities/news.entity';
import { Category } from './entities/category.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://neondb_owner:npg_G6Y0NZFjpTVt@ep-still-tree-a968kvqw-pooler.gwc.azure.neon.tech/neondb?sslmode=require',
      entities: [User, UserRoleMapping, News, Category],
      synchronize: true,
      ssl: true,
    }),
    TypeOrmModule.forFeature([User, UserRoleMapping, News, Category]),
    AuthModule,
    UsersModule,
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
