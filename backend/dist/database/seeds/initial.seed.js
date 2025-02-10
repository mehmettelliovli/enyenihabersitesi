"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialSeed = void 0;
const user_entity_1 = require("../../entities/user.entity");
const news_entity_1 = require("../../entities/news.entity");
const category_entity_1 = require("../../entities/category.entity");
const role_entity_1 = require("../../entities/role.entity");
const bcrypt = require("bcryptjs");
const initialSeed = async (dataSource) => {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const categoryRepository = dataSource.getRepository(category_entity_1.Category);
    const newsRepository = dataSource.getRepository(news_entity_1.News);
    const roleRepository = dataSource.getRepository(role_entity_1.Role);
    const categories = await categoryRepository.save([
        { name: 'Teknoloji', isActive: true },
        { name: 'Spor', isActive: true },
        { name: 'Ekonomi', isActive: true },
        { name: 'Sağlık', isActive: true },
        { name: 'Kültür Sanat', isActive: true }
    ]);
    const superAdminRole = await roleRepository.findOne({ where: { name: 'SUPER_ADMIN' } });
    const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
    const authorRole = await roleRepository.findOne({ where: { name: 'AUTHOR' } });
    const superAdminExists = await userRepository.findOne({
        where: { email: 'superadmin@example.com' }
    });
    if (!superAdminExists) {
        const superAdmin = new user_entity_1.User();
        superAdmin.email = 'superadmin@example.com';
        superAdmin.fullName = 'Super Admin';
        superAdmin.password = await bcrypt.hash('superadmin123', 10);
        superAdmin.roles = [superAdminRole];
        await userRepository.save(superAdmin);
    }
    const adminExists = await userRepository.findOne({
        where: { email: 'admin@example.com' }
    });
    if (!adminExists) {
        const admin = new user_entity_1.User();
        admin.email = 'admin@example.com';
        admin.fullName = 'Admin User';
        admin.password = await bcrypt.hash('admin123', 10);
        admin.roles = [adminRole];
        await userRepository.save(admin);
    }
    const authors = [
        {
            email: 'author1@example.com',
            fullName: 'Yazar Bir',
            password: 'author123'
        },
        {
            email: 'author2@example.com',
            fullName: 'Yazar İki',
            password: 'author123'
        }
    ];
    for (const authorData of authors) {
        const authorExists = await userRepository.findOne({
            where: { email: authorData.email }
        });
        if (!authorExists) {
            const author = new user_entity_1.User();
            author.email = authorData.email;
            author.fullName = authorData.fullName;
            author.password = await bcrypt.hash(authorData.password, 10);
            author.roles = [authorRole];
            await userRepository.save(author);
        }
    }
    const existingNews = await newsRepository.find();
    if (existingNews.length === 0) {
        await newsRepository.save([
            {
                title: 'Yapay Zeka Teknolojisinde Yeni Gelişme',
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                imageUrl: 'https://picsum.photos/800/400',
                category: categories[0],
                author: authors[0],
                viewCount: 150,
                isActive: true
            },
            {
                title: 'Sağlıklı Yaşam İçin Öneriler',
                content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                imageUrl: 'https://picsum.photos/800/400',
                category: categories[3],
                author: authors[1],
                viewCount: 120,
                isActive: true
            },
            {
                title: 'Ekonomide Son Gelişmeler',
                content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
                imageUrl: 'https://picsum.photos/800/400',
                category: categories[2],
                author: authors[0],
                viewCount: 200,
                isActive: true
            }
        ]);
    }
};
exports.initialSeed = initialSeed;
//# sourceMappingURL=initial.seed.js.map