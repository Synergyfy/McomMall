import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { NotificationType } from '../notification.enum';
import { User } from '../../users/entities/user.entity';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';

@Entity()
export class Notification extends AbstractBaseEntity {
  @Column({ type: 'uuid' })
  recipientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({ type: 'uuid', nullable: true })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ type: 'varchar', length: 32, default: 'in_app' })
  channel: string;

  @Column({ default: false })
  seen: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
