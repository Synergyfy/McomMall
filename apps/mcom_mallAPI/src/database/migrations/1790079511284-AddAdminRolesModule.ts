import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminRolesModule1790079511284 implements MigrationInterface {
    name = 'AddAdminRolesModule1790079511284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" text, "permissions" text NOT NULL DEFAULT '', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_6e9e938900168e4a0786bb65889" UNIQUE ("name"), CONSTRAINT "PK_091baca34754e848b9f8c4e7be9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6e9e938900168e4a0786bb6588" ON "admin_roles" ("name") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "adminRoleId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_e52c234b824ff80ce207bbb3f37" FOREIGN KEY ("adminRoleId") REFERENCES "admin_roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_e52c234b824ff80ce207bbb3f37"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "adminRoleId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6e9e938900168e4a0786bb6588"`);
        await queryRunner.query(`DROP TABLE "admin_roles"`);
    }

}
