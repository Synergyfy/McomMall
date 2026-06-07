import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleBusinessController } from './google-business.controller';
import { GoogleBusinessService } from './google-business.service';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { Sector } from '../taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';
import { UsersModule } from '../users/users.module';
import { ListingsModule } from '../listings/listings.module';
import { AuthModule } from '../auth/auth.module';
import { LocalMallModule } from '../localmall/localmall.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      Sector,
      TaxonomyCategory,
      TaxonomySubcategory,
    ]),
    UsersModule,
    ListingsModule,
    AuthModule,
    LocalMallModule,
  ],
  controllers: [GoogleBusinessController],
  providers: [GoogleBusinessService],
  exports: [GoogleBusinessService],
})
export class GoogleBusinessModule {}
