import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { moneyTransformer } from '../../../common/money/money';
import { PromotionalCampaignItem } from './promotional-campaign-item.entity';
import { PromotionalCampaignBusiness } from './promotional-campaign-business.entity';

export type PromotionalCampaignStatus = 'draft' | 'active' | 'inactive';
export type PromotionalRewardType =
  | 'voucher'
  | 'discount'
  | 'cashback'
  | 'gift'
  | 'other';

/** An MCOM-managed campaign that selected businesses can participate in. */
@Entity('promotional_campaigns')
export class PromotionalCampaign extends AbstractBaseEntity {
  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions?: string;

  @Index('IDX_promotional_campaigns_status')
  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: PromotionalCampaignStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'other' })
  rewardType: PromotionalRewardType;

  @Column({ nullable: true })
  rewardTitle?: string;

  @Column({ type: 'text', nullable: true })
  rewardDescription?: string;

  @Column({ type: 'bigint', nullable: true, transformer: moneyTransformer })
  rewardValue?: number | null;

  /** When true every business can see and respond to the campaign. */
  @Column({ default: false })
  availableToAll: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  /** [{ type: 'image' | 'link', url, label }] */
  @Column({ type: 'jsonb', nullable: true })
  promotionalMaterials?: Array<{
    type: 'image' | 'link';
    url: string;
    label?: string;
  }> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string | null;

  @OneToMany(
    () => PromotionalCampaignItem,
    (item) => item.campaign,
  )
  items?: PromotionalCampaignItem[];

  @OneToMany(
    () => PromotionalCampaignBusiness,
    (participant) => participant.campaign,
  )
  participants?: PromotionalCampaignBusiness[];
}
