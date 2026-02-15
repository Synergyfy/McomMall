import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TierConfig } from '../interfaces/tier-config.interface';
import { TierType } from '../enums/tier-type.enum';

export class CreateTierDto {
  @ApiProperty({
    example: 'Gold Plan',
    description: 'The name of the tier',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Premium tier for established businesses',
    description: 'A brief description of the tier',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 29.99,
    description: 'Monthly price of the tier',
  })
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty({
    example: 79.99,
    description: 'Quarterly price of the tier',
  })
  @IsNumber()
  quarterlyPrice: number;

  @ApiProperty({
    example: 299.99,
    description: 'Annual price of the tier',
  })
  @IsNumber()
  annualPrice: number;

  @ApiProperty({
    example: 'price_123456789',
    description: 'Stripe Price ID for monthly billing',
    required: false,
  })
  @IsString()
  @IsOptional()
  stripeMonthlyPriceId?: string;

  @ApiProperty({
    example: 'price_987654321',
    description: 'Stripe Price ID for quarterly billing',
    required: false,
  })
  @IsString()
  @IsOptional()
  stripeQuarterlyPriceId?: string;

  @ApiProperty({
    example: 'price_987654321',
    description: 'Stripe Price ID for annual billing',
    required: false,
  })
  @IsString()
  @IsOptional()
  stripeAnnualPriceId?: string;

  @ApiProperty({
    example: 'P-123456789',
    description: 'PayPal Plan ID for monthly billing',
    required: false,
  })
  @IsString()
  @IsOptional()
  paypalMonthlyPlanId?: string;

  @ApiProperty({
    example: 'P-987654321',
    description: 'PayPal Plan ID for quarterly billing',
    required: false,
  })
  @IsString()
  @IsOptional()
  paypalQuarterlyPlanId?: string;

  @ApiProperty({
    example: 'P-987654321',
    description: 'PayPal Plan ID for annual billing',
    required: false,
  })
  @IsString()
  @IsOptional()
  paypalAnnualPlanId?: string;

  @ApiProperty({
    description: 'List of features included in the tier',
    example: ['Priority support', 'Increased listing limit'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiProperty({
    example: {
      quotas: {
        maxListings: 100,
        allowProductListing: true,
        allowServiceListing: true,
        maxProducts: 50,
        maxServices: 50,
        maxGiftCardTemplates: 5,
        maxCouponTemplates: 10,
        maxLoyaltyPrograms: 1,
        maxImagesPerListing: 5,
        featuredListingAllowance: 2,
      },
      featureFlags: {
        priorityInSearch: true,
        advancedAnalytics: true,
        dedicatedSupport: true,
        allowCustomBranding: false,
        allowGroupCreation: true,
      },
    },
    description: 'Configuration of tier quotas and features',
  })
  @IsObject()
  configuration: TierConfig;

  @ApiProperty({
    example: true,
    description: 'Whether the tier is currently active',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this is the default/free tier',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({
    enum: TierType,
    example: TierType.STANDARD,
    description: 'Type of the tier',
    required: false,
    default: TierType.STANDARD,
  })
  @IsOptional()
  type?: TierType;

  @ApiProperty({
    example: 14,
    description: 'Duration of trial in days (required for TRIAL type)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  trialDuration?: number;
}
