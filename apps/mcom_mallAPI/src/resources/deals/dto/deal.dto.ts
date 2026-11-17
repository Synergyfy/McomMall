import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type DealKind =
  | 'standard_coupon'
  | 'coupon_voucher'
  | 'voucher_coupon'
  | 'voucher'
  | 'gift_card'
  | 'promotion';

export type DealVisualType = 'coupon' | 'voucher';
export type DealFunctionalType = 'price_reducer' | 'spending_power';
export type DealSource =
  | 'coupon'
  | 'money_voucher'
  | 'voucher'
  | 'gift_card'
  | 'campaign'
  | 'definition';

export class DealScopeDto {
  @ApiProperty({ example: 'LISTINGS' })
  mode: string;

  @ApiPropertyOptional({ nullable: true })
  businessId?: string | null;

  @ApiPropertyOptional({ type: [String] })
  listingIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  productIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  serviceIds?: string[];
}

/**
 * One unified shape for every coupon/voucher/gift-card/promotion, regardless
 * of which ledger it lives in. `source` tells callers where the write lives;
 * `kind` tells them how it behaves.
 */
export class DealDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    enum: [
      'standard_coupon',
      'coupon_voucher',
      'voucher_coupon',
      'voucher',
      'gift_card',
      'promotion',
    ],
  })
  kind: DealKind;

  @ApiProperty({ enum: ['coupon', 'voucher'] })
  visualType: DealVisualType;

  @ApiPropertyOptional({
    enum: ['price_reducer', 'spending_power'],
    nullable: true,
  })
  functionalType: DealFunctionalType | null;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  code: string | null;

  @ApiPropertyOptional({ nullable: true })
  faceValue: number | null;

  @ApiPropertyOptional({ enum: ['percentage', 'fixed'], nullable: true })
  discountType: 'percentage' | 'fixed' | null;

  @ApiPropertyOptional({ nullable: true })
  remainingValue: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'How much real money the wallet can still collect from contributors.',
  })
  contributionRemaining: number | null;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional({ type: DealScopeDto, nullable: true })
  scope: DealScopeDto | null;

  @ApiPropertyOptional({ nullable: true })
  businessId: string | null;

  @ApiPropertyOptional({ nullable: true })
  businessName: string | null;

  @ApiPropertyOptional({ nullable: true })
  expiresAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  createdAt: string | null;

  @ApiProperty({
    enum: [
      'coupon',
      'money_voucher',
      'voucher',
      'gift_card',
      'campaign',
      'definition',
    ],
  })
  source: DealSource;
}

export class DealPageMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  lastPage: number;

  @ApiPropertyOptional({ nullable: true })
  nextPage: number | null;

  @ApiPropertyOptional({ nullable: true })
  prevPage: number | null;
}

export class DealPageDto {
  @ApiProperty({ type: [DealDto] })
  data: DealDto[];

  @ApiProperty({ type: DealPageMetaDto })
  meta: DealPageMetaDto;
}
