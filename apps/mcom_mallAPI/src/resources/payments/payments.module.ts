import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsWebhookController } from './controllers/payments-webhook.controller';
import { CashbackController } from './controllers/cashback.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentHistory } from './entities/payment-history.entity';
import { McomPayCharge } from './entities/mcom-pay-charge.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';
import { McomPayWebhookEvent } from './entities/mcom-pay-webhook-event.entity';
import { MembershipPayment } from '../membership/entities/membership-payment.entity';
import { User } from '../users/entities/user.entity';
import { OrderPayment } from '../order/entities/order-payment.entity';
import { Order } from '../order/entities/order.entity';
import { PaymentProviderService } from './services/payment-provider.service';
import { McomWalletService } from './services/mcom-wallet.service';
import { McomPayService } from './services/mcom-pay.service';
import { WalletTopUpProxyService } from './services/wallet-topup-proxy.service';
import { CentralIntegrationService } from './services/central-integration.service';
import { MembershipModule } from '../membership/membership.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentHistory,
      McomPayCharge,
      PaymentAllocation,
      McomPayWebhookEvent,
      MembershipPayment,
      User,
      OrderPayment,
      Order,
    ]),
    forwardRef(() => MembershipModule),
    PlansModule,
  ],
  controllers: [
    PaymentsController,
    PaymentsWebhookController,
    CashbackController,
  ],
  providers: [
    PaymentsService,
    PaymentProviderService,
    McomWalletService,
    McomPayService,
    CentralIntegrationService,
    WalletTopUpProxyService,
  ],
  exports: [
    PaymentsService,
    PaymentProviderService,
    McomWalletService,
    McomPayService,
    CentralIntegrationService,
  ],
})
export class PaymentsModule {}
