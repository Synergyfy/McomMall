import { MigrationInterface, QueryRunner } from 'typeorm';

type MoneyColumn = [table: string, column: string, originalType: 'numeric' | 'double'];

/**
 * Money is stored as integer pence. Existing pound amounts are multiplied by
 * 100 and the column type is narrowed to bigint so no fractional pounds can be
 * persisted again.
 */
const MONEY_COLUMNS: MoneyColumn[] = [
  ['Products', 'price', 'double'],
  ['Products', 'salePrice', 'double'],
  ['booking_rewards', 'discountAmount', 'numeric'],
  ['booking_transactions', 'amount', 'double'],
  ['bundled_services', 'price', 'numeric'],
  ['business_service_provider_profiles', 'fixedPriceFrom', 'numeric'],
  ['business_service_provider_profiles', 'hourlyRateFrom', 'numeric'],
  ['campaign_cashbacks', 'totalValue', 'numeric'],
  ['campaign_cashbacks', 'levelValue', 'numeric'],
  ['configurable_addons', 'price', 'numeric'],
  ['coupon_products', 'bonusAmount', 'numeric'],
  ['coupon_products', 'bonusThreshold', 'numeric'],
  ['coupon_products', 'maxCustomAmount', 'numeric'],
  ['coupon_products', 'minCustomAmount', 'numeric'],
  ['coupons', 'discountValue', 'numeric'],
  ['coupons', 'max_spend', 'numeric'],
  ['coupons', 'min_spend', 'numeric'],
  ['digital_value_master', 'current_balance', 'numeric'],
  ['digital_value_master', 'initial_value', 'numeric'],
  ['digital_value_transactions', 'amount', 'numeric'],
  ['disputes', 'amount', 'numeric'],
  ['events', 'entryPrice', 'numeric'],
  ['failed_wallet_refunds', 'amount', 'numeric'],
  ['flash_sale_items', 'discountedPrice', 'numeric'],
  ['flash_sale_items', 'price', 'numeric'],
  ['gamifications', 'minSpendValue', 'numeric'],
  ['gift_card_templates', 'bonusAmount', 'numeric'],
  ['gift_card_templates', 'bonusThreshold', 'numeric'],
  ['gift_card_templates', 'maxCustomAmount', 'numeric'],
  ['gift_card_templates', 'minCustomAmount', 'numeric'],
  ['gift_card_transactions', 'amount', 'numeric'],
  ['gift_cards', 'currentBalance', 'numeric'],
  ['gift_cards', 'initialBalance', 'numeric'],
  ['loyalty_rules', 'minSpend', 'numeric'],
  ['loyalty_settings', 'redemptionValue', 'numeric'],
  ['membership_credits', 'amount', 'numeric'],
  ['membership_payments', 'amount', 'double'],
  ['money_voucher_transactions', 'amount', 'numeric'],
  ['money_voucher_transactions', 'realAmountDelta', 'numeric'],
  ['money_voucher_transactions', 'rewardAmountDelta', 'numeric'],
  ['money_voucher_transactions', 'salesImpactAfter', 'numeric'],
  ['money_voucher_transactions', 'salesImpactBefore', 'numeric'],
  ['order_item_rewards', 'discountAmount', 'numeric'],
  ['order_items', 'price', 'numeric'],
  ['order_payments', 'amount', 'double'],
  ['orders', 'actualShippingCost', 'numeric'],
  ['orders', 'couponDiscountApplied', 'numeric'],
  ['orders', 'estimatedShippingFee', 'numeric'],
  ['orders', 'giftCardAmountApplied', 'numeric'],
  ['orders', 'rewardDiscountApplied', 'numeric'],
  ['orders', 'total', 'numeric'],
  ['orders', 'voucherAmountApplied', 'double'],
  ['payment_histories', 'amountPaid', 'numeric'],
  ['plan_prices', 'amount', 'numeric'],
  ['promotions', 'minimumSpend', 'numeric'],
  ['redemption_logs', 'applied_amount', 'numeric'],
  ['redemption_logs', 'eligible_subtotal', 'numeric'],
  ['reward_issuance_mirror', 'value', 'numeric'],
  ['service_bookings', 'commissionAmount', 'double'],
  ['service_bookings', 'couponDiscountApplied', 'double'],
  ['service_bookings', 'giftCardAmountApplied', 'double'],
  ['service_bookings', 'providerAmount', 'double'],
  ['service_bookings', 'rewardDiscountApplied', 'double'],
  ['service_bookings', 'totalAmount', 'double'],
  ['service_bookings', 'voucherAmountApplied', 'double'],
  ['service_payments', 'amount', 'double'],
  ['service_provider_profiles', 'fixedPriceFrom', 'numeric'],
  ['service_provider_profiles', 'hourlyRateFrom', 'numeric'],
  ['services', 'additionalGuestPrice', 'numeric'],
  ['services', 'basePrice', 'numeric'],
  ['services', 'bookingFee', 'numeric'],
  ['services', 'fixedGroupPrice', 'numeric'],
  ['services', 'fixedPrice', 'numeric'],
  ['services', 'pricePerGuest', 'numeric'],
  ['services', 'pricePerHour', 'numeric'],
  ['services', 'pricePerUnit', 'numeric'],
  ['shipping_rates', 'price', 'double'],
  ['spare_capacity_offers', 'discountedPrice', 'numeric'],
  ['spare_capacity_offers', 'originalPrice', 'numeric'],
  ['terminal_cashback_claims', 'amount', 'numeric'],
  ['terminal_cashback_claims', 'spendAmount', 'numeric'],
  ['terminal_configs', 'fixedRewardValue', 'numeric'],
  ['transactions', 'discountAmount', 'numeric'],
  ['user_campaign_wallets', 'value1Balance', 'numeric'],
  ['user_campaign_wallets', 'value2Balance', 'numeric'],
  ['user_campaign_wallets', 'value3Balance', 'numeric'],
  ['user_money_vouchers', 'realBalance', 'numeric'],
  ['user_money_vouchers', 'rewardBalance', 'numeric'],
  ['voucher_products', 'bonusAmount', 'numeric'],
  ['voucher_products', 'bonusThreshold', 'numeric'],
  ['voucher_products', 'maxCustomAmount', 'numeric'],
  ['voucher_products', 'minCustomAmount', 'numeric'],
  ['voucher_products', 'value', 'numeric'],
  ['voucher_transactions', 'amount', 'numeric'],
  ['voucher_transactions', 'balanceAfter', 'numeric'],
  ['voucher_transactions', 'balanceBefore', 'numeric'],
  ['vouchers', 'balance', 'numeric'],
  ['vouchers', 'initialValue', 'numeric'],
  ['wallet_transactions', 'amount', 'numeric'],
  ['wallet_transactions', 'balanceAfter', 'numeric'],
  ['wallets', 'balance', 'numeric'],
  ['wallets', 'earningsBalance', 'numeric'],
  ['wallets', 'earningsFromBookings', 'numeric'],
  ['wallets', 'earningsFromCoupons', 'numeric'],
  ['wallets', 'earningsFromGiftCard', 'numeric'],
  ['wallets', 'earningsFromOrders', 'numeric'],
  ['wallets', 'earningsFromTerminalCashback', 'numeric'],
  ['wallets', 'earningsFromVoucher', 'numeric'],
  ['wallets', 'pendingBalance', 'numeric'],
  ['wallets', 'spendableBalance', 'numeric'],
  ['withdrawals', 'amount', 'numeric'],
];

const MONEY_ARRAY_COLUMNS: Array<[table: string, column: string]> = [
  ['coupon_products', 'fixedAmounts'],
  ['gift_card_templates', 'fixedAmounts'],
  ['voucher_products', 'fixedAmounts'],
];

/** Columns that already use an integer type but were storing pounds. */
const INTEGER_POUND_COLUMNS: Array<[table: string, column: string]> = [
  ['offers', 'discountAmount'],
  ['campaigns', 'budget'],
];

export class StoreMoneyInPence1799000000000 implements MigrationInterface {
  name = 'StoreMoneyInPence1799000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column] of MONEY_COLUMNS) {
      const [info] = await queryRunner.query(
        `SELECT data_type FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column],
      );
      if (!info || info.data_type === 'bigint') continue;
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE bigint USING (ROUND("${column}"::numeric * 100))::bigint`,
      );
    }

    for (const [table, column] of MONEY_ARRAY_COLUMNS) {
      const [info] = await queryRunner.query(
        `SELECT udt_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column],
      );
      if (!info || info.udt_name === '_int8') continue;
      const temp = `__${column}_pence`;
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN "${temp}" bigint[]`,
      );
      await queryRunner.query(
        `UPDATE "${table}" SET "${temp}" = ARRAY(SELECT ROUND(x * 100)::bigint FROM unnest("${column}") AS x)`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN "${column}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" RENAME COLUMN "${temp}" TO "${column}"`,
      );
    }

    for (const [table, column] of INTEGER_POUND_COLUMNS) {
      const [info] = await queryRunner.query(
        `SELECT data_type FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column],
      );
      if (!info || info.data_type === 'bigint') continue;
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE bigint USING ("${column}"::bigint * 100)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column] of INTEGER_POUND_COLUMNS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE integer USING (ROUND("${column}"::numeric / 100))::int`,
      );
    }

    for (const [table, column] of MONEY_ARRAY_COLUMNS) {
      const temp = `__${column}_pounds`;
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN "${temp}" numeric[]`,
      );
      await queryRunner.query(
        `UPDATE "${table}" SET "${temp}" = ARRAY(SELECT (x::numeric / 100) FROM unnest("${column}") AS x)`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN "${column}"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" RENAME COLUMN "${temp}" TO "${column}"`,
      );
    }

    for (const [table, column, originalType] of [...MONEY_COLUMNS].reverse()) {
      const target =
        originalType === 'double' ? 'double precision' : 'numeric(12,2)';
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE ${target} USING ("${column}"::numeric / 100)`,
      );
    }
  }
}
