import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { HotspotCampaign } from './hotspot-campaign.entity';

@Entity('hotspots')
export class Hotspot extends AbstractBaseEntity {
  @Column({ type: 'float' })
  x: number;

  @Column({ type: 'float' })
  y: number;

  @Column()
  link: string;

  @Column()
  campaignId: string;

  @ManyToOne(() => HotspotCampaign, (campaign) => campaign.hotspots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  @Index()
  campaign: HotspotCampaign;
}
