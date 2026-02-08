import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { SystemCouponController } from './system-coupon.controller';
import { CouponProductBusinessController } from './coupon-product-business.controller';
import { CouponProduct } from './entities/coupon-product.entity';
import { CouponTransaction } from './entities/coupon-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { OrderPayment } from '../order/entities/order-payment.entity';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentsModule } from '../payments/payments.module';
import { CouponTransactionService } from './coupon-transaction.service';
import { CouponProductService } from './coupon-product.service';
import { Business } from '../listings/entities/listing.entity';
import { CapabilityModule } from '../capability/capability.module';

@Module({
  imports: [
    CapabilityModule,
    TypeOrmModule.forFeature([
      Coupon,
      CouponProduct,
      CouponTransaction,
      User,
      Order,
      OrderPayment,
      Business,
    ]),
    forwardRef(() => WalletModule),
    PaymentsModule,
  ],
  controllers: [
    CouponController,
    SystemCouponController,
    CouponProductBusinessController,
  ],
  providers: [
    CouponService,
    CouponTransactionService,
    CouponProductService,
  ],
  exports: [CouponService, CouponProductService],
})
export class CouponModule { }
