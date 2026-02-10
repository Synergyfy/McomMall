import { ApiProperty } from '@nestjs/swagger';

class QuotaDetail {
  @ApiProperty({ example: 5 })
  used: number;

  @ApiProperty({ example: 10, description: '-1 means unlimited' })
  limit: number;

  @ApiProperty({ example: 5 })
  remaining: number;

  @ApiProperty({ example: true, required: false })
  allowed?: boolean;
}

class FeatureFlags {
  @ApiProperty({ example: true })
  advancedAnalytics: boolean;

  @ApiProperty({ example: false })
  allowCustomBranding: boolean;

  @ApiProperty({ example: true })
  allowGroupCreation: boolean;
}

class Quotas {
  @ApiProperty({ type: QuotaDetail })
  listings: QuotaDetail;

  @ApiProperty({ type: QuotaDetail })
  products: QuotaDetail;

  @ApiProperty({ type: QuotaDetail })
  services: QuotaDetail;

  @ApiProperty({ type: QuotaDetail })
  giftCardTemplates: QuotaDetail;

  @ApiProperty({ type: QuotaDetail })
  couponTemplates: QuotaDetail;

  @ApiProperty({ type: QuotaDetail })
  loyaltyPrograms: QuotaDetail;
}

export class CapabilityUsageDto {
  @ApiProperty({ example: true })
  hasAccess: boolean;

  @ApiProperty({ type: Quotas })
  quotas: Quotas;

  @ApiProperty({ type: FeatureFlags })
  features: FeatureFlags;
}
