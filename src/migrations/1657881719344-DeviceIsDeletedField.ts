import { MigrationInterface, QueryRunner } from "typeorm";

export class DeviceIsDeletedField1657881719344 implements MigrationInterface {
    name = 'DeviceIsDeletedField1657881719344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP COLUMN "isDeleted"`);
    }

}
