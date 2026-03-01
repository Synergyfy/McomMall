import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';

export enum GroupMessageType {
  GROUP = 'GROUP',
  DIRECT = 'DIRECT',
}

@Entity('group_circle_messages')
export class GroupCircleMessage extends AbstractBaseEntity {
  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: GroupMessageType,
    default: GroupMessageType.GROUP,
  })
  type: GroupMessageType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({ nullable: true })
  recipientId: string;

  @ManyToOne(() => Group, (group) => group.messages)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  groupId: string;
}
