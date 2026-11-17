import { Column, Entity, ManyToOne } from 'typeorm';
import { moneyTransformer } from '../../../common/money/money';
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

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  value1Balance: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  value2Balance: number;

  @Column({ type: 'bigint', default: 0, transformer: moneyTransformer })
  value3Balance: number;
}
