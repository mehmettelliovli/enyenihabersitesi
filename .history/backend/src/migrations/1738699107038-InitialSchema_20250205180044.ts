import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1738699107038 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Roles tablosu
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR UNIQUE NOT NULL,
                "description" VARCHAR
            )
        `);

        // Users tablosu
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL PRIMARY KEY,
                "email" VARCHAR UNIQUE NOT NULL,
                "password" VARCHAR NOT NULL,
                "fullName" VARCHAR NOT NULL,
                "bio" VARCHAR,
                "profileImage" VARCHAR,
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // User_roles tablosu (many-to-many ilişki)
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "user_id" INTEGER NOT NULL,
                "role_id" INTEGER NOT NULL,
                CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id"),
                CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("role_id") 
                    REFERENCES "roles"("id") ON DELETE CASCADE
            )
        `);

        // Categories tablosu
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR NOT NULL,
                "description" VARCHAR,
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // News tablosu
        await queryRunner.query(`
            CREATE TABLE "news" (
                "id" SERIAL PRIMARY KEY,
                "title" VARCHAR NOT NULL,
                "content" TEXT NOT NULL,
                "imageUrl" VARCHAR,
                "viewCount" INTEGER DEFAULT 0,
                "isActive" BOOLEAN DEFAULT true,
                "authorId" INTEGER NOT NULL,
                "categoryId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "FK_news_author" FOREIGN KEY ("authorId") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_news_category" FOREIGN KEY ("categoryId") 
                    REFERENCES "categories"("id") ON DELETE CASCADE
            )
        `);

        // Temel rolleri ekle
        await queryRunner.query(`
            INSERT INTO "roles" (name, description) VALUES
            ('SUPER_ADMIN', 'Tüm yetkilere sahip süper yönetici'),
            ('ADMIN', 'Yönetici'),
            ('AUTHOR', 'Yazar'),
            ('USER', 'Normal kullanıcı')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "news"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }
} 