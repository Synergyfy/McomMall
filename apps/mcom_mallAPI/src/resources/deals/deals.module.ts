import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { Coupon } from '../coupon/entities/coupon.entity';
import { SavedCoupon } from '../coupon/entities/saved-coupon.entity';
import { UserVoucher } from '../money-engine/entities/user-voucher.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { GiftCardTemplate } from '../gift-card/entities/gift-card-template.entity';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { RewardDefinition } from '../money-engine/entities/reward-definition.entity';
import { InstrumentsModule } from '../instruments/instruments.module';

/**
 * Read-only aggregation module. It registers the entities it reads directly
 * rather than importing the feature modules, so it cannot introduce a cycle.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coupon,
      SavedCoupon,
      UserVoucher,
      Voucher,
      GiftCard,
      GiftCardTemplate,
      MarketingCampaign,
      RewardDefinition,
    ]),
    InstrumentsModule,
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
