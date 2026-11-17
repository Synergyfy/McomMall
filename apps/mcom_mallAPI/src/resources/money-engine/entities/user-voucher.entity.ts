import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
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

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  realBalance: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  rewardBalance: number;

  /** Canonical total worth snapshot, copied from the definition at issuance. */
  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  faceValue: number | null;

  /** Cumulative cashback credited by businesses, used to enforce the cap. */
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  cashbackCredited: number;

  /** Cumulative value this wallet has driven through the network. */
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  salesAttributed: number;

  /**
   * How much real money this wallet is allowed to collect from the owner and
   * friends/family. `null` means "no contribution cap beyond faceValue".
   * A purchased wallet sets this to the amount already paid, so it cannot be
   * topped up; a campaign-issued wallet sets it to the real share target.
   */
  @Column({
    name: 'real_contribution_target',
    type: 'bigint',
    nullable: true,
    transformer: moneyTransformer,
  })
  realContributionTarget: number | null;

  /**
   * Behaviour snapshot (`spending_power` | `price_reducer`). Copied from the
   * definition so redemption does not depend on a nullable join.
   */
  @Column({ type: 'varchar', length: 32, nullable: true })
  functionalType: string | null;

  /** Wallet expiry. Enforced lazily on every read/write path. */
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  /** User who issued a campaign/promotional wallet, when applicable. */
  @Column({ name: 'issued_by_user_id', type: 'uuid', nullable: true })
  issuedByUserId: string | null;

  /** Business that issued a Voucher Coupon, when applicable. */
  @Column({ name: 'issuer_business_id', type: 'uuid', nullable: true })
  issuerBusinessId: string | null;

  /**
   * Partner/campaign idempotency key. When supplied, issuing the same key
   * twice returns the original wallet instead of minting a second one.
   */
  @Column({ name: 'issuance_id', nullable: true })
  issuanceId: string | null;

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
