import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import {
  TakeadsApprovalStatus,
  TakeadsPublicationStatus,
} from '../takeads.constants';

/**
 * A coupon imported from TakeAds. Coupons are catalog candidates and are not
 * public until an admin approves and publishes them (directly or via an offer).
 */
@Entity('takeads_coupons')
export class TakeadsCoupon extends AbstractBaseEntity {
  @Index('IDX_takeads_coupons_external', { unique: true })
  @Column({ length: 160 })
  externalCouponId: string;

  @Index('IDX_takeads_coupons_merchant')
  @Column({ type: 'uuid', nullable: true })
  merchantId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  externalMerchantId?: string | null;

  @Column({ length: 300 })
  name: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  trackingLink?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  languageCodes?: string[] | null;

  @Column('simple-array', { nullable: true })
  countryCodes?: string[] | null;

  @Column('simple-array', { nullable: true })
  upstreamCategoryIds?: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncedAt?: Date | null;

  @Index('IDX_takeads_coupons_approval')
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  approvalStatus: TakeadsApprovalStatus;

  @Index('IDX_takeads_coupons_publication')
  @Column({ type: 'varchar', length: 20, default: 'unpublished' })
  publicationStatus: TakeadsPublicationStatus;

  @Column({ default: false })
  adminDisabled: boolean;

  @Column({ type: 'text', nullable: true })
  reviewNote?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;
}
