import { Business } from '../../listings/entities/listing.entity';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

import { ProductVariantConfig, ProductAttribute, ProductVariation } from '../interfaces/product-variant.interface';

@Entity('Products')
export class Product extends AbstractBaseEntity {
  @ManyToOne(() => User, { nullable: true })
  serviceProvider?: User;

  @ManyToOne(() => Business, (business) => business.products)
  business: Business;

  @Column({ type: 'jsonb', nullable: true })
  attributes: ProductAttribute[];

  @Column({ type: 'jsonb', nullable: true })
  variations: ProductVariation[];

  @Column({ type: 'boolean', default: true })
  useVariantPricing: boolean;

  @Column({ type: 'jsonb', nullable: true })
  variantConfig: ProductVariantConfig[];

  @Column({ nullable: true })
  subCategory: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  shippingMethod: string;

  @Column('simple-array', { nullable: true })
  fulfillmentType: string[];

  @Column({ type: 'boolean', default: false })
  isFreeDelivery: boolean;

  @Column({ type: 'boolean', default: false })
  isPaidDelivery: boolean;

  @Column({ type: 'float', nullable: true })
  freeDeliveryRadius: number;

  @Column({ type: 'text', nullable: true })
  pickupInstructions: string;

  @Column()
  title: string;

  @Column()
  productType: string;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'float', nullable: true })
  salePrice: number;

  @Column({ nullable: true })
  shortDescription: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array', { nullable: true })
  media: string[];

  // FOR VIRTUAL PRODUCTS

  @Column({ nullable: true })
  productUrl?: string;

  //FOR DOWNLOADABLE FILES
  @Column('simple-array', { nullable: true })
  fileUrls?: string[];

  @Column('int', { default: -1 })
  downloadLimit: number;

  @Column('int', { default: -1 })
  downloadExpiry: number;
  // DOWNLOADABLE FILES ENDS

  // PHYSICAL PRODUCTS
  @Column({ nullable: false, unique: true })
  sku?: string;

  @Column('boolean', { default: true })
  enableStockManagement: boolean;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', nullable: true })
  lowStockThreshold: number;

  // PHYSICAL PRODUCTS SHIPPING
  @Column('float', { default: 0 })
  weight: number;
  @Column('float', { default: 0 })
  length: number;
  @Column('float', { default: 0 })
  width: number;
  @Column('float', { default: 0 })
  height: number;

  // PHYSICAL PRODUCTS ENDS

  @Column({ type: 'jsonb', nullable: true })
  sizeGuide: any;

  @Column('varchar', { default: 'draft' })
  productStatus: string;

  @Column('varchar', { default: 'draft' })
  visibility: string;

  @Column('varchar', { nullable: true })
  purchaseNote?: string;

  @Column('boolean', { default: true })
  enableReviews: boolean;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column()
  category: string;

  @Column({ default: false })
  isFeatured: boolean;
}
