import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controllers/payments.controller';
import { CashbackController } from './controllers/cashback.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentHistory } from './entities/payment-history.entity';
import { User } from '../users/entities/user.entity';
import { PaymentProviderService } from './services/payment-provider.service';
import { McomWalletService } from './services/mcom-wallet.service';
import { WalletTopUpProxyService } from './services/wallet-topup-proxy.service';
import { SolutionsPaymentProxyService } from './services/solutions-payment-proxy.service';
import { CentralIntegrationService } from './services/central-integration.service';
import { MembershipModule } from '../membership/membership.module';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentHistory, User]),
    forwardRef(() => MembershipModule),
    ActivityTimerModule,
    PlansModule,
  ],
  controllers: [PaymentsController, CashbackController],
  providers: [
    PaymentsService,
    PaymentProviderService,
    McomWalletService,
    CentralIntegrationService,
    WalletTopUpProxyService,
    SolutionsPaymentProxyService,
  ],
  exports: [
    PaymentsService,
    PaymentProviderService,
    McomWalletService,
    CentralIntegrationService,
    SolutionsPaymentProxyService,
  ],
})
export class PaymentsModule {}
