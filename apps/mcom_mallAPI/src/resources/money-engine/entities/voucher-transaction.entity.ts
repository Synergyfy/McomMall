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

  /**
   * Typed contributor so business cashback can never be confused with a user
   * deposit again (`user` | `business` | `system`).
   */
  @Column({ name: 'contributor_type', nullable: true })
  contributorType: string | null;

  /** Business the transaction was bound to (spend / cashback / issuance). */
  @Column({ name: 'business_id', type: 'uuid', nullable: true })
  businessId: string | null;

  /** Order or booking id, so per-reference real/reward splits are auditable. */
  @Column({ name: 'reference_id', type: 'varchar', nullable: true })
  referenceId: string | null;

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
