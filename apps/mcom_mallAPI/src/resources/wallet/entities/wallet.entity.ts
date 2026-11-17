import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
export class Wallet extends AbstractBaseEntity {
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  balance: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  earningsBalance: number;

  /**
   * Cashback that must stay inside the network. It is included in
   * `earningsBalance` for reporting but is excluded from withdrawable funds.
   */
  @Column({
    name: 'locked_cashback_balance',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  lockedCashbackBalance: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  spendableBalance: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  pendingBalance: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  earningsFromOrders: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  earningsFromGiftCard: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  earningsFromVoucher: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  earningsFromBookings: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  earningsFromCoupons: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  earningsFromTerminalCashback: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
