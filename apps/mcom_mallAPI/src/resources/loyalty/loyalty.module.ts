import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { LoyaltyRule } from './entities/loyalty-rule.entity';
import { LoyaltySettings } from './entities/loyalty-settings.entity';
import { LoyaltyEarningConfig } from './entities/loyalty-earning-config.entity';
import { LoyaltyMembership } from './entities/loyalty-membership.entity';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyPublicController } from './loyalty-public.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      PointTransaction,
      ServiceBooking,
      Offer,
      Product,
      Service,
      LoyaltyRule,
      LoyaltySettings,
      LoyaltyEarningConfig,
      LoyaltyMembership,
    ]),
  ],
  controllers: [LoyaltyController, LoyaltyPublicController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
