import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum EventRsvpStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('event_rsvps')
@Unique(['userId', 'eventId'])
export class EventRsvp extends AbstractBaseEntity {
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: string;

  @Column({
    type: 'enum',
    enum: EventRsvpStatus,
    default: EventRsvpStatus.CONFIRMED,
  })
  status: EventRsvpStatus;

  @Column({ nullable: true })
  attendedAt: Date;
}
