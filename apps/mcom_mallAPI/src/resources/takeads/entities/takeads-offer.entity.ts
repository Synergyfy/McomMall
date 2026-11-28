import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import {
  TakeadsApprovalStatus,
  TakeadsOfferType,
  TakeadsPublicationStatus,
  TakeadsSourceType,
  TakeadsVisibility,
} from '../takeads.constants';

/**
 * The publishable TakeAds record. Source fields are read-only for admins;
 * presentation fields are MCOM-controlled.
 */
@Entity('takeads_offers')
export class TakeadsOffer extends AbstractBaseEntity {
  @Index('IDX_takeads_offers_source_type')
  @Column({ type: 'varchar', length: 20, default: 'product_url' })
  sourceType: TakeadsSourceType;

  @Index('IDX_takeads_offers_merchant')
  @Column({ type: 'varchar', length: 160, nullable: true })
  externalMerchantId?: string | null;

  @Index('IDX_takeads_offers_coupon')
  @Column({ type: 'varchar', length: 160, nullable: true })
  externalCouponId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  externalProgramId?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  merchantName?: string | null;

  @Column({ type: 'varchar', length: 2048 })
  destinationUrl: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  resolvedTrackingUrl?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  linkResolvedAt?: Date | null;

  @Index('IDX_takeads_offers_subid', { unique: true })
  @Column({ type: 'varchar', length: 30, nullable: true })
  subId?: string | null;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column('simple-array', { nullable: true })
  images?: string[] | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageSource?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mcomSectorId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mcomCategoryId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mcomSubCategoryId?: string | null;

  @Column({ type: 'varchar', length: 2, default: 'GB' })
  countryCode: string;

  @Column({ type: 'varchar', length: 8, default: 'GBP' })
  currency: string;

  /** GBP pounds are stored as integer pence. Only source-authorised prices. */
  @Column({ type: 'int', nullable: true })
  price?: number | null;

  @Index('IDX_takeads_offers_visibility')
  @Column({ type: 'varchar', length: 20, default: 'public' })
  visibility: TakeadsVisibility;

  /** PlanVariant IDs from /admin/plans, e.g. Gold · Pro or Silver · Standard. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  allowedPlanVariantIds: string[];

  @Index('IDX_takeads_offers_type')
  @Column({ type: 'varchar', length: 20, default: 'product' })
  offerType: TakeadsOfferType;

  @Column({ type: 'varchar', length: 120, nullable: true })
  campaignLabel?: string | null;

  @Column({ type: 'varchar', length: 40, default: 'marketplace' })
  placement: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date | null;

  @Index('IDX_takeads_offers_approval')
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  approvalStatus: TakeadsApprovalStatus;

  @Index('IDX_takeads_offers_publication')
  @Column({ type: 'varchar', length: 20, default: 'unpublished' })
  publicationStatus: TakeadsPublicationStatus;

  @Column({ default: true })
  upstreamActive: boolean;

  @Column({ default: false })
  adminDisabled: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'text', nullable: true })
  reviewNote?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncedAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, unknown> | null;
}
