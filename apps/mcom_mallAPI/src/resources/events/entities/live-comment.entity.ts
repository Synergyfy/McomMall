import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Event } from './event.entity';
import { User } from '../../users/entities/user.entity';

@Entity('live_comments')
export class LiveComment extends AbstractBaseEntity {
  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  @Index()
  event: Event;

  @Column({ nullable: true })
  authorName?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int', default: 0 })
  likes: number;
}
