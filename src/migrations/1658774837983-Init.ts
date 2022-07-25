import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1658774837983 implements MigrationInterface {
    name = 'Init1658774837983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("create_date_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_date_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "email_original" character varying(255) NOT NULL, CONSTRAINT "user_email_unique_cons" UNIQUE ("email"), CONSTRAINT "pk_user_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "user_email_idx" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "devices" ("create_date_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_date_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "mqtt_password" character varying(255) NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, "user_id" uuid, CONSTRAINT "pk_device_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "device_name_idx" ON "devices" ("name") `);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "fk_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."device_name_idx"`);
        await queryRunner.query(`DROP TABLE "devices"`);
        await queryRunner.query(`DROP INDEX "public"."user_email_idx"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
