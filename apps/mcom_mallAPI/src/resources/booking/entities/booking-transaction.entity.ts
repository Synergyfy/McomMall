import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { ServiceBooking } from './service-booking.entity';

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  COMMISSION = 'COMMISSION',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('booking_transactions')
export class BookingTransaction extends AbstractBaseEntity {
  @ManyToOne(() => ServiceBooking, (booking) => booking.transactions)
  booking: ServiceBooking;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'float' })
  amount: number;

  @Column({ nullable: true })
  referenceId: string; // Stripe/PayPal ID

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;
}
