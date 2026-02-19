import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { MarketingCampaignType, MarketingCampaignStatus } from '../marketing-campaign.enum';
import { Coupon } from '../../coupon/entities/coupon.entity';

@Entity('marketing_campaigns')
export class MarketingCampaign extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: MarketingCampaignType,
  })
  type: MarketingCampaignType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: MarketingCampaignStatus,
    default: MarketingCampaignStatus.DRAFT,
  })
  status: MarketingCampaignStatus;

  @Column({ type: 'simple-array', nullable: true })
  targetPostalCodes: string[];

  @OneToMany(() => Coupon, (coupon) => coupon.campaign)
  coupons: Coupon[];
}
