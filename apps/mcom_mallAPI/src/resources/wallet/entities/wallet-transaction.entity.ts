import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Wallet } from './wallet.entity';

export enum WalletTransactionType {
  EARNING_ORDER = 'earning_order',
  EARNING_GIFT_CARD = 'earning_gift_card',
  EARNING_VOUCHER = 'earning_voucher',
  EARNING_COUPON = 'earning_coupon',
  EARNING_TERMINAL_CASHBACK = 'earning_terminal_cashback',
  EARNING_BOOKING = 'earning_booking',
  BOOKING_PAYMENT_RELEASED = 'booking_payment_released',
  WITHDRAWAL = 'withdrawal',
  SPEND = 'spend',
  FUNDING = 'funding',
  ADJUSTMENT = 'adjustment',
}

@Entity('wallet_transactions')
export class WalletTransaction extends AbstractBaseEntity {
  @ManyToOne(() => Wallet)
  wallet: Wallet;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: WalletTransactionType,
  })
  type: WalletTransactionType;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  balanceAfter: number;
}
