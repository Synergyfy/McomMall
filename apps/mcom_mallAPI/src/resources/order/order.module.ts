import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../cart/cart.module';
import { PromotionModule } from '../promotion/promotion.module';
import { Order } from './entities/order.entity';
import { OrderPayment } from './entities/order-payment.entity';
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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderPayment,
      Product,
      User,
      Offer,
      Business,
      ProductServiceBooking,
      Partnership,
    ]),
    EventEmitterModule.forRoot(),
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
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
