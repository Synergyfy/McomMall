import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { moneyTransformer } from '../../../common/money/money';
import { User } from '../../users/entities/user.entity';
import { Membership } from './membership.entity';

/**
 * One row per attempted renewal period. This is the audit trail for recurring
 * wallet debits, independent of the single `membership_payments` row.
 */
@Entity('membership_renewals')
@Index('IDX_membership_renewal_membership', ['membershipId'])
@Index('UQ_membership_renewal_period', ['membershipId', 'periodStart'], {
  unique: true,
})
export class MembershipRenewal extends AbstractBaseEntity {
  @Column()
  membershipId: string;

  @ManyToOne(() => Membership, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membershipId' })
  membership: Membership;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amount: number;

  @Column({ length: 3, default: 'GBP' })
  currency: string;

  /** paid | failed | canceled */
  @Column({ default: 'paid' })
  status: string;

  @Column({ default: 'mcom_wallet' })
  provider: string;

  @Column({ nullable: true })
  transactionId: string | null;

  @Column({ type: 'timestamptz' })
  periodStart: Date;

  @Column({ type: 'timestamptz', nullable: true })
  periodEnd: Date | null;

  @Column({ default: 1 })
  attempt: number;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
