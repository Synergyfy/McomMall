import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
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

  @Column({ type: 'float' })
  amount: number;

  @Column()
  currency: string;

  @Column({ unique: true })
  transactionId: string;
}
