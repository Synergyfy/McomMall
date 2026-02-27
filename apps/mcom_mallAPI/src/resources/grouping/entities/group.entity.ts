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
import { IsIn } from 'class-validator';
import { GroupMember } from './group-member.entity';
import { GroupWallet } from './group-wallet.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('groups')
export class Group extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  localArea: string;

  @Column({ type: 'int' })
  @IsIn([6, 12])
  size: number;

  @Column()
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
}
