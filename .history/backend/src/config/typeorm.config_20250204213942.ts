import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { News } from '../entities/news.entity';
import { Category } from '../entities/category.entity';
import { InitialSetup1709999999999 } from '../migrations/1709999999999-InitialSetup';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'news_db',
  entities: [User, News, Category],
  migrations: [InitialSetup1709999999999],
  synchronize: false,
}); 