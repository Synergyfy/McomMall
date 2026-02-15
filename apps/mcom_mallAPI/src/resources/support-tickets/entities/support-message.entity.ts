import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SupportTicket } from './support-ticket.entity';

@Entity('support_messages')
export class SupportMessage extends AbstractBaseEntity {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages)
  ticket: SupportTicket;

  @Column()
  ticketId: string;

  @Column({ default: false })
  isAdminMessage: boolean;
}
