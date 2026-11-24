import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { moneyTransformer } from '../../../common/money/money';
import { Business } from '../../listings/entities/listing.entity';
import { PromotionalOffer } from './promotional-offer.entity';
import { AffiliateClick } from './affiliate-click.entity';

export type AffiliateTransactionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'amended'
  | 'unknown';

/** A transaction synchronised from Awin (or inserted manually by an admin). */
@Entity('affiliate_transactions')
export class AffiliateTransaction extends AbstractBaseEntity {
  @Index('IDX_affiliate_transactions_external', { unique: true })
  @Column({ length: 160 })
  externalTransactionId: string;

  @Index('IDX_affiliate_transactions_offer')
  @Column({ type: 'uuid', nullable: true })
  offerId?: string | null;

  @Index('IDX_affiliate_transactions_business')
  @Column({ type: 'uuid', nullable: true })
  businessId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  clickId?: string | null;

  @Index('IDX_affiliate_transactions_clickref')
  @Column({ length: 160, nullable: true })
  clickRef?: string | null;

  @Column({ nullable: true })
  advertiserId?: string;

  @Column({ nullable: true })
  advertiserName?: string;

  @Column({ type: 'varchar', length: 24, default: 'unknown' })
  status: AffiliateTransactionStatus;

  /** Raw status exactly as returned by Awin. */
  @Column({ nullable: true })
  rawStatus?: string;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  saleAmount?: number | null;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  commissionAmount?: number | null;

  @Column({ length: 8, default: 'GBP' })
  currency: string;

  @Column({ type: 'timestamptz', nullable: true })
  transactionDate?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, unknown> | null;

  @ManyToOne(() => PromotionalOffer, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'offerId' })
  offer?: PromotionalOffer | null;

  @ManyToOne(() => Business, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'businessId' })
  business?: Business | null;

  @ManyToOne(() => AffiliateClick, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'clickId' })
  click?: AffiliateClick | null;
}
