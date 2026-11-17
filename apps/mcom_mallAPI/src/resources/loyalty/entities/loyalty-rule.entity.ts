import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

export enum LoyaltyRuleType {
  PERCENTAGE_OF_SPEND = 'percentage_of_spend',
  FIXED_PER_BOOKING = 'fixed_per_booking',
  BONUS_MULTIPLIER = 'bonus_multiplier',
  WELCOME_BONUS = 'welcome_bonus',
}

export enum LoyaltyRuleTrigger {
  VISIT = 'visit',
  PURCHASE = 'purchase',
  BOOKING = 'booking',
  REVIEW = 'review',
  REFERRAL = 'referral',
  SHARE = 'share',
  SIGNUP = 'signup',
  ALL = 'all',
}

@Entity('loyalty_rules')
export class LoyaltyRule extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: LoyaltyRuleType })
  ruleType: LoyaltyRuleType;

  @Column({ type: 'int', nullable: true })
  pointsPerCurrency?: number;

  @Column({ type: 'int', nullable: true })
  fixedPoints?: number;

  @Column({ type: 'int', nullable: true })
  multiplier?: number;

  @Column({ type: 'text', nullable: true })
  appliesTo?: string; // 'purchase' | 'booking' | 'all'

  @Column({
    type: 'enum',
    enum: LoyaltyRuleTrigger,
    default: LoyaltyRuleTrigger.ALL,
  })
  trigger: LoyaltyRuleTrigger;

  @Column({ type: 'varchar', length: 64, nullable: true })
  targetSegment?: string;

  @Column({ type: 'int', nullable: true })
  frequencyLimit?: number;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  minSpend?: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Index()
  business: Business;
}
