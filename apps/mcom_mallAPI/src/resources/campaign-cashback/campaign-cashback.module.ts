import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignCashbackController } from './campaign-cashback.controller';
import { CampaignCashbackService } from './campaign-cashback.service';
import { CampaignCashback } from './entities/campaign-cashback.entity';
import { UserCampaignCashback } from './entities/user-campaign-cashback.entity';
import { UserCampaignWallet } from './entities/user-campaign-wallet.entity';
import { Season } from '../seasons/entities/season.entity';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentsModule } from '../payments/payments.module';
import { OrderPayment } from '../order/entities/order-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CampaignCashback,
      UserCampaignCashback,
      UserCampaignWallet,
      Season,
      OrderPayment,
    ]),
    forwardRef(() => WalletModule),
    PaymentsModule,
  ],
  controllers: [CampaignCashbackController],
  providers: [CampaignCashbackService],
  exports: [CampaignCashbackService],
})
export class CampaignCashbackModule {}
