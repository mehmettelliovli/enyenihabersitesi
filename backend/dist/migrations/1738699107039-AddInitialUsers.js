"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddInitialUsers1738699107039 = void 0;
const bcrypt = require("bcryptjs");
class AddInitialUsers1738699107039 {
    async up(queryRunner) {
        const superAdminPassword = await bcrypt.hash('mehmet61', 10);
        await queryRunner.query(`
            INSERT INTO "users" (email, password, "fullName", "isActive") 
            VALUES ($1, $2, $3, true)
        `, ['mehmet_developer@hotmail.com', superAdminPassword, 'Mehmet Developer']);
        const superAdminRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE name = 'SUPER_ADMIN'
        `);
        const superAdmin = await queryRunner.query(`
            SELECT id FROM "users" WHERE email = 'mehmet_developer@hotmail.com'
        `);
        await queryRunner.query(`
            INSERT INTO "user_roles" (user_id, role_id)
            VALUES ($1, $2)
        `, [superAdmin[0].id, superAdminRole[0].id]);
        const adminPassword = await bcrypt.hash('admin123', 10);
        await queryRunner.query(`
            INSERT INTO "users" (email, password, "fullName", "isActive") 
            VALUES ($1, $2, $3, true)
        `, ['admin@tellioglu.com', adminPassword, 'Admin User']);
        const adminRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE name = 'ADMIN'
        `);
        const admin = await queryRunner.query(`
            SELECT id FROM "users" WHERE email = 'admin@tellioglu.com'
        `);
        await queryRunner.query(`
            INSERT INTO "user_roles" (user_id, role_id)
            VALUES ($1, $2)
        `, [admin[0].id, adminRole[0].id]);
        const authors = [
            {
                email: 'yazar1@tellioglu.com',
                password: await bcrypt.hash('yazar123', 10),
                fullName: 'Birinci Yazar'
            },
            {
                email: 'yazar2@tellioglu.com',
                password: await bcrypt.hash('yazar123', 10),
                fullName: 'İkinci Yazar'
            }
        ];
        const authorRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE name = 'AUTHOR'
        `);
        for (const author of authors) {
            await queryRunner.query(`
                INSERT INTO "users" (email, password, "fullName", "isActive") 
                VALUES ($1, $2, $3, true)
            `, [author.email, author.password, author.fullName]);
            const addedAuthor = await queryRunner.query(`
                SELECT id FROM "users" WHERE email = $1
            `, [author.email]);
            await queryRunner.query(`
                INSERT INTO "user_roles" (user_id, role_id)
                VALUES ($1, $2)
            `, [addedAuthor[0].id, authorRole[0].id]);
        }
        const categories = [
            { name: 'Teknoloji', description: 'Teknoloji haberleri' },
            { name: 'Spor', description: 'Spor haberleri' },
            { name: 'Ekonomi', description: 'Ekonomi haberleri' },
            { name: 'Sağlık', description: 'Sağlık haberleri' },
            { name: 'Kültür Sanat', description: 'Kültür ve sanat haberleri' }
        ];
        for (const category of categories) {
            await queryRunner.query(`
                INSERT INTO "categories" (name, description, "isActive")
                VALUES ($1, $2, true)
            `, [category.name, category.description]);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "categories"`);
        await queryRunner.query(`DELETE FROM "user_roles"`);
        await queryRunner.query(`DELETE FROM "users" WHERE email IN (
            'mehmet_developer@hotmail.com',
            'admin@tellioglu.com',
            'yazar1@tellioglu.com',
            'yazar2@tellioglu.com'
        )`);
    }
}
exports.AddInitialUsers1738699107039 = AddInitialUsers1738699107039;
//# sourceMappingURL=1738699107039-AddInitialUsers.js.map