import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  TableInheritance,
  Index,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import type { User } from '../../users/entities/user.entity';
import type { Business } from '../../listings/entities/listing.entity';
import type { Order } from '../../order/entities/order.entity';
import { DigitalValueTransaction } from './digital-value-transaction.entity';

export enum DigitalValueType {
  GIFT_CARD = 'GIFT_CARD',
  VOUCHER = 'VOUCHER',
}

export enum DigitalValueStatus {
  DRAFT = 'DRAFT',
  FUNDED = 'FUNDED',
  ACTIVE = 'ACTIVE',
  PARTIALLY_REDEEMED = 'PARTIALLY_REDEEMED',
  FULLY_REDEEMED = 'FULLY_REDEEMED',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
}

export enum DigitalValueDeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

@Entity('digital_values')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class DigitalValue extends AbstractBaseEntity {
  @Index()
  @Column({
    type: 'enum',
    enum: DigitalValueType,
  })
  type: DigitalValueType;

  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentBalance: number;

  @Column({ length: 3, default: 'GBP' })
  currency: string;

  @Column({
    type: 'enum',
    enum: DigitalValueStatus,
    default: DigitalValueStatus.DRAFT,
  })
  status: DigitalValueStatus;

  @Column({ nullable: true })
  expiryDate: Date;

  // Merchant Linking Logic
  @ManyToOne('Business', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Business;

  @Column({ nullable: true })
  merchantId: string;

  // Owner / Purchaser
  @ManyToOne('User', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  ownerId: string;

  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'purchaserId' })
  purchaser: User;

  @Column({ nullable: true })
  purchaserId: string;

  // Recipient details (common for both)
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

  // Delivery
  @Column({ type: 'timestamp', nullable: true })
  deliveryDate: Date;

  @Column({
    type: 'enum',
    enum: DigitalValueDeliveryStatus,
    default: DigitalValueDeliveryStatus.PENDING,
  })
  deliveryStatus: DigitalValueDeliveryStatus;

  // Relation to Transactions
  @OneToMany(() => DigitalValueTransaction, (transaction) => transaction.digitalValue, {
    cascade: true,
  })
  transactions: DigitalValueTransaction[];
}
