import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTakeadsOfferPrice1800000000061 implements MigrationInterface {
  name = 'AddTakeadsOfferPrice1800000000061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "takeads_offers" ADD "price" numeric(12,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "takeads_offers" DROP COLUMN "price"`);
  }
}
