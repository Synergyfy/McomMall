import {
  Column,
  Entity,
  ManyToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { UserVoucher } from './user-voucher.entity';

export enum TransactionSourceType {
  USER_DEPOSIT = 'user_deposit',
  PEER_TRANSFER = 'peer_transfer',
  SYSTEM_REWARD = 'system_reward',
  BUSINESS_CASHBACK = 'business_cashback',
  SPEND = 'spend'
}

@Entity('money_voucher_transactions')
export class VoucherTransaction extends AbstractBaseEntity {
  @ManyToOne(() => UserVoucher, (voucher) => voucher.transactions, { onDelete: 'CASCADE' })
  voucher: UserVoucher;

  @Column({
    type: 'enum',
    enum: TransactionSourceType,
  })
  sourceType: TransactionSourceType;

  @Column({ nullable: true })
  contributorId: string; // ID of User or Shop

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number; // Total amount changed (can be negative)

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  realAmountDelta: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  rewardAmountDelta: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salesImpactBefore: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salesImpactAfter: number;
}
