import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Group } from './group.entity';
import { GroupWallet } from './group-wallet.entity';

@Entity('group_transactions')
export class GroupTransaction extends AbstractBaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  groupId: string;

  @ManyToOne(() => GroupWallet)
  @JoinColumn({ name: 'groupWalletId' })
  groupWallet: GroupWallet;

  @Column()
  groupWalletId: string;
}