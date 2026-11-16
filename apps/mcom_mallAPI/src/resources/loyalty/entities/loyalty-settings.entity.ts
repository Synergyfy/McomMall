import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  color?: string;
}

@Entity('loyalty_settings')
export class LoyaltySettings extends AbstractBaseEntity {
  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'int', nullable: true })
  pointsPerCurrency?: number;

  @Column({ type: 'int', nullable: true })
  pointsMultiplier?: number;

  @Column({ type: 'int', nullable: true })
  signupBonusPoints?: number;

  @Column({ default: 'auto' })
  redemptionApproval: string; // 'auto' | 'manual'

  @Column({ type: 'text', nullable: true })
  terms?: string;

  /**
   * Optional loyalty programme presentation. Kept in the settings row so the
   * program name/branding can be changed without a schema deploy.
   */
  @Column({ type: 'varchar', length: 120, nullable: true })
  programName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  brandColor?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  accentColor?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  heroImageUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  tierConfig?: LoyaltyTier[] | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  redemptionMode?: string; // 'points' | 'discount' | 'both'

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  redemptionValue?: number;

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Index()
  business: Business;
}
