import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlanTier } from '../enums/plan-tier.enum';
import type {
  PlanVariantConfiguration,
  PlanVariantFeatureFlags,
  PlanVariantQuotas,
} from '../entities/plan-variant.entity';

export class CreatePlanQuotasDto implements PlanVariantQuotas {
  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  maxListings: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  allowProductListing: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  allowServiceListing: boolean;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  maxProducts: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  maxServices: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  maxGiftCardTemplates: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  maxCouponTemplates: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  maxLoyaltyPrograms: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(0)
  maxImagesPerListing: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  featuredListingAllowance: number;
}

export class CreatePlanFeatureFlagsDto implements PlanVariantFeatureFlags {
  @ApiProperty({ example: false })
  @IsBoolean()
  priorityInSearch: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  advancedAnalytics: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  dedicatedSupport: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  allowCustomBranding: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  allowGroupCreation: boolean;
}

export class CreatePlanConfigurationDto implements PlanVariantConfiguration {
  @ApiProperty({ type: CreatePlanQuotasDto })
  @ValidateNested()
  @Type(() => CreatePlanQuotasDto)
  @IsObject()
  quotas: CreatePlanQuotasDto;

  @ApiProperty({ type: CreatePlanFeatureFlagsDto })
  @ValidateNested()
  @Type(() => CreatePlanFeatureFlagsDto)
  @IsObject()
  featureFlags: CreatePlanFeatureFlagsDto;

  @ApiPropertyOptional({ example: [], description: 'Disabled nav ids' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disabledNavIds?: string[];
}

export class CreatePlanVariantDto {
  @ApiProperty({ enum: PlanTier, example: PlanTier.STANDARD })
  @IsEnum(PlanTier)
  tier: PlanTier;

  @ApiProperty({
    example: 29.99,
    description: 'One-off price for the full tier duration',
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'price_123' })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiPropertyOptional({ example: 'P-123' })
  @IsString()
  @IsOptional()
  paypalPlanId?: string;

  @ApiPropertyOptional({ example: ['Priority support'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiProperty({ type: CreatePlanConfigurationDto })
  @ValidateNested()
  @Type(() => CreatePlanConfigurationDto)
  @IsObject()
  configuration: CreatePlanConfigurationDto;
}

export class CreatePlanDto {
  @ApiProperty({
    example: 'Gold',
    description: 'Display name of the plan family',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'gold', description: 'URL-safe unique slug' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'For established businesses' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: [CreatePlanVariantDto],
    description: 'Exactly the Standard, Pro and Pro+ variants',
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => CreatePlanVariantDto)
  variants: CreatePlanVariantDto[];
}
