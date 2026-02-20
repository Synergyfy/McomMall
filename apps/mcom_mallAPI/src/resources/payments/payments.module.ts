import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './controllers/payments.controller';
import { CashbackController } from './controllers/cashback.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentHistory } from './entities/payment-history.entity';
import { User } from '../users/entities/user.entity';
import { Tier } from '../tier/entities/tier.entity';
import { PaymentProviderService } from './services/payment-provider.service';
import { CentralIntegrationService } from './services/central-integration.service';
import { MembershipModule } from '../membership/membership.module';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentHistory, User, Tier]),
    forwardRef(() => MembershipModule),
    ActivityTimerModule,
  ],
  controllers: [PaymentsController, CashbackController],
  providers: [PaymentsService, PaymentProviderService, CentralIntegrationService],
  exports: [PaymentsService, PaymentProviderService, CentralIntegrationService],
})
export class PaymentsModule {}
