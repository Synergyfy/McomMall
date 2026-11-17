import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { moneyJsonTransformer } from '../../../common/money/money';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { BookingStatus } from './booking.enum';
import { ServicePayment } from './service-payment.entity';
import { ProductServiceBooking } from '../../order/entities/product-service-booking.entity';
import { BookingTransaction } from './booking-transaction.entity';

@Entity('service_bookings')
@Index('IDX_service_booking_user', ['user'])
@Index('IDX_service_booking_service', ['service'])
@Index('IDX_service_booking_status', ['status'])
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

  @Column({ type: 'jsonb', nullable: true, transformer: moneyJsonTransformer })
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

  @Column({ nullable: true })
  variantId: string;

  @Column({ nullable: true })
  tierId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @OneToOne(
    () => ProductServiceBooking,
    (productServiceBooking) => productServiceBooking.serviceBooking,
  )
  productServiceBooking: ProductServiceBooking;

  // --- Escrow & Payment Tracking Fields ---
  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  totalAmount: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  commissionAmount: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  providerAmount: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  rewardDiscountApplied: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  couponDiscountApplied: number;

  @Column({ nullable: true })
  couponCode: string;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  giftCardAmountApplied: number;

  @Column({ nullable: true })
  giftCardCode: string;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  voucherAmountApplied: number;

  @Column({ nullable: true })
  voucherCode: string;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  moneyVoucherAmountApplied: number;

  @Column({ nullable: true })
  moneyVoucherCode: string;

  @Column({
    name: 'money_voucher_real_amount_applied',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  moneyVoucherRealAmountApplied: number;

  @Column({
    name: 'money_voucher_reward_amount_applied',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  moneyVoucherRewardAmountApplied: number;

  @Column({ name: 'price_reducer_code', nullable: true })
  priceReducerCode: string;

  @Column({
    name: 'price_reducer_amount_applied',
    type: 'bigint',
    default: 0,
    transformer: moneyTransformer,
  })
  priceReducerAmountApplied: number;

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
