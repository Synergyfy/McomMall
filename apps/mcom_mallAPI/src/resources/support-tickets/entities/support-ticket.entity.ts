import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SupportMessage } from './support-message.entity';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('support_tickets')
export class SupportTicket extends AbstractBaseEntity {
  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => SupportMessage, (message) => message.ticket, {
    cascade: true,
  })
  messages: SupportMessage[];

  @Column({ nullable: true })
  lastMessageAt: Date;
}
