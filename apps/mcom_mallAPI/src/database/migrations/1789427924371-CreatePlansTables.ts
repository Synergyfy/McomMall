import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlansTables1789427924371 implements MigrationInterface {
  name = 'CreatePlansTables1789427924371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e7b71bb444e74ee067df057397e" UNIQUE ("slug"), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_tier_levels_name_enum" AS ENUM('STANDARD', 'PRO', 'PRO_PLUS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_tier_levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" "public"."plan_tier_levels_name_enum" NOT NULL, "sortOrder" integer NOT NULL, "durationDays" integer, "isCalendarYear" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_0850e7385b4e890f90fa65c96ff" UNIQUE ("name"), CONSTRAINT "PK_1dbf87702ccee5e3e4dd0cf98e3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "plan_variant_id" uuid NOT NULL, "currency" character varying NOT NULL DEFAULT 'GBP', "amount" numeric(10,2) NOT NULL, "stripePriceId" character varying, "paypalPlanId" character varying, "isActive" boolean NOT NULL DEFAULT true, "effective_from" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "effective_to" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_69b05dce9891d42a3d0fc77eec1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3180bf38c69d7d68157fbacc75" ON "plan_prices" ("plan_variant_id", "isActive") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."features_data_type_enum" AS ENUM('boolean', 'numeric', 'text')`,
    );
    await queryRunner.query(
      `CREATE TABLE "features" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "key" character varying NOT NULL, "name" character varying NOT NULL, "data_type" "public"."features_data_type_enum" NOT NULL, CONSTRAINT "UQ_0cc5c687428b94489ce1edc3c5a" UNIQUE ("key"), CONSTRAINT "PK_5c1e336df2f4a7051e5bf08a941" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_variant_features" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "plan_variant_id" uuid NOT NULL, "feature_id" uuid NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_811ba94a6cf047dfbfbf3b98513" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_949694a22d27becd544437a9b1" ON "plan_variant_features" ("plan_variant_id", "feature_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "plan_id" uuid NOT NULL, "tier_level_id" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "features" text, "configuration" jsonb NOT NULL, CONSTRAINT "PK_b1d4e09b569c4e25cedefb03168" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_577c0c65bf8e679d8f8afbf4df" ON "plan_variants" ("plan_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e538d68f078b3a16e43382c437" ON "plan_variants" ("plan_id", "tier_level_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_prices" ADD CONSTRAINT "FK_d27be70a5cecf5199cdbbd4c555" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variant_features" ADD CONSTRAINT "FK_e5cb38bc961b482243f570a4204" FOREIGN KEY ("plan_variant_id") REFERENCES "plan_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variant_features" ADD CONSTRAINT "FK_2cc49d0956d7e96e6eb6a4f7744" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variants" ADD CONSTRAINT "FK_577c0c65bf8e679d8f8afbf4df9" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variants" ADD CONSTRAINT "FK_04c03767eab833fba740129d3ed" FOREIGN KEY ("tier_level_id") REFERENCES "plan_tier_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plan_variants" DROP CONSTRAINT "FK_04c03767eab833fba740129d3ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variants" DROP CONSTRAINT "FK_577c0c65bf8e679d8f8afbf4df9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variant_features" DROP CONSTRAINT "FK_2cc49d0956d7e96e6eb6a4f7744"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_variant_features" DROP CONSTRAINT "FK_e5cb38bc961b482243f570a4204"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_prices" DROP CONSTRAINT "FK_d27be70a5cecf5199cdbbd4c555"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e538d68f078b3a16e43382c437"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_577c0c65bf8e679d8f8afbf4df"`,
    );
    await queryRunner.query(`DROP TABLE "plan_variants"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_949694a22d27becd544437a9b1"`,
    );
    await queryRunner.query(`DROP TABLE "plan_variant_features"`);
    await queryRunner.query(`DROP TABLE "features"`);
    await queryRunner.query(`DROP TYPE "public"."features_data_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3180bf38c69d7d68157fbacc75"`,
    );
    await queryRunner.query(`DROP TABLE "plan_prices"`);
    await queryRunner.query(`DROP TABLE "plan_tier_levels"`);
    await queryRunner.query(`DROP TYPE "public"."plan_tier_levels_name_enum"`);
    await queryRunner.query(`DROP TABLE "plans"`);
  }
}
