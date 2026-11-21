import { Module, forwardRef } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipPaymentListener } from './membership-payment.listener';
import { MembershipController } from './membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsModule } from '../payments/payments.module';
import { MembershipPayment } from './entities/membership-payment.entity';
import { SsoModule } from '../sso/sso.module';
import { MembershipCredit } from './entities/membership-credit.entity';
import { MembershipRenewal } from './entities/membership-renewal.entity';
import { MembershipRenewalService } from './services/membership-renewal.service';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Membership,
      User,
      MembershipPayment,
      MembershipCredit,
      MembershipRenewal,
    ]),
    forwardRef(() => PaymentsModule),
    forwardRef(() => SsoModule),
    PlansModule,
  ],
  controllers: [MembershipController],
  providers: [
    MembershipService,
    MembershipRenewalService,
    MembershipPaymentListener,
  ],
  exports: [MembershipService, MembershipRenewalService],
})
export class MembershipModule {}
