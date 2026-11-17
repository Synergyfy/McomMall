import { Column, Entity, ManyToOne } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { UserVoucher } from './user-voucher.entity';

export enum TransactionSourceType {
  USER_DEPOSIT = 'user_deposit',
  PEER_TRANSFER = 'peer_transfer',
  SYSTEM_REWARD = 'system_reward',
  BUSINESS_CASHBACK = 'business_cashback',
  SPEND = 'spend',
}

@Entity('money_voucher_transactions')
export class VoucherTransaction extends AbstractBaseEntity {
  @ManyToOne(() => UserVoucher, (voucher) => voucher.transactions, {
    onDelete: 'CASCADE',
  })
  voucher: UserVoucher;

  @Column({
    type: 'enum',
    enum: TransactionSourceType,
  })
  sourceType: TransactionSourceType;

  @Column({ nullable: true })
  contributorId: string; // ID of User or Shop

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amount: number; // Total amount changed (can be negative)

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  realAmountDelta: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  rewardAmountDelta: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  salesImpactBefore: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  salesImpactAfter: number;
}
