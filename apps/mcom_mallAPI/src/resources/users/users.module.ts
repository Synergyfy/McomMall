import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashService } from '../../common/hash/hash.service';
import { Social } from './entities/social.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Offer } from '../offer/entities/offer.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { EmailModule } from '../email/email.module';
import { ServiceProviderProfile } from '../service-provider-profile/entities/service-provider-profile.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { ProvisionModule } from '../provision/provision.module';
import { MembershipModule } from '../membership/membership.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ServiceProviderProfile,
      Social,
      Transaction,
      Offer,
      PointTransaction,
      Wallet,
    ]),
    EmailModule,
    ProvisionModule,
    forwardRef(() => MembershipModule),
    PlansModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, HashService],
  exports: [UsersService],
})
export class UsersModule {}
