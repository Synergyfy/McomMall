import {
  Column,
  Entity,
  Index,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { moneyTransformer } from '../../../common/money/money';
import { PromotionalOfferBusiness } from './promotional-offer-business.entity';
import { BusinessPromotionalOffer } from './business-promotional-offer.entity';

export type PromotionalOfferingType = 'product' | 'service' | 'offer';
export type PromotionalOfferStatus =
  | 'draft'
  | 'active'
  | 'inactive'
  | 'archived';
export type PromotionalOfferAvailability = 'all' | 'selected';

/**
 * Admin-created promotional products and services.
 *
 * These are deliberately stored separately from the merchant-owned `Products`
 * and `services` tables: the offering belongs to an external advertiser, not
 * to MCOM or the promoting business. Businesses can import an offer into their
 * storefront, but they never own or edit it.
 */
@Entity('promotional_offers')
export class PromotionalOffer extends AbstractBaseEntity {
  @Column({ length: 200 })
  name: string;

  @Index('IDX_promotional_offers_type')
  @Column({ type: 'varchar', length: 20, default: 'product' })
  offeringType: PromotionalOfferingType;

  @Column({ nullable: true })
  sector?: string;

  /** Stable MCOM Central Hub taxonomy ID (local taxonomy ID when unmapped). */
  @Index('IDX_promotional_offers_sector_id')
  @Column({ nullable: true })
  sectorId?: string | null;

  @Column({ nullable: true })
  category?: string;

  @Index('IDX_promotional_offers_category_id')
  @Column({ nullable: true })
  categoryId?: string | null;

  @Column({ nullable: true })
  subCategory?: string;

  @Index('IDX_promotional_offers_subcategory_id')
  @Column({ nullable: true })
  subCategoryId?: string | null;

  @Column({ nullable: true })
  brand?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column({ type: 'text', nullable: true })
  shortDescription?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  images?: string[];

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  price?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  salePrice?: number;

  @Column({ length: 8, default: 'GBP' })
  currency: string;

  /** The advertiser's own product/service page. */
  @Column({ type: 'varchar', length: 2048 })
  destinationUrl: string;

  /** Optional pre-built tracking URL. `{clickref}` is replaced when present. */
  @Column({ type: 'varchar', length: 2048, nullable: true })
  affiliateTrackingUrl?: string;

  @Column({ length: 40, default: 'awin' })
  affiliateNetwork: string;

  @Column({ nullable: true })
  advertiserId?: string;

  @Column({ nullable: true })
  advertiserName?: string;

  @Column({ nullable: true })
  advertiserProgramme?: string;

  @Column({ nullable: true })
  awinProductId?: string;

  /** Platform commission rate (%). Informational for reporting. */
  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  commissionRate: number;

  /** Share of attributed commission passed to the promoting business (%). */
  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  businessCommissionRate: number;

  @Index('IDX_promotional_offers_availability')
  @Column({ type: 'varchar', length: 20, default: 'all' })
  availability: PromotionalOfferAvailability;

  @Index('IDX_promotional_offers_status')
  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: PromotionalOfferStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'text', nullable: true })
  termsAndConditions?: string;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string | null;

  @OneToMany(
    () => PromotionalOfferBusiness,
    (selection) => selection.offer,
  )
  availableBusinesses?: PromotionalOfferBusiness[];

  @OneToMany(
    () => BusinessPromotionalOffer,
    (importRecord) => importRecord.offer,
  )
  businessImports?: BusinessPromotionalOffer[];
}
