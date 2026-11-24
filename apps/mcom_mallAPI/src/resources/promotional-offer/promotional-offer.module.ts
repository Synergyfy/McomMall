import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionalOffer } from './entities/promotional-offer.entity';
import { PromotionalOfferBusiness } from './entities/promotional-offer-business.entity';
import { BusinessPromotionalOffer } from './entities/business-promotional-offer.entity';
import { AffiliateClick } from './entities/affiliate-click.entity';
import { AffiliateTransaction } from './entities/affiliate-transaction.entity';
import { Business } from '../listings/entities/listing.entity';
import { PromotionalOffersService } from './promotional-offers.service';
import { PromotionalOffersAdminService } from './promotional-offers.admin.service';
import { AwinSyncService } from './awin-sync.service';
import { PromotionalOffersController } from './promotional-offers.controller';
import { PromotionalOffersAdminController } from './promotional-offers.admin.controller';
import { AffiliateAdminController } from './affiliate.admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromotionalOffer,
      PromotionalOfferBusiness,
      BusinessPromotionalOffer,
      AffiliateClick,
      AffiliateTransaction,
      Business,
    ]),
  ],
  controllers: [
    PromotionalOffersController,
    PromotionalOffersAdminController,
    AffiliateAdminController,
  ],
  providers: [
    PromotionalOffersService,
    PromotionalOffersAdminService,
    AwinSyncService,
  ],
  exports: [PromotionalOffersService, PromotionalOffersAdminService],
})
export class PromotionalOfferModule {}
