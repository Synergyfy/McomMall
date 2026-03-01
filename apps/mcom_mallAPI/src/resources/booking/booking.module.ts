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
    ]),

    NotificationModule,
    PaymentsModule,
    EmailModule,
    forwardRef(() => WalletModule),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
