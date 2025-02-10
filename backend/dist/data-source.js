"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const news_entity_1 = require("./entities/news.entity");
const category_entity_1 = require("./entities/category.entity");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    entities: [user_entity_1.User, role_entity_1.Role, news_entity_1.News, category_entity_1.Category],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: true
});
exports.AppDataSource.initialize()
    .then(() => {
    console.log('Data Source has been initialized!');
})
    .catch((err) => {
    console.error('Error during Data Source initialization:', err);
});
//# sourceMappingURL=data-source.js.map