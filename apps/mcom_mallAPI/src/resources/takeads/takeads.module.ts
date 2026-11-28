import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipModule } from '../membership/membership.module';
import { PlanVariant } from '../plans/entities/plan-variant.entity';
import { TakeadsAction } from './entities/takeads-action.entity';
import { TakeadsClick } from './entities/takeads-click.entity';
import { TakeadsClickReport } from './entities/takeads-click-report.entity';
import { TakeadsCoupon } from './entities/takeads-coupon.entity';
import { TakeadsMerchant } from './entities/takeads-merchant.entity';
import { TakeadsOffer } from './entities/takeads-offer.entity';
import { TakeadsSyncRun } from './entities/takeads-sync-run.entity';
import { TakeadsAdminController } from './takeads-admin.controller';
import { TakeadsAdminService } from './takeads-admin.service';
import { TakeadsClient } from './takeads.client';
import { TakeadsPublicController } from './takeads-public.controller';
import { TakeadsPublicService } from './takeads-public.service';
import { TakeadsSyncService } from './takeads-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TakeadsMerchant,
      TakeadsCoupon,
      TakeadsOffer,
      TakeadsClick,
      TakeadsSyncRun,
      TakeadsClickReport,
      TakeadsAction,
      PlanVariant,
    ]),
    MembershipModule,
  ],
  controllers: [TakeadsAdminController, TakeadsPublicController],
  providers: [
    TakeadsClient,
    TakeadsSyncService,
    TakeadsAdminService,
    TakeadsPublicService,
  ],
  exports: [TakeadsClient, TakeadsSyncService, TakeadsAdminService, TakeadsPublicService],
})
export class TakeadsModule {}
