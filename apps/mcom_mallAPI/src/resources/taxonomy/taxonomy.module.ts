import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';
import { Sector } from './entities/sector.entity';
import { TaxonomyCategory } from './entities/taxonomy-category.entity';
import { TaxonomySubcategory } from './entities/taxonomy-subcategory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sector, TaxonomyCategory, TaxonomySubcategory]),
  ],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
