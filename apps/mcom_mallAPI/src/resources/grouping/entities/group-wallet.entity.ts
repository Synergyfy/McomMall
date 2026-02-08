import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Group } from './group.entity';

@Entity('group_wallets')
export class GroupWallet extends AbstractBaseEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @OneToOne(() => Group)
  @JoinColumn()
  group: Group;
}