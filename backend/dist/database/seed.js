"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const initial_seed_1 = require("./seeds/initial.seed");
(0, dotenv_1.config)();
const dataSource = new typeorm_1.DataSource({
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
        await (0, initial_seed_1.initialSeed)(dataSource);
        console.log('Initial seed completed');
        await dataSource.destroy();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};
runSeed();
//# sourceMappingURL=seed.js.map