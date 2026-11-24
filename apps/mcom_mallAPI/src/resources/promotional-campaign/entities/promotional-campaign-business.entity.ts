import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { Business } from '../../listings/entities/listing.entity';
import { PromotionalCampaign } from './promotional-campaign.entity';

export type CampaignParticipationStatus =
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

@Entity('promotional_campaign_businesses')
@Index('UQ_promotional_campaign_business', ['campaignId', 'businessId'], {
  unique: true,
})
export class PromotionalCampaignBusiness extends AbstractBaseEntity {
  @Index('IDX_promotional_campaign_businesses_campaign')
  @Column({ type: 'uuid' })
  campaignId: string;

  @Index('IDX_promotional_campaign_businesses_business')
  @Column({ type: 'uuid' })
  businessId: string;

  @Column({ type: 'varchar', length: 20, default: 'invited' })
  status: CampaignParticipationStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  invitedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  respondedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @ManyToOne(() => PromotionalCampaign, (campaign) => campaign.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: PromotionalCampaign;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;
}
