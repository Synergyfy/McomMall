import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { moneyTransformer } from '../../../common/money/money';
import { PromotionalCampaign } from './promotional-campaign.entity';

export type PromotionalCampaignItemType =
  | 'product'
  | 'service'
  | 'promotional_offer'
  | 'link';

@Entity('promotional_campaign_items')
export class PromotionalCampaignItem extends AbstractBaseEntity {
  @Index('IDX_promotional_campaign_items_campaign')
  @Column({ type: 'uuid' })
  campaignId: string;

  @Column({ type: 'varchar', length: 24 })
  itemType: PromotionalCampaignItemType;

  @Column({ type: 'uuid', nullable: true })
  productId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  serviceId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  offerId?: string | null;

  /** Original owner business for merchant products/services. */
  @Column({ type: 'uuid', nullable: true })
  ownerBusinessId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  advertiserBusinessId?: string | null;

  @Column({ length: 240 })
  title: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  price?: number | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  destinationUrl?: string | null;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @ManyToOne(() => PromotionalCampaign, (campaign) => campaign.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: PromotionalCampaign;
}
