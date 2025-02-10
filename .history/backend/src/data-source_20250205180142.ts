import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { News } from './entities/news.entity';
import { Category } from './entities/category.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  entities: [User, Role, News, Category],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });