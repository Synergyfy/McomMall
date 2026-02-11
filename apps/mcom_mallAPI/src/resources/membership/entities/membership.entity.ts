import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { MembershipTier } from '../membership-tier.enum';
import { MembershipPayment } from './membership-payment.entity';
import { Tier } from '../../tier/entities/tier.entity';
import { PlanType } from '../dto/initiate-membership-payment.dto';

@Entity('memberships')
export class Membership extends AbstractBaseEntity {
  @Column({ name: 'tier', type: 'enum', enum: MembershipTier, nullable: true })
  tierType: MembershipTier;

  @ManyToOne(() => Tier, { nullable: true })
  @JoinColumn({ name: 'tier_id' })
  tier: Tier;

  @Column({ name: 'tier_id', nullable: true })
  tierId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isTrial: boolean;

  @Column({ type: 'enum', enum: PlanType, default: PlanType.MONTHLY })
  planType: PlanType;

  @Column()
  expiresAt: Date;

  expiresIn?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };

  @OneToOne(() => User, (user) => user.membership)
  @JoinColumn()
  user: User;

  @OneToOne(() => MembershipPayment, (payment) => payment.membership)
  @JoinColumn()
  payment: MembershipPayment;
}