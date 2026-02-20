import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';
import { GroupMemberStatus } from '../group-member-status.enum';

@Entity('group_members')
export class GroupMember extends AbstractBaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Group, (group) => group.members)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  groupId: string;

  @Column({
    type: 'enum',
    enum: GroupMemberStatus,
    default: GroupMemberStatus.PENDING_PAYMENT,
  })
  status: GroupMemberStatus;
}