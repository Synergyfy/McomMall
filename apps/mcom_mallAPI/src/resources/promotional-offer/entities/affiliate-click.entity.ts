import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Business } from '../../listings/entities/listing.entity';
import { PromotionalOffer } from './promotional-offer.entity';

/**
 * Internal click ledger. Kept independently from Awin so the platform can
 * reconcile its own attribution even when Awin cannot attribute a sale.
 */
@Entity('affiliate_clicks')
export class AffiliateClick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_affiliate_clicks_offer')
  @Column({ type: 'uuid', nullable: true })
  offerId?: string | null;

  /** Null means the platform itself generated the click. */
  @Index('IDX_affiliate_clicks_business')
  @Column({ type: 'uuid', nullable: true })
  businessId?: string | null;

  /** Promotional campaign that generated the click, when applicable. */
  @Index('IDX_affiliate_clicks_campaign')
  @Column({ type: 'uuid', nullable: true })
  campaignId?: string | null;

  @Index('IDX_affiliate_clicks_clickref', { unique: true })
  @Column({ length: 160 })
  clickRef: string;

  @Column({ nullable: true })
  source?: string;

  @Column({ type: 'varchar', length: 2048 })
  destinationUrl: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  trackingUrl?: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  referrer?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ipHash?: string;

  @Column({ default: false })
  attributed: boolean;

  @Column({ type: 'uuid', nullable: true })
  transactionId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => PromotionalOffer, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'offerId' })
  offer?: PromotionalOffer | null;

  @ManyToOne(() => Business, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'businessId' })
  business?: Business | null;
}
