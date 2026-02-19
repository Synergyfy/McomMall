import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Business } from '../listings/entities/listing.entity';
import { CapabilityModule } from '../capability/capability.module';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { BrandingAssociation } from './entities/branding-association.entity';
import { RedemptionLog } from './entities/redemption-log.entity';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';

@Module({
  imports: [
    forwardRef(() => CapabilityModule),
    TypeOrmModule.forFeature([
      Coupon,
      User,
      Order,
      Business,
      MarketingCampaign,
      BrandingAssociation,
      RedemptionLog,
      ShippingAddress,
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
