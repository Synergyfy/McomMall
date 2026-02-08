import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { GiftCard } from './gift-card.entity';
import { Order } from '../../order/entities/order.entity';
import { User } from '../../users/entities/user.entity';

export enum GiftCardTransactionType {
  PURCHASE = 'PURCHASE',
  REDEEM = 'REDEEM',
  REFUND = 'REFUND',
  RELOAD = 'RELOAD',
  ADJUSTMENT = 'ADJUSTMENT',
  EXPIRY = 'EXPIRY',
}

@Entity('gift_card_transactions')
export class GiftCardTransaction extends AbstractBaseEntity {
  @ManyToOne(() => GiftCard, (giftCard) => giftCard.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'giftCardId' })
  giftCard: GiftCard;

  @Column()
  giftCardId: string;

  @ManyToOne(() => Order, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: GiftCardTransactionType,
  })
  type: GiftCardTransactionType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processedById' })
  processedBy?: User;

  @Column({ nullable: true })
  processedById?: string;
}