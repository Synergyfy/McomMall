import { Column, Entity, Index, OneToMany, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { MarketingCampaignType, MarketingCampaignStatus } from '../marketing-campaign.enum';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Season } from '../../seasons/entities/season.entity';

@Entity('marketing_campaigns')
export class MarketingCampaign extends AbstractBaseEntity {
  @ApiProperty({ example: 'Winter Promo 2026' })
  @Column()
  name: string;

  @ApiProperty({ enum: MarketingCampaignType, example: MarketingCampaignType.SEASONAL })
  @Column({
    type: 'enum',
    enum: MarketingCampaignType,
  })
  type: MarketingCampaignType;

  @ApiProperty({ description: 'Start date (inherited from Season if linked)' })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({ description: 'End date (inherited from Season if linked)' })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiPropertyOptional({ type: () => Season })
  @ManyToOne(() => Season, { nullable: true })
  season: Season;

  @ApiProperty({ enum: MarketingCampaignStatus, example: MarketingCampaignStatus.ACTIVE })
  @Index()
  @Column({
    type: 'enum',
    enum: MarketingCampaignStatus,
    default: MarketingCampaignStatus.DRAFT,
  })
  status: MarketingCampaignStatus;

  @ApiPropertyOptional({ type: [String], example: ['SW1A'] })
  @Column({ type: 'simple-array', nullable: true })
  targetPostalCodes: string[];

  @OneToMany(() => Coupon, (coupon) => coupon.campaign)
  coupons: Coupon[];
}
