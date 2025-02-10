import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { initialSeed } from './seeds/initial.seed';

config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
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