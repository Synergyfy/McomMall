import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { TakeadsMerchantStatus } from '../takeads.constants';

/**
 * A merchant imported from the TakeAds directory.
 *
 * The upstream record is preserved for audit; MCOM review fields are kept
 * separate so a sync never overwrites an admin decision.
 */
@Entity('takeads_merchants')
export class TakeadsMerchant extends AbstractBaseEntity {
  @Index('IDX_takeads_merchants_external', { unique: true })
  @Column({ length: 160 })
  externalMerchantId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  defaultDomain?: string | null;

  @Column('simple-array', { nullable: true })
  domains?: string[] | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', nullable: true })
  upstreamCategoryId?: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  currencyCode?: string | null;

  @Column('simple-array', { nullable: true })
  countryCodes?: string[] | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  deeplinkAllowed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  commissionMetadata?: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  trackingLink?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncedAt?: Date | null;

  @Index('IDX_takeads_merchants_status')
  @Column({ type: 'varchar', length: 20, default: 'not_reviewed' })
  mcomStatus: TakeadsMerchantStatus;

  @Column({ type: 'varchar', nullable: true })
  mcomSectorId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mcomCategoryId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  mcomSubCategoryId?: string | null;

  @Column({ type: 'text', nullable: true })
  reviewNote?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;
}
