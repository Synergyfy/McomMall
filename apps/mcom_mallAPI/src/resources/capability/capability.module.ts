import { Module, forwardRef } from '@nestjs/common';
import { CapabilityService } from './capability.service';
import { CapabilityController } from './capability.controller';
import { MembershipModule } from '../membership/membership.module';
import { ListingsModule } from '../listings/listings.module';
import { ProductModule } from '../product/product.module';
import { ServicesModule } from '../services/services.module';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { CouponModule } from '../coupon/coupon.module';
import { PromotionModule } from '../promotion/promotion.module';
import { TierModule } from '../tier/tier.module';

@Module({
  imports: [
    forwardRef(() => MembershipModule),
    forwardRef(() => ListingsModule),
    forwardRef(() => ProductModule),
    forwardRef(() => ServicesModule),
    forwardRef(() => ActivityTimerModule),
    forwardRef(() => GiftCardModule),
    forwardRef(() => CouponModule),
    forwardRef(() => PromotionModule),
    forwardRef(() => TierModule),
  ],
  controllers: [CapabilityController],
  providers: [CapabilityService],
  exports: [CapabilityService],
})
export class CapabilityModule {}
