import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/**
 * Daily TakeAds click aggregate. This is not an event log; MCOM's own click
 * ledger (`takeads_clicks`) stays the source for marketplace events.
 */
@Entity('takeads_click_reports')
export class TakeadsClickReport extends AbstractBaseEntity {
  @Index('IDX_takeads_click_reports_key', { unique: true })
  @Column({ length: 400 })
  reportKey: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  adspaceId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  merchantId?: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  merchantName?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  couponId?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  subId?: string | null;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ type: 'timestamptz', nullable: true })
  sourceUpdatedAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, unknown> | null;
}
