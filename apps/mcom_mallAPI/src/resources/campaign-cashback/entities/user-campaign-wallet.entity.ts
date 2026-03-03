import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { SpendingChannel } from '../campaign-cashback.enum';
import { UserCampaignCashback } from './user-campaign-cashback.entity';

@Entity('user_campaign_wallets')
export class UserCampaignWallet extends AbstractBaseEntity {
  @ManyToOne(() => UserCampaignCashback, (uc) => uc.wallets, {
    onDelete: 'CASCADE',
  })
  userCampaign: UserCampaignCashback;

  @Column({
    type: 'enum',
    enum: SpendingChannel,
  })
  channelType: SpendingChannel;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value1Balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value2Balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value3Balance: number;
}
