import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { DigitalValueMaster } from './digital-value-master.entity';

@Entity('reward_linkage')
export class RewardLinkage extends AbstractBaseEntity {
  @Column({ name: 'reward_id', type: 'uuid' })
  rewardId: string;

  @ManyToOne(() => DigitalValueMaster, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'digital_value_id' })
  digitalValue: DigitalValueMaster;

  @Column({ name: 'digital_value_id' })
  digitalValueId: string;
}
