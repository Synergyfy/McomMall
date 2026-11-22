import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';
import { Plan } from '../plans/entities/plan.entity';
import { PlanVariant } from '../plans/entities/plan-variant.entity';
import { PlansModule } from '../plans/plans.module';
import { ProfileSyncModule } from '../profile-sync/profile-sync.module';
import { MembershipSyncController } from './membership-sync.controller';
import { MembershipSyncService } from './membership-sync.service';
import { MembershipSyncEvent } from './entities/membership-sync-event.entity';

/**
 * Central membership -> Mall plan grant propagation.
 *
 * Central remains the billing source of truth; this module only stores the
 * delivery inbox and maps the bundled package onto a local plan variant so the
 * user gets (or loses) access in the mall. No charge is created here.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MembershipSyncEvent,
      User,
      Membership,
      Plan,
      PlanVariant,
    ]),
    ProfileSyncModule,
    PlansModule,
  ],
  controllers: [MembershipSyncController],
  providers: [MembershipSyncService],
  exports: [MembershipSyncService],
})
export class MembershipSyncModule {}
