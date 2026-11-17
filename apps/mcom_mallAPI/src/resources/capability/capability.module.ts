import { Module, forwardRef } from '@nestjs/common';
import { CapabilityService } from './capability.service';
import { CapabilityController } from './capability.controller';
import { MembershipModule } from '../membership/membership.module';
import { ProductModule } from '../product/product.module';
import { ServicesModule } from '../services/services.module';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { CouponModule } from '../coupon/coupon.module';
import { OfferModule } from '../offer/offer.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    forwardRef(() => MembershipModule),
    forwardRef(() => ProductModule),
    forwardRef(() => ServicesModule),
    forwardRef(() => GiftCardModule),
    forwardRef(() => CouponModule),
    forwardRef(() => OfferModule),
    forwardRef(() => PlansModule),
  ],
  controllers: [CapabilityController],
  providers: [CapabilityService],
  exports: [CapabilityService],
})
export class CapabilityModule {}
