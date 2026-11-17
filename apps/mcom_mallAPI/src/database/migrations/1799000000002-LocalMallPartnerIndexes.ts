import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Indexes the local-mall partner discovery query depends on. Without these,
 * listing businesses by local mall/postcode and checking existing partnership
 * requests does sequential scans on `businesses`, `locations` and the
 * partnership tables.
 */
export class LocalMallPartnerIndexes1799000000002
  implements MigrationInterface
{
  name = 'LocalMallPartnerIndexes1799000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_localMallId" ON "businesses" ("localMallId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_businesses_userId" ON "businesses" ("userId")`,
    );
    // `text_pattern_ops` lets Postgres use the index for the `LIKE 'SW1A%'`
    // prefix lookups used by partner discovery.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_locations_postcode" ON "locations" ("postcode" text_pattern_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_partnership_requests_sender" ON "user_partnership_requests" ("senderId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_partnership_requests_receiver" ON "user_partnership_requests" ("receiverId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_partnerships_user1" ON "user_partnerships" ("user1Id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_partnerships_user2" ON "user_partnerships" ("user2Id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_partnerships_user2"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_partnerships_user1"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_partnership_requests_receiver"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_user_partnership_requests_sender"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_locations_postcode"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_businesses_userId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_businesses_localMallId"`,
    );
  }
}
