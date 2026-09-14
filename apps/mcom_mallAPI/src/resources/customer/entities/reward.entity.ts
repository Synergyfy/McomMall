import { Column, Entity, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { RewardType } from '../reward.enum';

@Entity('rewards')
export class Reward extends AbstractBaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  brand: string;

  @Column({ length: 255 })
  category: string;

  @Column({ type: 'int' })
  cost: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  longDescription: string;

  @Column({ nullable: true })
  image: string;

  @Column({ length: 100, nullable: true })
  badgeIcon: string;

  @Column({
    type: 'enum',
    enum: RewardType,
    default: RewardType.COUPON,
  })
  rewardType: RewardType;

  @Column({ type: 'text', nullable: true })
  usageCondition: string;

  @Column({ nullable: true })
  code: string;

  @Column({ default: false })
  isHot: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ type: 'int', nullable: true })
  pointsRequired: number;

  @Column({ nullable: true })
  tier: string;

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[];

  @Column({ default: false })
  isOptedIn: boolean;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;
}
