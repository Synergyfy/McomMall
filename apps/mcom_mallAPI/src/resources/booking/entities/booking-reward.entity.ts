import {
  Column,
  Entity,
  Index,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { ServiceBooking } from './service-booking.entity';

export enum BookingRewardStatus {
  RESERVED = 'RESERVED',
  COMMITTED = 'COMMITTED',
  RELEASED = 'RELEASED',
}

/**
 * Links a MCOM Rewards issuance to a service booking payment. Reserved while
 * the payment session is open; committed once payment is verified.
 */
@Entity('booking_rewards')
@Index('IDX_booking_reward_booking', ['booking'])
@Index('IDX_booking_reward_issuance', ['rewardIssuanceId'])
@Unique('UQ_booking_reward_booking_issuance', ['bookingId', 'rewardIssuanceId'])
export class BookingReward extends AbstractBaseEntity {
  @ManyToOne(() => ServiceBooking, { onDelete: 'CASCADE' })
  booking: ServiceBooking;

  @Column()
  bookingId: string;

  @Column()
  rewardIssuanceId: string;

  @Column({ nullable: true })
  issuerClientId?: string;

  @Column({ nullable: true })
  rewardType?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discountAmount: number;

  @Column({
    type: 'enum',
    enum: BookingRewardStatus,
    default: BookingRewardStatus.RESERVED,
  })
  status: BookingRewardStatus;

  @Column({ nullable: true })
  reservationRef?: string;

  @Column('timestamp', { nullable: true })
  committedAt?: Date | null;

  @Column('timestamp', { nullable: true })
  releasedAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
