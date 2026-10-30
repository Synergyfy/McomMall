import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { GiftCardTransaction } from './gift-card-transaction.entity';
import { Order } from '../../order/entities/order.entity';
import { Business } from '../../listings/entities/listing.entity';
import { GiftCardTemplate } from './gift-card-template.entity';
import { User } from '../../users/entities/user.entity';
import { GiftCardAsset } from './gift-card-asset.entity';

export enum GiftCardDeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

@Entity('gift_cards')
@Index('UQ_gift_cards_source_issuance', ['sourceApp', 'issuanceId'], {
  unique: true,
})
export class GiftCard extends AbstractBaseEntity {
  @Column({ unique: true, length: 16 })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentBalance: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column({ nullable: true })
  senderName: string;

  @Column({ nullable: true })
  senderEmail: string;

  @Column({ type: 'text', nullable: true })
  personalMessage: string;

  @Column({ type: 'text', nullable: true })
  htmlBody: string;

  @Column({ type: 'timestamp' })
  deliveryDate: Date;

  @Column({
    type: 'enum',
    enum: GiftCardDeliveryStatus,
    default: GiftCardDeliveryStatus.PENDING,
  })
  deliveryStatus: GiftCardDeliveryStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchaserId' })
  purchaser: User;

  @Column({ nullable: true })
  purchaserId: string;

  @ManyToOne(() => Business, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchaseBusinessId' })
  purchaseBusiness: Business;

  @Column({ nullable: true })
  purchaseBusinessId: string;

  @ManyToOne(() => GiftCardTemplate, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: GiftCardTemplate;

  @Column({ nullable: true })
  templateId: string;

  /** Rewards issuance this instrument was materialised from. */
  @Column({ name: 'issuance_id', nullable: true })
  issuanceId: string | null;

  /** Issuing app, e.g. `mcom-rewards`. */
  @Column({ name: 'source_app', nullable: true })
  sourceApp: string | null;

  /** Free-form partner metadata echoed back on reads. */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: Order;

  @Column({ nullable: true })
  purchaseOrderId: string;

  @ManyToOne(() => GiftCardAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assetId' })
  asset: GiftCardAsset;

  @Column({ nullable: true })
  assetId: string;

  @OneToMany(() => GiftCardTransaction, (transaction) => transaction.giftCard, {
    cascade: true,
  })
  transactions: GiftCardTransaction[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
