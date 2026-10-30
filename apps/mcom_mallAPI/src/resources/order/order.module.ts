import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { PromotionModule } from '../promotion/promotion.module';
import { Order } from './entities/order.entity';
import { OrderPayment } from './entities/order-payment.entity';
import { FailedWalletRefund } from './entities/failed-wallet-refund.entity';
import { OrderItemReward } from './entities/order-item-reward.entity';
import { RewardRedemptionOutbox } from './entities/reward-redemption-outbox.entity';
import { BookingReward } from '../booking/entities/booking-reward.entity';
import { WalletRefundReconcileService } from './wallet-refund-reconcile.service';
import { RewardRedemptionReconcileService } from './reward-redemption-reconcile.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Product } from '../product/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { OrderItem } from './entities/order-item.entity';
import { CouponModule } from '../coupon/coupon.module';
import { TransactionModule } from '../transaction/transaction.module';
import { Offer } from '../offer/entities/offer.entity';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { Business } from '../listings/entities/listing.entity';
import { VoucherModule } from '../voucher/voucher.module';
import { ProductServiceBooking } from './entities/product-service-booking.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { BookingModule } from '../booking/booking.module';
import { PartnershipModule } from '../partnership/partnership.module';
import { WalletModule } from '../wallet/wallet.module';
import { ProductModule } from '../product/product.module';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';
import { ShippingModule } from '../shipping/shipping.module';
import { PaymentsModule } from '../payments/payments.module';
import { RewardsIntegrationModule } from '../rewards-integration/rewards-integration.module';
import { PartnerInstrumentsModule } from '../partner-instruments/partner-instruments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderPayment,
      FailedWalletRefund,
      OrderItemReward,
      RewardRedemptionOutbox,
      BookingReward,
      Product,
      User,
      Offer,
      Business,
      ProductServiceBooking,
      Partnership,
      ShippingAddress,
    ]),
    CartModule,
    forwardRef(() => PromotionModule),
    NotificationModule,
    forwardRef(() => CouponModule),
    TransactionModule,
    forwardRef(() => GiftCardModule),
    forwardRef(() => VoucherModule),
    forwardRef(() => BookingModule),
    forwardRef(() => PartnershipModule),
    forwardRef(() => WalletModule),
    forwardRef(() => ProductModule),
    ShippingModule,
    forwardRef(() => PaymentsModule),
    forwardRef(() => RewardsIntegrationModule),
    PartnerInstrumentsModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    WalletRefundReconcileService,
    RewardRedemptionReconcileService,
  ],
  exports: [
    OrderService,
    WalletRefundReconcileService,
    RewardRedemptionReconcileService,
  ],
})
export class OrderModule {}
