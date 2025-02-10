import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { initialSeed } from './seeds/initial.seed';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/entities/*.entity.ts'],
  synchronize: true,
});

const runSeed = async () => {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    console.log('Running initial seed...');
    await initialSeed(dataSource);
    console.log('Initial seed completed');

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

runSeed(); 