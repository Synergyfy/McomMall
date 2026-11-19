import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentMethod } from '../../order/entities/order-payment.entity';
import { Membership } from './membership.entity';

@Entity('membership_payments')
export class MembershipPayment extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => Membership, (membership) => membership.payment)
  membership: Membership;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amount: number;

  @Column()
  currency: string;

  @Column({ unique: true })
  transactionId: string;

  /** MCOM Pay charge id (Central Hub). */
  @Column({ nullable: true, unique: true })
  mcomChargeId?: string | null;

  @Column({ nullable: true })
  providerRef?: string | null;

  @Column({ type: 'bigint', nullable: true })
  feeMinor?: string | null;

  @Column({ type: 'bigint', nullable: true })
  netMinor?: string | null;

  @Column({ nullable: true })
  status?: string | null;
}
