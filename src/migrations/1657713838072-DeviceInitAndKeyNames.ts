import { MigrationInterface, QueryRunner } from "typeorm";

export class DeviceInitAndKeyNames1657713838072 implements MigrationInterface {
    name = 'DeviceInitAndKeyNames1657713838072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "devices" ("createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "mqttPassword" character varying(255) NOT NULL, "user_id" uuid, CONSTRAINT "pk_device_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "device_name_idx" ON "devices" ("name") `);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" TO "pk_user_id";`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "fk_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."device_name_idx"`);
        await queryRunner.query(`DROP TABLE "devices"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "pk_user_id" TO "PK_a3ffb1c0c8416b9fc6f907b7433";`)
    }

}
