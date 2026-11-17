import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Offer } from './offer.entity';
import { User } from '../../users/entities/user.entity';

/** A customer's activation/claim history for a specific time bonus. */
@Entity('time_bonus_enrollments')
@Index('UQ_time_bonus_enrollments_offer_user', ['offerId', 'userId'], {
  unique: true,
})
export class TimeBonusEnrollment extends AbstractBaseEntity {
  @Column()
  offerId: string;

  @ManyToOne(() => Offer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offerId' })
  offer: Offer;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', default: 0 })
  claims: number;

  @Column({ type: 'timestamp', nullable: true })
  lastClaimedAt?: Date | null;
}
