import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsModule } from '../payments/payments.module';
import { MembershipPayment } from './entities/membership-payment.entity';

import { Tier } from '../tier/entities/tier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership, User, MembershipPayment, Tier]),
    PaymentsModule,
  ],
  controllers: [MembershipController],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
