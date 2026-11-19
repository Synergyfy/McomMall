import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Location } from '../listings/entities/location.entity';
import { User } from '../users/entities/user.entity';
import { SsoModule } from '../sso/sso.module';
import { BusinessGeographyService } from './business-geography.service';
import { GeoPostcodeResolution } from './entities/geo-postcode-resolution.entity';
import { MarketplaceLocationService } from './marketplace-location.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      Location,
      User,
      GeoPostcodeResolution,
    ]),
    SsoModule,
  ],
  providers: [BusinessGeographyService, MarketplaceLocationService],
  exports: [BusinessGeographyService, MarketplaceLocationService],
})
export class GeographyModule {}
