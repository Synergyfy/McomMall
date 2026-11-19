import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from './order.entity';

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  MCOM_WALLET = 'mcom_wallet',
}

@Entity('order_payments')
export class OrderPayment extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;

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

  /** Provider handle: Stripe PaymentIntent id or PayPal order id. */
  @Column({ nullable: true })
  providerRef?: string | null;

  @Column({ type: 'bigint', nullable: true })
  feeMinor?: string | null;

  @Column({ type: 'bigint', nullable: true })
  netMinor?: string | null;

  @Column({ nullable: true })
  status?: string | null;
}
