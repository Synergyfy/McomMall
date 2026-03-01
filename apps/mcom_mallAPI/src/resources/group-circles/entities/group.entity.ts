import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { GroupStatus } from '../group-status.enum';
import { GroupType } from '../group-type.enum';
import { PayoutFrequency } from '../payout-frequency.enum';
import { GroupMember } from './group-member.entity';
import { GroupWallet } from './group-wallet.entity';
import { GroupCircleMessage } from './group-circle-message.entity';

@Entity('groups')
export class Group extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: GroupType, default: GroupType.MARKETING })
  type: GroupType;

  @Column({ nullable: true })
  duration: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  contributionAmount: number;

  @Column({
    type: 'enum',
    enum: PayoutFrequency,
    default: PayoutFrequency.MONTHLY,
  })
  payoutFrequency: PayoutFrequency;

  @Column({ type: 'int', default: 1 })
  currentRound: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  localArea: string;

  @Column({ type: 'int', default: 6 })
  size: number;

  @Column({ nullable: true })
  recruitmentDeadline: Date;

  @Column({ nullable: true })
  pitchUrl?: string;

  @Column({ type: 'enum', enum: GroupStatus, default: GroupStatus.RECRUITING })
  status: GroupStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'founderId' })
  founder: User;

  @Column()
  founderId: string;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToOne(() => GroupWallet, (wallet) => wallet.group)
  wallet: GroupWallet;

  @OneToMany(() => GroupCircleMessage, (message) => message.group)
  messages: GroupCircleMessage[];
}
