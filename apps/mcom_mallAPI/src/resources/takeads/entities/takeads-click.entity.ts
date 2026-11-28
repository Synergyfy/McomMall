import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

/** MCOM-owned click ledger. TakeAds click reports are aggregates, not events. */
@Entity('takeads_clicks')
export class TakeadsClick extends AbstractBaseEntity {
  @Index('IDX_takeads_clicks_offer')
  @Column({ type: 'uuid', nullable: true })
  offerId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  merchantId?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  couponId?: string | null;

  @Index('IDX_takeads_clicks_ref', { unique: true })
  @Column({ length: 160 })
  clickRef: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  subId?: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  source?: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  placement?: string | null;

  @Column({ type: 'varchar', length: 2048 })
  destinationUrl: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  trackingUrl?: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  referrer?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ipHash?: string | null;
}
