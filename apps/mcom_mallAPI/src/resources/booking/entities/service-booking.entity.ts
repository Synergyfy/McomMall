import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from './booking.enum';
import { ServicePayment } from './service-payment.entity';
import { ProductServiceBooking } from '../../order/entities/product-service-booking.entity';
import { BookingTransaction } from './booking-transaction.entity';

@Entity('service_bookings')
export class ServiceBooking extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Service)
  service: Service;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @OneToOne(() => ServicePayment, (payment) => payment.booking, {
    nullable: true,
  })
  @JoinColumn()
  payment: ServicePayment;

  @Column({ default: false })
  businessOwnerCompleted: boolean;

  @Column({ default: false })
  customerCompleted: boolean;

  @Column({ type: 'int', default: 1 })
  numberOfGuests: number;

  @Column({ type: 'int', default: 1 })
  numberOfStaff: number;

  @Column({ type: 'jsonb', nullable: true })
  addonDetails: any; // Stores name and price of selected addons at time of booking

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  problemDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  photos: string[];

  @Column({ type: 'jsonb', nullable: true })
  config: any; // Stores answers to custom questions

  @OneToOne(
    () => ProductServiceBooking,
    (productServiceBooking) => productServiceBooking.serviceBooking,
  )
  productServiceBooking: ProductServiceBooking;

  // --- Escrow & Payment Tracking Fields ---
  @Column({ type: 'float', default: 0 })
  totalAmount: number;

  @Column({ type: 'float', default: 0 })
  commissionAmount: number;

  @Column({ type: 'float', default: 0 })
  providerAmount: number;

  @Column({ nullable: true })
  paymentIntentId: string; // Stripe PaymentIntent or PayPal Order ID

  @Column({ nullable: true })
  transferId: string; // Stripe Connect Transfer ID or PayPal Payout Batch ID

  @Column({ nullable: true })
  refundId: string;

  @Column({ default: false })
  payoutProcessed: boolean;

  @Column({ default: false })
  refundProcessed: boolean;

  @OneToMany(() => BookingTransaction, (transaction) => transaction.booking)
  transactions: BookingTransaction[];
}
