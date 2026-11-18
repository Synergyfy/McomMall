import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import {
  moneyJsonTransformer,
  moneyTransformer,
} from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { BundledService } from './bundled-service.entity';
import { ConfigurableAddon } from './configurable-addon.entity';
import { Review } from '../../reviews/entities/review.entity';
import { SpareCapacityOffer } from './spare-capacity-offer.entity';
import {
  CustomerAction,
  GuestPricingModel,
  PricingModel,
  PricingType,
  ServiceDeliveryOption,
} from '../service.enum';
import { Length, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity('services')
@Index(['businessId', 'name'], { unique: true })
export class Service extends AbstractBaseEntity {
  @ApiProperty({ description: 'Unique identifier', example: 'uuid-123' })
  id: string;

  @ManyToOne(() => Business, (business) => business.services)
  business: Business;

  @Column()
  @ApiProperty({ description: 'Business ID', example: 'biz-uuid-123' })
  businessId: string;

  @Column({ length: 160 })
  @Length(1, 160)
  @ApiProperty({
    description: 'Name of the service',
    example: 'Professional House Cleaning',
  })
  name: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @ApiProperty({
    description: 'Detailed description',
    example: 'Complete professional cleaning',
  })
  description?: string;

  @Column('jsonb', { nullable: true })
  @IsOptional()
  @IsUrl({}, { each: true })
  media?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: PricingModel,
  })
  @ApiProperty({ enum: PricingModel, description: 'Pricing model' })
  pricingModel: PricingModel;

  /** Pricing option selected in the Create Service flow. */
  @Column({ type: 'varchar', default: PricingType.FIXED })
  @ApiProperty({
    enum: PricingType,
    description: 'Customer-facing pricing type',
  })
  pricingType: PricingType;

  /** Single price for fixed / starting-from / hourly pricing. */
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  @ApiProperty({ description: 'Display price in pounds', example: 100.0 })
  price?: number;

  /** Upper bound for price-range pricing. */
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  @ApiProperty({ description: 'Maximum price in pounds', example: 250.0 })
  priceMax?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  @ApiProperty({ description: 'Fixed price', example: 100.0 })
  fixedPrice?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  pricePerHour?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  pricePerUnit?: number;

  @Column({ length: 50, nullable: true })
  @Length(1, 50)
  unitName?: string;

  @Column({ default: false })
  enableGuestPricing: boolean;

  @Column({
    type: 'enum',
    enum: GuestPricingModel,
    nullable: true,
  })
  guestPricingModel?: GuestPricingModel;

  @Column('int', { nullable: true, default: 1 })
  minGuests?: number;

  @Column('int', { nullable: true, default: 10 })
  maxGuests?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  pricePerGuest?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  fixedGroupPrice?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  basePrice?: number;

  @Column('int', { nullable: true })
  baseGuests?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  additionalGuestPrice?: number;

  @Column({ default: false })
  isQuoteModel: boolean;

  /** Inherited from the business profile synced from MCOM Central. */
  @Column({ nullable: true })
  @ApiProperty({ description: 'Sector', example: 'Home Improvement' })
  sector: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Category', example: 'Home Services' })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column('simple-array', { nullable: true })
  targetAudience: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('jsonb', { nullable: true, transformer: moneyJsonTransformer })
  deliveryConfig: any;

  @Column('jsonb', { nullable: true, transformer: moneyJsonTransformer })
  pricingRules: any;

  @Column('jsonb', { nullable: true })
  availability: any;

  @Column('jsonb', { nullable: true, transformer: moneyJsonTransformer })
  variants: any[];

  @Column({ default: false })
  enableTieredPackages: boolean;

  @Column('jsonb', { nullable: true, transformer: moneyJsonTransformer })
  tiers: any[];

  @Column({ default: true })
  requireApproval: boolean;

  @Column('jsonb', { nullable: true })
  bookingRequirements: any;

  /* ---------------- Booking & availability (Create Service flow) ---------------- */

  @Column('jsonb', { nullable: true })
  @ApiProperty({
    description: 'Where the service can be delivered',
    example: ['atBusiness', 'atCustomer'],
  })
  deliveryOptions?: ServiceDeliveryOption[];

  @Column({ type: 'varchar', default: CustomerAction.BOOK_NOW })
  @ApiProperty({
    enum: CustomerAction,
    description: 'Action customers should take for this service',
  })
  customerAction: CustomerAction;

  @Column('text', { nullable: true })
  @ApiProperty({ description: 'Instructions shown to customers when booking' })
  bookingInstructions?: string;

  @Column('text', { nullable: true })
  @ApiProperty({ description: 'How appointments are arranged' })
  appointmentArrangements?: string;

  @Column('text', { nullable: true })
  @ApiProperty({ description: 'Additional availability notes' })
  availabilityNotes?: string;

  /* ---------------- Additional information ---------------- */

  @Column('text', { nullable: true })
  @ApiProperty({ description: 'Conditions or requirements for the service' })
  serviceConditions?: string;

  @Column('jsonb', { nullable: true })
  @ApiProperty({ description: 'Frequently asked questions' })
  faqs?: { question: string; answer: string }[];

  /** Snapshot of the business location mirrored from MCOM Central. */
  @Column('jsonb', { nullable: true })
  @ApiProperty({ description: 'Business location used for this service' })
  serviceLocation?: Record<string, unknown> | null;

  @Column({ default: 'published' })
  @ApiProperty({ description: 'Status of the service', example: 'published' })
  status: string;

  @Column({ default: false })
  adminDisabled: boolean;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  isPromotionEligible: boolean;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  bookingFee?: number;

  @Column('float', { default: 0 })
  averageRating: number;

  @Column('int', { default: 0 })
  reviewCount: number;

  @OneToMany(() => Review, (review) => review.service)
  reviews: Review[];

  @OneToMany(() => BundledService, (bundled) => bundled.service, {
    cascade: true,
  })
  bundledServices: BundledService[];

  @OneToMany(() => ConfigurableAddon, (addon) => addon.service, {
    cascade: true,
  })
  configurableAddons: ConfigurableAddon[];

  @OneToMany(() => SpareCapacityOffer, (offer) => offer.service)
  spareCapacityOffers: SpareCapacityOffer[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
