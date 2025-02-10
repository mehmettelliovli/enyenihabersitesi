import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolesAndUserRoles1738699107038 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Roles tablosunu oluştur
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR UNIQUE NOT NULL,
                "description" VARCHAR
            )
        `);

        // User_roles tablosunu oluştur
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

        // Temel rolleri ekle
        await queryRunner.query(`
            INSERT INTO "roles" (name, description) VALUES
            ('SUPER_ADMIN', 'Tüm yetkilere sahip süper yönetici'),
            ('ADMIN', 'Yönetici'),
            ('AUTHOR', 'Yazar'),
            ('USER', 'Normal kullanıcı')
        `);

        // Mevcut kullanıcıları AUTHOR rolüne ata
        await queryRunner.query(`
            INSERT INTO "user_roles" (user_id, role_id)
            SELECT u.id, r.id
            FROM "users" u
            CROSS JOIN "roles" r
            WHERE r.name = 'AUTHOR'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
