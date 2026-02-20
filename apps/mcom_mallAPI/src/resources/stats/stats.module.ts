import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { Business } from '../listings/entities/listing.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { UsersModule } from '../users/users.module';
import { OrderModule } from '../order/order.module';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CouponModule } from '../coupon/coupon.module';
import { VoucherModule } from '../voucher/voucher.module';
import { ProductModule } from '../product/product.module';
import { ServicesModule } from '../services/services.module';
import { ListingsModule } from '../listings/listings.module';
import { BookingModule } from '../booking/booking.module';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      OrderItem,
      GiftCard,
      PointTransaction,
      Transaction,
      Voucher,
      Product,
      Service,
      Business,
      ServiceBooking,
      PromotionParticipant,
    ]),
    UsersModule,
    OrderModule,
    GiftCardModule,
    TransactionModule,
    CouponModule,
    VoucherModule,
    ProductModule,
    ServicesModule,
    ListingsModule,
    BookingModule,
    PromotionModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule { }