import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanVariantColumnsToMembership1789428728133 implements MigrationInterface {
  name = 'AddPlanVariantColumnsToMembership1789428728133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "memberships" ADD "plan_variant_id" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "memberships" ADD "price_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "payment_histories" ADD "plan_variant_id" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_histories" DROP COLUMN "plan_variant_id"`,
    );
    await queryRunner.query(`ALTER TABLE "memberships" DROP COLUMN "price_id"`);
    await queryRunner.query(
      `ALTER TABLE "memberships" DROP COLUMN "plan_variant_id"`,
    );
  }
}
