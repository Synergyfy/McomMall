import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { MembershipTier } from '../membership-tier.enum';
import { MembershipPayment } from './membership-payment.entity';
import { PlanVariant } from '../../plans/entities/plan-variant.entity';
import { PlanType } from '../dto/initiate-membership-payment.dto';
import { ApiProperty } from '@nestjs/swagger';

@Entity('memberships')
export class Membership extends AbstractBaseEntity {
  @ApiProperty({ enum: MembershipTier, nullable: true })
  @Column({ name: 'tier', type: 'enum', enum: MembershipTier, nullable: true })
  tierType: MembershipTier;

  @ApiProperty({ type: () => PlanVariant, nullable: true })
  @ManyToOne(() => PlanVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_variant_id' })
  planVariant: PlanVariant;

  @ApiProperty({
    nullable: true,
    description: 'Purchased plan variant id.',
  })
  @Column({ name: 'plan_variant_id', type: 'uuid', nullable: true })
  planVariantId: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Price snapshot locked in at purchase (plan_prices id).',
  })
  @Column({ name: 'price_id', type: 'uuid', nullable: true })
  priceId: string | null;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isTrial: boolean;

  @ApiProperty({ example: 14, nullable: true })
  @Column({ nullable: true, default: 0 })
  trialDuration: number;

  @ApiProperty({ enum: PlanType, example: PlanType.MONTHLY })
  @Column({ type: 'enum', enum: PlanType, default: PlanType.MONTHLY })
  planType: PlanType;

  @ApiProperty({ example: '2026-02-18T10:00:00Z' })
  @Column({ nullable: true })
  startDate: Date;

  @ApiProperty({ example: '2026-03-11T10:00:00Z' })
  @Column()
  expiresAt: Date;

  @ApiProperty({ example: '2026-03-11T10:00:00Z' })
  @Column({ nullable: true })
  endDate: Date;

  @ApiProperty({
    example: {
      days: 28,
      hours: 10,
      minutes: 5,
      seconds: 30,
      totalSeconds: 2455530,
    },
  })
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
