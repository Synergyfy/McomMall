import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { Coupon } from '../src/resources/coupon/entities/coupon.entity';
import { Voucher } from '../src/resources/voucher/entities/voucher.entity';
import { UserVoucher } from '../src/resources/money-engine/entities/user-voucher.entity';
import { RewardDefinition } from '../src/resources/money-engine/entities/reward-definition.entity';
import { DigitalValueMaster } from '../src/resources/digital-value/entities/digital-value-master.entity';
import { GiftCard } from '../src/resources/gift-card/entities/gift-card.entity';

/**
 * Read-only inventory of every coupon/voucher/gift-card ledger.
 *
 * Phase 0 of COUPON_VOUCHER_ALIGNMENT_PLAN.md: before changing behaviour we
 * need a baseline that reconciles the four parallel stores. This script never
 * writes. It prints a JSON report plus a short human summary.
 *
 * Usage:
 *   pnpm --filter @mcommall/api audit:instruments
 *   pnpm --filter @mcommall/api audit:instruments > audit.json
 */

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  port: +process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USERNAME || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_NAME || 'dbname',
  host: process.env.POSTGRES_HOST || 'localhost',
  entities: [path.resolve(__dirname, '..', 'src') + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  ssl:
    process.env.NODE_ENV === 'production' || process.env.VERCEL
      ? { rejectUnauthorized: false }
      : false,
});

/** Money columns are stored in pence; reports are in pounds. */
function toPounds(value: unknown): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric) / 100;
}

async function groupCount(
  repo: any,
  alias: string,
  column: string,
): Promise<Record<string, number>> {
  const rows = await repo
    .createQueryBuilder(alias)
    .select(`${alias}.${column}`, 'key')
    .addSelect(`COUNT(${alias}.id)`, 'count')
    .groupBy(`${alias}.${column}`)
    .getRawMany();

  return Object.fromEntries(
    rows.map((row: any) => [String(row.key), Number(row.count)]),
  );
}

async function auditCoupons(): Promise<any> {
  const repo = dataSource.getRepository(Coupon);
  const totals = await repo
    .createQueryBuilder('c')
    .select('COUNT(c.id)', 'count')
    .addSelect('COALESCE(SUM(c.discountValue), 0)', 'sumDiscountValue')
    .getRawOne();

  const withMetadataBalance = await repo
    .createQueryBuilder('c')
    .where("c.metadata ->> 'balance' IS NOT NULL")
    .getCount();

  return {
    count: Number(totals?.count ?? 0),
    byStatus: await groupCount(repo, 'c', 'status'),
    sumDiscountValue: toPounds(totals?.sumDiscountValue),
    withMetadataBalance,
  };
}

async function auditVouchers(): Promise<any> {
  const repo = dataSource.getRepository(Voucher);
  const totals = await repo
    .createQueryBuilder('v')
    .select('COUNT(v.id)', 'count')
    .addSelect('COALESCE(SUM(v.initialValue), 0)', 'sumInitialValue')
    .addSelect('COALESCE(SUM(v.balance), 0)', 'sumBalance')
    .getRawOne();

  return {
    count: Number(totals?.count ?? 0),
    byStatus: await groupCount(repo, 'v', 'status'),
    sumInitialValue: toPounds(totals?.sumInitialValue),
    sumBalance: toPounds(totals?.sumBalance),
  };
}

async function auditMoneyVouchers(): Promise<any> {
  const repo = dataSource.getRepository(UserVoucher);
  const totals = await repo
    .createQueryBuilder('uv')
    .select('COUNT(uv.id)', 'count')
    .addSelect('COALESCE(SUM(uv.realBalance), 0)', 'sumRealBalance')
    .addSelect('COALESCE(SUM(uv.rewardBalance), 0)', 'sumRewardBalance')
    .getRawOne();

  return {
    count: Number(totals?.count ?? 0),
    byState: await groupCount(repo, 'uv', 'state'),
    sumRealBalance: toPounds(totals?.sumRealBalance),
    sumRewardBalance: toPounds(totals?.sumRewardBalance),
  };
}

async function auditDigitalValues(): Promise<any> {
  const repo = dataSource.getRepository(DigitalValueMaster);
  const totals = await repo
    .createQueryBuilder('dv')
    .select('COUNT(dv.id)', 'count')
    .addSelect('COALESCE(SUM(dv.currentBalance), 0)', 'sumCurrentBalance')
    .getRawOne();

  return {
    count: Number(totals?.count ?? 0),
    byType: await groupCount(repo, 'dv', 'type'),
    sumCurrentBalance: toPounds(totals?.sumCurrentBalance),
  };
}

async function auditGiftCards(): Promise<any> {
  const repo = dataSource.getRepository(GiftCard);
  const totals = await repo
    .createQueryBuilder('gc')
    .select('COUNT(gc.id)', 'count')
    .addSelect('COALESCE(SUM(gc.currentBalance), 0)', 'sumCurrentBalance')
    .getRawOne();

  return {
    count: Number(totals?.count ?? 0),
    sumCurrentBalance: toPounds(totals?.sumCurrentBalance),
  };
}

async function auditRewardDefinitions(): Promise<any> {
  const repo = dataSource.getRepository(RewardDefinition);
  const count = await repo.count();
  const withFaceValue = await repo
    .createQueryBuilder('rd')
    .where('rd.faceValue IS NOT NULL')
    .getCount();
  const withFaceValueInName = await repo
    .createQueryBuilder('rd')
    .where("rd.name LIKE '%£%'")
    .getCount();

  return {
    count,
    withFaceValue,
    missingFaceValue: count - withFaceValue,
    withFaceValueInName,
    missingFaceValueInName: count - withFaceValueInName,
    byVisualType: await groupCount(repo, 'rd', 'visualType'),
    byFunctionalType: await groupCount(repo, 'rd', 'functionalType'),
    byScopeType: await groupCount(repo, 'rd', 'scopeType'),
  };
}

async function safe<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (error: any) {
    return { error: `${name}: ${error?.message ?? error}` };
  }
}

async function run(): Promise<void> {
  await dataSource.initialize();

  const [coupons, vouchers, moneyVouchers, digitalValues, giftCards, definitions] =
    await Promise.all([
      safe('coupons', auditCoupons),
      safe('vouchers', auditVouchers),
      safe('moneyVouchers', auditMoneyVouchers),
      safe('digitalValues', auditDigitalValues),
      safe('giftCards', auditGiftCards),
      safe('rewardDefinitions', auditRewardDefinitions),
    ]);

  const warnings: string[] = [];
  const couponData = coupons as any;
  const definitionData = definitions as any;
  const moneyVoucherData = moneyVouchers as any;

  if (couponData?.withMetadataBalance > 0) {
    warnings.push(
      `${couponData.withMetadataBalance} coupon row(s) hold a balance in metadata; these are legacy balance-bearing coupons and should migrate to vouchers (Phase 4).`,
    );
  }
  if (definitionData?.missingFaceValue > 0) {
    warnings.push(
      `${definitionData.missingFaceValue} reward definition(s) have no numeric faceValue; assign one before enabling enforcement (Phase 1).`,
    );
  }
  if (moneyVoucherData?.count > 0) {
    warnings.push(
      `${moneyVoucherData.count} money-engine wallet(s) exist but are not payable at online checkout yet (FEATURE_MONEY_VOUCHER_CHECKOUT, Phase 2).`,
    );
  }

  const report = {
    generatedAt: new Date().toISOString(),
    currency: 'GBP',
    tables: {
      coupons,
      vouchers,
      moneyVouchers,
      digitalValues,
      giftCards,
      rewardDefinitions: definitions,
    },
    warnings,
  };

  console.log(JSON.stringify(report, null, 2));

  console.error('\n=== Instrument audit summary ===');
  console.error(`Coupons:              ${couponData?.count ?? 'error'}`);
  console.error(`Vouchers:             ${(vouchers as any)?.count ?? 'error'}`);
  console.error(`Money vouchers:       ${moneyVoucherData?.count ?? 'error'}`);
  console.error(`Digital values:       ${(digitalValues as any)?.count ?? 'error'}`);
  console.error(`Gift cards:           ${(giftCards as any)?.count ?? 'error'}`);
  console.error(`Reward definitions:   ${definitionData?.count ?? 'error'}`);
  if (warnings.length > 0) {
    console.error('\nWarnings:');
    for (const warning of warnings) console.error(`- ${warning}`);
  }
}

run()
  .then(async () => {
    await dataSource.destroy();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Instrument audit failed:', error);
    if (dataSource.isInitialized) await dataSource.destroy();
    process.exit(1);
  });
