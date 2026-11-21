import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponService } from './coupon.service';
import { CouponPaymentListener } from './coupon-payment.listener';
import { CouponController } from './coupon.controller';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Business } from '../listings/entities/listing.entity';
import { CapabilityModule } from '../capability/capability.module';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { BrandingAssociation } from './entities/branding-association.entity';
import { RedemptionLog } from './entities/redemption-log.entity';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';
import { SavedCoupon } from './entities/saved-coupon.entity';
import { OrderPayment } from '../order/entities/order-payment.entity';
import { PaymentsModule } from '../payments/payments.module';
import { BusinessCouponController } from './business-coupon.controller';
import { PartnerInstrumentsModule } from '../partner-instruments/partner-instruments.module';
import { CouponProduct } from './entities/coupon-product.entity';
import { CouponProductService } from './coupon-product.service';
import { CouponProductBusinessController } from './coupon-product-business.controller';
import { CouponProductPublicController } from './coupon-product-public.controller';

@Module({
  imports: [
    forwardRef(() => CapabilityModule),
    PartnerInstrumentsModule,
    forwardRef(() => PaymentsModule),
    TypeOrmModule.forFeature([
      Coupon,
      CouponProduct,
      SavedCoupon,
      User,
      Order,
      OrderPayment,
      Business,
      MarketingCampaign,
      BrandingAssociation,
      RedemptionLog,
      ShippingAddress,
    ]),
  ],
  controllers: [
    CouponController,
    BusinessCouponController,
    CouponProductBusinessController,
    CouponProductPublicController,
  ],
  providers: [CouponService, CouponProductService, CouponPaymentListener],
  exports: [CouponService, CouponProductService],
})
export class CouponModule {}
