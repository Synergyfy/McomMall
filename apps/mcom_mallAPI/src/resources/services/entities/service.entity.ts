import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { BundledService } from './bundled-service.entity';
import { ConfigurableAddon } from './configurable-addon.entity';
import { GuestPricingModel, PricingModel } from '../service.enum';
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
  @ApiProperty({ description: 'Name of the service', example: 'Professional House Cleaning' })
  name: string;

  @Column('text', { nullable: true })
  @IsOptional()
  @ApiProperty({ description: 'Detailed description', example: 'Complete professional cleaning' })
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

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  @ApiProperty({ description: 'Fixed price', example: 100.0 })
  fixedPrice?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerHour?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
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

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerGuest?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  fixedGroupPrice?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  basePrice?: number;

  @Column('int', { nullable: true })
  baseGuests?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  additionalGuestPrice?: number;

  @Column({ default: false })
  isQuoteModel: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Category', example: 'Home Services' })
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column('simple-array', { nullable: true })
  targetAudience: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('jsonb', { nullable: true })
  deliveryConfig: any;

  @Column('jsonb', { nullable: true })
  pricingRules: any;

  @Column('jsonb', { nullable: true })
  availability: any;

  @Column('jsonb', { nullable: true })
  variants: any[];

  @Column({ default: false })
  enableTieredPackages: boolean;

  @Column('jsonb', { nullable: true })
  tiers: any[];

  @Column({ default: true })
  requireApproval: boolean;

  @Column('jsonb', { nullable: true })
  bookingRequirements: any;

  @Column({ default: 'published' })
  @ApiProperty({ description: 'Status of the service', example: 'published' })
  status: string;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  bookingFee?: number;

  @OneToMany(() => BundledService, (bundled) => bundled.service, {
    cascade: true,
  })
  bundledServices: BundledService[];

  @OneToMany(() => ConfigurableAddon, (addon) => addon.service, {
    cascade: true,
  })
  configurableAddons: ConfigurableAddon[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
