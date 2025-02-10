import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class AddInitialUsers1738699107039 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Super Admin kullanıcısı
        const superAdminPassword = await bcrypt.hash('mehmet61', 10);
        await queryRunner.query(`
            INSERT INTO "users" (email, password, "fullName", "isActive") 
            VALUES ($1, $2, $3, true)
        `, ['mehmet_developer@hotmail.com', superAdminPassword, 'Mehmet Developer']);

        // Super Admin rolünü al
        const superAdminRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE name = 'SUPER_ADMIN'
        `);

        // Super Admin kullanıcısını al
        const superAdmin = await queryRunner.query(`
            SELECT id FROM "users" WHERE email = 'mehmet_developer@hotmail.com'
        `);

        // Super Admin rolünü ata
        await queryRunner.query(`
            INSERT INTO "user_roles" (user_id, role_id)
            VALUES ($1, $2)
        `, [superAdmin[0].id, superAdminRole[0].id]);

        // Örnek Admin kullanıcısı
        const adminPassword = await bcrypt.hash('admin123', 10);
        await queryRunner.query(`
            INSERT INTO "users" (email, password, "fullName", "isActive") 
            VALUES ($1, $2, $3, true)
        `, ['admin@tellioglu.com', adminPassword, 'Admin User']);

        // Admin rolünü al
        const adminRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE name = 'ADMIN'
        `);

        // Admin kullanıcısını al
        const admin = await queryRunner.query(`
            SELECT id FROM "users" WHERE email = 'admin@tellioglu.com'
        `);

        // Admin rolünü ata
        await queryRunner.query(`
            INSERT INTO "user_roles" (user_id, role_id)
            VALUES ($1, $2)
        `, [admin[0].id, adminRole[0].id]);

        // Örnek Yazar kullanıcıları
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

        // Author rolünü al
        const authorRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE name = 'AUTHOR'
        `);

        for (const author of authors) {
            // Yazar kullanıcısını ekle
            await queryRunner.query(`
                INSERT INTO "users" (email, password, "fullName", "isActive") 
                VALUES ($1, $2, $3, true)
            `, [author.email, author.password, author.fullName]);

            // Eklenen yazarı al
            const addedAuthor = await queryRunner.query(`
                SELECT id FROM "users" WHERE email = $1
            `, [author.email]);

            // Yazar rolünü ata
            await queryRunner.query(`
                INSERT INTO "user_roles" (user_id, role_id)
                VALUES ($1, $2)
            `, [addedAuthor[0].id, authorRole[0].id]);
        }

        // Örnek kategoriler
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Kategorileri sil
        await queryRunner.query(`DELETE FROM "categories"`);
        
        // Kullanıcı rollerini sil
        await queryRunner.query(`DELETE FROM "user_roles"`);
        
        // Kullanıcıları sil
        await queryRunner.query(`DELETE FROM "users" WHERE email IN (
            'mehmet_developer@hotmail.com',
            'admin@tellioglu.com',
            'yazar1@tellioglu.com',
            'yazar2@tellioglu.com'
        )`);
    }
} 