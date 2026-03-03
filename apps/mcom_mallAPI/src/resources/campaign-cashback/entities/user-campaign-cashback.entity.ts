import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/base.entity';
import { CampaignStatus } from '../campaign-cashback.enum';
import { CampaignCashback } from './campaign-cashback.entity';
import { User } from '../../users/entities/user.entity';
import { UserCampaignWallet } from './user-campaign-wallet.entity';

@Entity('user_campaign_cashbacks')
export class UserCampaignCashback extends AbstractBaseEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => CampaignCashback)
  campaign: CampaignCashback;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.ACTIVE,
  })
  status: CampaignStatus;

  @Column({ default: false })
  contributionPaid: boolean;

  @OneToMany(() => UserCampaignWallet, (wallet) => wallet.userCampaign, {
    cascade: true,
  })
  wallets: UserCampaignWallet[];

  @Column({ type: 'timestamp', nullable: true })
  activationTimerDate: Date;
}
