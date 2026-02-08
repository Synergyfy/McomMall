import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/listing.entity';
import { SocialLink } from './entities/social_link.entity';
import { BusinessHour } from './entities/business_hour.entity';
import { SpecialDay } from './entities/special_days.entity';
import { ProductSellerProfile } from './entities/product_seller_profiles.entity';
import { StorefrontLink } from './entities/storefront_links.entity';
import { ServiceProviderProfile } from './entities/service_provider_profiles.entity';
import { Certification } from './entities/certifications.entity';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listing.service';
import { Location } from './entities/location.entity';
import { ListingsGoogleController } from './listings-google.controller';
import { GooglePlacesService } from './google-places.service';
import { ServicesModule } from '../services/services.module';
import { ActivitiesModule } from '../activities/activities.module';
import { TrialModule } from '../trial/trial.module';
import { PromotionModule } from '../promotion/promotion.module';
import { Trial } from '../payments/entities/trial.entity';
import { CapabilityModule } from '../capability/capability.module';

@Module({
  imports: [
    CapabilityModule,
    TypeOrmModule.forFeature([
      Business,
      Location,
      SocialLink,
      Category,
      BusinessHour,
      SpecialDay,
      ProductSellerProfile,
      StorefrontLink,
      ServiceProviderProfile,
      Certification,
      User, // Add User repository
      Trial,
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ServicesModule,
    ActivitiesModule,
    TrialModule,
    PromotionModule,
  ],
  controllers: [ListingsController, ListingsGoogleController],
  providers: [ListingsService, GooglePlacesService],
  exports: [ListingsService],
})
export class ListingsModule {}
