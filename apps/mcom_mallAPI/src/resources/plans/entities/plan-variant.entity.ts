import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Plan } from './plan.entity';
import { PlanTierLevel } from './plan-tier-level.entity';
import { PlanPrice } from './plan-price.entity';
import { PlanVariantFeature } from './plan-variant-feature.entity';

export interface PlanVariantQuotas {
  maxListings: number;
  allowProductListing: boolean;
  allowServiceListing: boolean;
  maxProducts: number;
  maxServices: number;
  maxGiftCardTemplates: number;
  maxCouponTemplates: number;
  maxLoyaltyPrograms: number;
  maxImagesPerListing: number;
  featuredListingAllowance: number;
}

export interface PlanVariantFeatureFlags {
  priorityInSearch: boolean;
  advancedAnalytics: boolean;
  dedicatedSupport: boolean;
  allowCustomBranding: boolean;
  allowGroupCreation: boolean;
}

export interface PlanVariantConfiguration {
  quotas: PlanVariantQuotas;
  featureFlags: PlanVariantFeatureFlags;
  disabledNavIds?: string[];
}

/**
 * The sellable unit: one plan family × one tier level
 * (e.g. Gold × Pro). Auto-created 3-per-plan; UNIQUE(plan, tier).
 */
@Entity('plan_variants')
@Index(['planId', 'tierLevelId'], { unique: true })
@Index(['planId'])
export class PlanVariant extends AbstractBaseEntity {
  @ApiProperty({ description: 'Owning plan family id' })
  @Column({ name: 'plan_id' })
  planId: string;

  @ManyToOne(() => Plan, (plan) => plan.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @ApiProperty({ description: 'Tier level id (Standard / Pro / Pro+)' })
  @Column({ name: 'tier_level_id' })
  tierLevelId: string;

  @ManyToOne(() => PlanTierLevel, (level) => level.variants)
  @JoinColumn({ name: 'tier_level_id' })
  tierLevel: PlanTierLevel;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Display-only bullet list for pricing pages',
    example: ['Priority support', '10 listings'],
    nullable: true,
  })
  @Column({ type: 'simple-array', nullable: true })
  features: string[] | null;

  @ApiProperty({
    description: 'Enforced quotas + feature flags for this variant',
  })
  @Column({ type: 'jsonb' })
  configuration: PlanVariantConfiguration;

  @OneToMany(() => PlanPrice, (price) => price.planVariant)
  prices: PlanPrice[];

  @OneToMany(() => PlanVariantFeature, (link) => link.planVariant)
  variantFeatures: PlanVariantFeature[];
}
