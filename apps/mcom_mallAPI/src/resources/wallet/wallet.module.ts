import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { OrderModule } from '../order/order.module';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { PaymentsModule } from '../payments/payments.module';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { VoucherModule } from '../voucher/voucher.module';
import { BookingModule } from '../booking/booking.module';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, User, Order, WalletTransaction]),
    forwardRef(() => OrderModule),
    forwardRef(() => GiftCardModule),
    forwardRef(() => VoucherModule),
    forwardRef(() => CouponModule),
    forwardRef(() => BookingModule),
    PaymentsModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
