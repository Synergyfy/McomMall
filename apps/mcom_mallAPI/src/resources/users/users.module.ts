import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashService } from '../../common/hash/hash.service';
import { Trial } from '../payments/entities/trial.entity';
import { Social } from './entities/social.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { PromotionActivity } from '../promotion/entities/promotion-activity.entity';
import { Offer } from '../offer/entities/offer.entity';
import { EmailModule } from '../email/email.module';
import { TrialModule } from '../trial/trial.module';
import { ServiceProviderProfile } from '../service-provider-profile/entities/service-provider-profile.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { ProvisionModule } from '../provision/provision.module';
import { MembershipModule } from '../membership/membership.module';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';
import { TierModule } from '../tier/tier.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ServiceProviderProfile,
      Trial,
      Social,
      Transaction,
      PromotionParticipant,
      PromotionActivity,
      Offer,
      Wallet,
    ]),
    EmailModule,
    TrialModule,
    ProvisionModule,
    ProvisionModule,
    MembershipModule,
    MembershipModule,
    ActivityTimerModule,
    TierModule
  ],
  controllers: [UsersController],
  providers: [UsersService, HashService],
  exports: [UsersService],
})
export class UsersModule { }