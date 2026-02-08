import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Product } from '../product/entities/product.entity';
import { Category } from '../listings/entities/category.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { TransactionModule } from '../transaction/transaction.module';
import { PromotionParticipant } from '../promotion/entities/promotion-participant.entity';
import { ActivitiesModule } from '../activities/activities.module';
import { TrialModule } from '../trial/trial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Product,
      Category,
      Business,
      User,
      PromotionParticipant,
    ]),
    TransactionModule,
    ActivitiesModule,
    TrialModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
})
export class OfferModule {}
