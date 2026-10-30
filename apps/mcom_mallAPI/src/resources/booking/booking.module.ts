import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationModule } from '../notification/notification.module';
import { EmailModule } from '../email/email.module';
import { Business } from '../listings/entities/listing.entity';
import { PaymentsModule } from '../payments/payments.module';
import { Service } from '../services/entities/service.entity';
import { WalletModule } from '../wallet/wallet.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BlockedSlot } from './entities/blocked-slot.entity';
import { PriceModifier } from './entities/price-modifier.entity';
import { RentalBooking } from './entities/rental-booking.entity';
import { ServiceBooking } from './entities/service-booking.entity';
import { ServicePayment } from './entities/service-payment.entity';
import { BookingTransaction } from './entities/booking-transaction.entity';
import { BookingReward } from './entities/booking-reward.entity';
import { RewardRedemptionOutbox } from '../order/entities/reward-redemption-outbox.entity';
import { User } from '../users/entities/user.entity';
import { IntegrationSetting } from '../settings/entities/integration-setting.entity';
import { RewardsIntegrationModule } from '../rewards-integration/rewards-integration.module';
import { PartnerInstrumentsModule } from '../partner-instruments/partner-instruments.module';
import { CouponModule } from '../coupon/coupon.module';
import { GiftCardModule } from '../gift-card/gift-card.module';
import { VoucherModule } from '../voucher/voucher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RentalBooking,
      ServiceBooking,
      BlockedSlot,
      PriceModifier,
      ServicePayment,
      Business,
      Service,
      BookingTransaction,
      IntegrationSetting,
      BookingReward,
      RewardRedemptionOutbox,
      User,
    ]),

    NotificationModule,
    PaymentsModule,
    EmailModule,
    forwardRef(() => WalletModule),
    forwardRef(() => RewardsIntegrationModule),
    PartnerInstrumentsModule,
    forwardRef(() => CouponModule),
    forwardRef(() => GiftCardModule),
    forwardRef(() => VoucherModule),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
