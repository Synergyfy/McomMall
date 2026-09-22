import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWebhooksModule1790081866866 implements MigrationInterface {
    name = 'AddWebhooksModule1790081866866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "webhooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "url" character varying NOT NULL, "events" text NOT NULL DEFAULT '', "secret" character varying, "isActive" boolean NOT NULL DEFAULT true, "lastTriggeredAt" TIMESTAMP, "failureCount" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_webhooks" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_webhooks_name" ON "webhooks" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_webhooks_name"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);
    }

}
