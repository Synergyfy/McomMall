import { Module, forwardRef } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/listing.entity';
import { SocialLink } from './entities/social_link.entity';
import { BusinessHour } from './entities/business_hour.entity';
import { SpecialDay } from './entities/special_days.entity';
import { ProductSellerProfile } from './entities/product_seller_profiles.entity';
import { StorefrontLink } from './entities/storefront_links.entity';
import { ServiceProviderProfile } from '../service-provider-profile/entities/service-provider-profile.entity';
import { Certification } from './entities/certifications.entity';
import { User } from '../users/entities/user.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listing.service';
import { Location } from './entities/location.entity';
import { ListingsGoogleController } from './listings-google.controller';
import { GooglePlacesService } from './google-places.service';
import { ServicesModule } from '../services/services.module';
import { ActivitiesModule } from '../activities/activities.module';
import { PromotionModule } from '../promotion/promotion.module';
import { CapabilityModule } from '../capability/capability.module';
import { ActivityTimerModule } from '../activity-timer/activity-timer.module';
import { LocalMallModule } from '../localmall/localmall.module';

@Module({
  imports: [
    LocalMallModule,
    forwardRef(() => CapabilityModule),
    TypeOrmModule.forFeature([
      Business,
      Location,
      SocialLink,
      Sector,
      TaxonomyCategory,
      TaxonomySubcategory,
      BusinessHour,
      SpecialDay,
      ProductSellerProfile,
      StorefrontLink,
      ServiceProviderProfile,
      Certification,
      User, // Add User repository
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ServicesModule,
    ActivitiesModule,
    ActivityTimerModule,
    forwardRef(() => PromotionModule),
  ],
  controllers: [ListingsController, ListingsGoogleController],
  providers: [ListingsService, GooglePlacesService],
  exports: [ListingsService],
})
export class ListingsModule {}
