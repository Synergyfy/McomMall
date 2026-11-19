import { Entity, Column, ManyToOne, OneToOne } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
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

  @Column({ type: 'bigint', transformer: moneyTransformer })
  amount: number;

  @Column()
  currency: string;

  @Column()
  transactionId: string;

  /** MCOM Pay charge id (Central Hub). Unique: one charge funds one booking. */
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
