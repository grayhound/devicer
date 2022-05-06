import { MigrationInterface, QueryRunner } from "typeorm";

export class UserInit1651017225272 implements MigrationInterface {
    name = 'UserInit1651017225272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "emailOriginal" character varying(255) NOT NULL, CONSTRAINT "user_email_unique_cons" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "user_email_idx" ON "users" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."user_email_idx"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
