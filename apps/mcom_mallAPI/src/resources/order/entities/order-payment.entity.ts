import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Order } from './order.entity';

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

@Entity('order_payments')
export class OrderPayment extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  currency: string;

  @Column()
  transactionId: string;
}
