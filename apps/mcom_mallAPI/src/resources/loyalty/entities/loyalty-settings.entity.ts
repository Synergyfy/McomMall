import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';

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

  @Column()
  businessId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Index()
  business: Business;
}
