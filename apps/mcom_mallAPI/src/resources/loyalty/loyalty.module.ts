import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { LoyaltyRule } from './entities/loyalty-rule.entity';
import { LoyaltySettings } from './entities/loyalty-settings.entity';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      PointTransaction,
      ServiceBooking,
      Offer,
      Promotion,
      LoyaltyRule,
      LoyaltySettings,
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
