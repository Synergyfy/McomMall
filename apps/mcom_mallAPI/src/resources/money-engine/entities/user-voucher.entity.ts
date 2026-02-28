import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { RewardDefinition } from './reward-definition.entity';
import { VoucherTransaction } from './voucher-transaction.entity';

export enum VoucherState {
  ACTIVE = 'active',
  DEPLETED = 'depleted',
  EXPIRED = 'expired',
}

@Entity('user_money_vouchers')
export class UserVoucher extends AbstractBaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @ManyToOne(() => RewardDefinition, { eager: true })
  definition: RewardDefinition;

  @Column({ unique: true, length: 12 })
  code: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  realBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  rewardBalance: number;

  @Column({
    type: 'enum',
    enum: VoucherState,
    default: VoucherState.ACTIVE,
  })
  state: VoucherState;

  @OneToMany(() => VoucherTransaction, (tx) => tx.voucher)
  transactions: VoucherTransaction[];

  // Virtual column / Getter
  get totalBalance(): number {
    return Number(this.realBalance) + Number(this.rewardBalance);
  }
}
