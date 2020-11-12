import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserImageUrl1605199253145 implements MigrationInterface {
    name = 'AddUserImageUrl1605199253145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "shortBio" varchar NOT NULL, "isVerified" boolean NOT NULL DEFAULT (0), "imageUrl" varchar NOT NULL DEFAULT "https://i.pravatar.cc/300")`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "name", "shortBio", "isVerified") SELECT "id", "name", "shortBio", "isVerified" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "shortBio" varchar NOT NULL, "isVerified" boolean NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "user"("id", "name", "shortBio", "isVerified") SELECT "id", "name", "shortBio", "isVerified" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
    }

}
