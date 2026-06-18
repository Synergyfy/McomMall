import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

@Entity('gamifications')
export class Gamification extends AbstractBaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ length: 50 })
  gameType: string; // 'spin-wheel' | 'reward-drop' | 'prize-unlock' | 'point-challenge' | 'scratch-card' | 'qr-hunt' | 'borough-challenge'

  @Column({ length: 50 })
  rewardType: string; // 'discounts' | 'products' | 'points' | 'vouchers' | 'services' | 'events'

  @Column({ length: 255 })
  rewardValue: string; // e.g. "20% off", "Free Latte", "500 points"

  @Column({ type: 'int', default: 100 })
  rewardQty: number;

  @Column({ type: 'boolean', default: true })
  isLimitedTime: boolean;

  @Column({ type: 'boolean', default: true })
  dailyLimitEnabled: boolean;

  @Column({ type: 'int', default: 3 })
  dailyLimitValue: number;

  @Column({ type: 'boolean', default: false })
  loyaltyOnly: boolean;

  @Column({ type: 'boolean', default: true })
  minSpendEnabled: boolean;

  @Column({ length: 10, default: 'USD' })
  minSpendCurrency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 15.00 })
  minSpendValue: number;

  @Column({ type: 'boolean', default: true })
  qrUnlockEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  boroughRulesEnabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  boroughs: string[];

  @Column({ length: 50, default: 'active' })
  status: string; // 'active' | 'scheduled' | 'draft' | 'past'

  // Metric counters
  @Column({ type: 'int', default: 0 })
  totalParticipants: number;

  @Column({ type: 'int', default: 0 })
  gamesPlayed: number;

  @Column({ type: 'int', default: 0 })
  rewardsIssued: number;

  @Column({ type: 'int', default: 0 })
  rewardsClaimed: number;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, (business) => business.gamifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;
}
