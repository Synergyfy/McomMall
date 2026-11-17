import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Product } from '../product/entities/product.entity';
import { Category } from '../listings/entities/category.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { OfferPublicController } from './offer-public.controller';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { ActivitiesModule } from '../activities/activities.module';
import { TimeBonusEnrollment } from './entities/time-bonus-enrollment.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Product,
      Category,
      Business,
      User,
      TimeBonusEnrollment,
      PointTransaction,
    ]),
    TransactionModule,
    ActivitiesModule,
  ],
  controllers: [OfferController, OfferPublicController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
