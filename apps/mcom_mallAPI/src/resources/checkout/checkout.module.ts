import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Product } from '../product/entities/product.entity';
import { UsersModule } from '../users/users.module';
import { OfferModule } from '../offer/offer.module';
import { ProductModule } from '../product/product.module';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Offer,
      Product,
      PromotionParticipant,
      Order,
      OrderItem,
    ]),
    UsersModule,
    OfferModule,
    ProductModule,
    GiftCardModule,
    PaymentsModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
