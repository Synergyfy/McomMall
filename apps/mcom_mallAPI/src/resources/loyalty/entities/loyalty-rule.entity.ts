import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

export enum LoyaltyRuleType {
  PERCENTAGE_OF_SPEND = 'percentage_of_spend',
  FIXED_PER_BOOKING = 'fixed_per_booking',
  BONUS_MULTIPLIER = 'bonus_multiplier',
  WELCOME_BONUS = 'welcome_bonus',
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

  @Column({ default: true })
  isActive: boolean;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Index()
  business: Business;
}
