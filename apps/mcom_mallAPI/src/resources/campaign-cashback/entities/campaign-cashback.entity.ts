import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import {
  CampaignTargetType,
  CampaignDisplayType,
  CampaignUnlockMode,
  SpendingChannel,
  CampaignCategory,
  CampaignUsageType,
} from '../campaign-cashback.enum';
import { Season } from '../../seasons/entities/season.entity';

@Entity('campaign_cashbacks')
export class CampaignCashback extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CampaignCategory,
    default: CampaignCategory.REGULAR,
  })
  type: CampaignCategory;

  @ManyToOne(() => Season, { nullable: true })
  season: Season;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: CampaignTargetType,
    default: CampaignTargetType.CUSTOMER,
  })
  targetType: CampaignTargetType;

  @Column({
    type: 'enum',
    enum: CampaignDisplayType,
    default: CampaignDisplayType.VOUCHER,
  })
  displayType: CampaignDisplayType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  levelValue: number;

  @Column({
    type: 'enum',
    enum: CampaignUnlockMode,
    default: CampaignUnlockMode.REQUIRE_FULL_UNLOCK,
  })
  unlockMode: CampaignUnlockMode;

  @Column({ type: 'timestamp' })
  expiryDate: Date;

  @Column({ default: 0 })
  activationTimerDays: number;

  @Column('simple-array', { nullable: true })
  activationTasks: string[];

  @Column({ default: false })
  externalCampaign: boolean;

  @Column({ nullable: true })
  externalRedemptionUrl: string;

  // Value 1 Config
  @Column()
  value1Title: string;
  @Column('text')
  value1Description: string;
  @Column()
  value1UsageText: string;
  @Column('simple-array', { nullable: true })
  value1Channels: SpendingChannel[];
  @Column('simple-array', { nullable: true })
  value1UsageTypes: CampaignUsageType[];

  // Value 2 Config
  @Column()
  value2Title: string;
  @Column('text')
  value2Description: string;
  @Column()
  value2UsageText: string;
  @Column('simple-array', { nullable: true })
  value2Channels: SpendingChannel[];
  @Column('simple-array', { nullable: true })
  value2UsageTypes: CampaignUsageType[];

  // Value 3 Config
  @Column()
  value3Title: string;
  @Column('text')
  value3Description: string;
  @Column()
  value3UsageText: string;
  @Column('simple-array', { nullable: true })
  value3Channels: SpendingChannel[];
  @Column('simple-array', { nullable: true })
  value3UsageTypes: CampaignUsageType[];

  @Column({ default: true })
  selectAll: boolean;

  @Column('simple-array', { nullable: true })
  targetIds: string[];
}
