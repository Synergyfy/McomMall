import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { TierConfig } from '../interfaces/tier-config.interface';
import { TierType } from '../enums/tier-type.enum';
import { Season } from '../../seasons/entities/season.entity';

@Entity('tiers')
export class Tier extends AbstractBaseEntity {
  @ApiProperty({ example: 'Gold Plan', description: 'The name of the tier' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: 'Premium tier for established businesses',
    description: 'Description of the tier',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 29.99, description: 'Monthly price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyPrice: number;

  @ApiProperty({ example: 79.99, description: 'Quarterly price' })
  @Column({
    name: 'quarterlyPrice',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  quarterlyPrice: number;

  @ApiProperty({ example: 299.99, description: 'Annual price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  annualPrice: number;

  @ApiProperty({
    description: 'List of features included in the tier',
    example: ['Priority support', 'Increased listing limit'],
  })
  @Column({ type: 'simple-array', nullable: true })
  features: string[];

  @ApiProperty({
    example: 'price_123',
    description: 'Stripe monthly price ID',
    nullable: true,
  })
  @Column({ nullable: true })
  stripeMonthlyPriceId: string;

  @ApiProperty({
    example: 'price_789',
    description: 'Stripe quarterly price ID',
    nullable: true,
  })
  @Column({ nullable: true })
  stripeQuarterlyPriceId: string;

  @ApiProperty({
    example: 'price_456',
    description: 'Stripe annual price ID',
    nullable: true,
  })
  @Column({ nullable: true })
  stripeAnnualPriceId: string;

  @ApiProperty({
    example: 'P-123',
    description: 'PayPal monthly plan ID',
    nullable: true,
  })
  @Column({ nullable: true })
  paypalMonthlyPlanId: string;

  @ApiProperty({
    example: 'P-789',
    description: 'PayPal quarterly plan ID',
    nullable: true,
  })
  @Column({ nullable: true })
  paypalQuarterlyPlanId: string;

  @ApiProperty({
    example: 'P-456',
    description: 'PayPal annual plan ID',
    nullable: true,
  })
  @Column({ nullable: true })
  paypalAnnualPlanId: string;

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
    description: 'Tier configuration',
  })
  @Column({ type: 'jsonb' })
  configuration: TierConfig;

  @ApiProperty({ example: true, description: 'Is tier active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Is this the default/free tier' })
  @Column({ default: false })
  isDefault: boolean;

  @ApiProperty({
    enum: TierType,
    example: TierType.STANDARD,
    description: 'Type of the tier',
  })
  @Column({
    type: 'enum',
    enum: TierType,
    default: TierType.STANDARD,
  })
  type: TierType;

  @ApiProperty({
    example: 14,
    description: 'Duration of trial in days (only for TRIAL type)',
    nullable: true,
  })
  @Column({ nullable: true })
  trialDuration: number;

  @ApiProperty({ type: () => Season, nullable: true })
  @ManyToOne(() => Season, { nullable: true })
  @JoinColumn({ name: 'season_id' })
  season: Season;

  @ApiProperty({
    example: 'uuid',
    description: 'Season ID if this is a seasonal tier',
    nullable: true,
  })
  @Column({ name: 'season_id', nullable: true })
  seasonId: string;
}
