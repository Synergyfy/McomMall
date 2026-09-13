import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Reward } from './reward.entity';
import { RewardRedemptionStatus } from '../reward.enum';

@Entity('reward_redemptions')
@Unique(['userId', 'rewardId'])
export class RewardRedemption extends AbstractBaseEntity {
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Reward, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rewardId' })
  reward: Reward;

  @Column()
  rewardId: string;

  @Column({ type: 'int' })
  pointsSpent: number;

  @Column({
    type: 'enum',
    enum: RewardRedemptionStatus,
    default: RewardRedemptionStatus.CLAIMED,
  })
  status: RewardRedemptionStatus;

  @Column({ nullable: true })
  redeemedAt: Date;

  @Column({ nullable: true })
  issuedCode: string;
}
