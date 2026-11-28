import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { TakeadsActionStatus } from '../takeads.constants';

/**
 * A TakeAds conversion/action record. Status and `advertiserPaid` are separate
 * signals; only CONFIRMED/SETTLED rows count towards validated commission.
 */
@Entity('takeads_actions')
export class TakeadsAction extends AbstractBaseEntity {
  @Index('IDX_takeads_actions_action', { unique: true })
  @Column({ length: 160 })
  actionId: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  actionNumericId?: string | null;

  @Index('IDX_takeads_actions_status')
  @Column({ type: 'varchar', length: 20 })
  status: TakeadsActionStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  type?: string | null;

  @Index('IDX_takeads_actions_merchant')
  @Column({ type: 'varchar', length: 160, nullable: true })
  merchantId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  adspaceId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  programId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  couponId?: string | null;

  @Index('IDX_takeads_actions_subid')
  @Column({ type: 'varchar', length: 30, nullable: true })
  subId?: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  orderAmount?: string | null;

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  publisherRevenue?: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  currencyCode?: string | null;

  @Column({ type: 'boolean', nullable: true })
  advertiserPaid?: boolean | null;

  @Column({ type: 'timestamptz', nullable: true })
  orderDate?: Date | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  clickId?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sourceCreatedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  sourceUpdatedAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, unknown> | null;
}
