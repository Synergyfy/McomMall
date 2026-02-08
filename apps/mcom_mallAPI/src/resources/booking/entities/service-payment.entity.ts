import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ServiceBooking } from './service-booking.entity';
import { PaymentMethod } from '../../order/entities/order-payment.entity';

@Entity('service_payments')
export class ServicePayment extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => ServiceBooking, (booking) => booking.payment)
  booking: ServiceBooking;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  currency: string;

  @Column()
  transactionId: string;
}
