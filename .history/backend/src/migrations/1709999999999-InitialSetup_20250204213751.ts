import { MigrationInterface, QueryRunner } from "typeorm";
import { UserRole } from "../entities/user.entity";
import * as bcrypt from 'bcrypt';

export class InitialSetup1709999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Categories tablosunu oluştur
        await queryRunner.query(`
            CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Users tablosunu oluştur
        await queryRunner.query(`
            CREATE TYPE user_role_enum AS ENUM ('super_admin', 'admin', 'author');
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR UNIQUE NOT NULL,
                password VARCHAR NOT NULL,
                "fullName" VARCHAR NOT NULL,
                bio TEXT,
                "profileImage" VARCHAR,
                role user_role_enum DEFAULT 'author',
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // News tablosunu oluştur
        await queryRunner.query(`
            CREATE TABLE news (
                id SERIAL PRIMARY KEY,
                title VARCHAR NOT NULL,
                content TEXT NOT NULL,
                "imageUrl" VARCHAR,
                "viewCount" INTEGER DEFAULT 0,
                "isActive" BOOLEAN DEFAULT true,
                "authorId" INTEGER REFERENCES users(id),
                "categoryId" INTEGER REFERENCES categories(id),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Örnek kategoriler ekle
        await queryRunner.query(`
            INSERT INTO categories (name) VALUES 
            ('Teknoloji'),
            ('Spor'),
            ('Ekonomi'),
            ('Sağlık'),
            ('Eğitim')
        `);

        // Super admin kullanıcısı oluştur
        const hashedPassword = await bcrypt.hash('mehmet61', 10);
        await queryRunner.query(`
            INSERT INTO users (email, password, "fullName", role, bio, "profileImage") 
            VALUES (
                'mehmet_developer@hotmail.com',
                '${hashedPassword}',
                'Mehmet Developer',
                'super_admin',
                'Full Stack Developer & Tech Lead',
                'https://avatars.githubusercontent.com/u/1234567'
            )
        `);

        // Örnek admin ve yazarlar ekle
        const adminPassword = await bcrypt.hash('admin123', 10);
        const authorPassword = await bcrypt.hash('author123', 10);

        await queryRunner.query(`
            INSERT INTO users (email, password, "fullName", role, bio, "profileImage") 
            VALUES 
            (
                'admin@example.com',
                '${adminPassword}',
                'John Admin',
                'admin',
                'Senior Content Manager',
                'https://randomuser.me/api/portraits/men/1.jpg'
            ),
            (
                'tech.writer@example.com',
                '${authorPassword}',
                'Alice Tech',
                'author',
                'Technology Writer & AI Enthusiast',
                'https://randomuser.me/api/portraits/women/1.jpg'
            ),
            (
                'sports.writer@example.com',
                '${authorPassword}',
                'Bob Sports',
                'author',
                'Sports Journalist & Former Athlete',
                'https://randomuser.me/api/portraits/men/2.jpg'
            )
        `);

        // Örnek haberler ekle
        await queryRunner.query(`
            INSERT INTO news (title, content, "imageUrl", "authorId", "categoryId")
            VALUES 
            (
                'Yapay Zeka Teknolojisinde Çığır Açan Gelişme',
                'Bilim insanları, insan beyninin çalışma prensiplerini taklit eden yeni bir yapay zeka modeli geliştirdi. Bu gelişme, yapay zekanın geleceği için önemli bir adım olarak görülüyor...',
                'https://picsum.photos/800/400?random=1',
                3,
                1
            ),
            (
                'Süper Lig''de Şampiyonluk Yarışı Kızışıyor',
                'Ligin son haftalarına girilirken şampiyonluk yarışı büyük heyecana sahne oluyor. Takımlar arasındaki puan farkı giderek kapanıyor...',
                'https://picsum.photos/800/400?random=2',
                4,
                2
            ),
            (
                'Ekonomide Yeni Dönem Başlıyor',
                'Merkez Bankası''nın aldığı son kararlar ve piyasalardaki gelişmeler, ekonomide yeni bir dönemin başlangıcına işaret ediyor...',
                'https://picsum.photos/800/400?random=3',
                3,
                3
            ),
            (
                'Sağlıklı Yaşam İçin Önemli İpuçları',
                'Uzmanlar, günlük hayatta uygulanabilecek basit ama etkili sağlıklı yaşam önerilerini paylaştı...',
                'https://picsum.photos/800/400?random=4',
                4,
                4
            ),
            (
                'Eğitimde Dijital Dönüşüm',
                'Pandemi sonrası eğitim sisteminde kalıcı değişiklikler yaşanıyor. Uzaktan eğitim ve hibrit modeller yaygınlaşıyor...',
                'https://picsum.photos/800/400?random=5',
                3,
                5
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE news`);
        await queryRunner.query(`DROP TABLE users`);
        await queryRunner.query(`DROP TYPE user_role_enum`);
        await queryRunner.query(`DROP TABLE categories`);
    }
} 