import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum MembershipCreditType {
  PROMOTION = 'promotion',
  CAMPAIGN = 'campaign',
  ONBOARDING = 'onboarding',
  REFERRAL = 'referral',
  SERVICE = 'service',
}

export enum MembershipCreditStatus {
  AVAILABLE = 'available',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
}

@Entity('membership_credits')
export class MembershipCredit extends AbstractBaseEntity {
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  businessId?: string;

  @Column({
    type: 'enum',
    enum: MembershipCreditType,
  })
  type: MembershipCreditType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: MembershipCreditStatus,
    default: MembershipCreditStatus.AVAILABLE,
  })
  status: MembershipCreditStatus;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  redeemedAt: Date;

  @Column({ type: 'text', nullable: true })
  note: string;
}
