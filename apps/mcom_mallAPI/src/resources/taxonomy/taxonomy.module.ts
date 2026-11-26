import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxonomyService } from './taxonomy.service';
import { CentralTaxonomySyncService } from './central-taxonomy-sync.service';
import { TaxonomyController } from './taxonomy.controller';
import { Sector } from './entities/sector.entity';
import { TaxonomyCategory } from './entities/taxonomy-category.entity';
import { TaxonomySubcategory } from './entities/taxonomy-subcategory.entity';
import { PromotionalOffer } from '../promotional-offer/entities/promotional-offer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sector,
      TaxonomyCategory,
      TaxonomySubcategory,
      PromotionalOffer,
    ]),
  ],
  controllers: [TaxonomyController],
  providers: [TaxonomyService, CentralTaxonomySyncService],
  exports: [TaxonomyService, CentralTaxonomySyncService],
})
export class TaxonomyModule {}
