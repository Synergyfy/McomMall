import dataSource from '../src/database/data-source';
import { CentralTaxonomySyncService } from '../src/resources/taxonomy/central-taxonomy-sync.service';
import { Sector } from '../src/resources/taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../src/resources/taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../src/resources/taxonomy/entities/taxonomy-subcategory.entity';

async function main(): Promise<void> {
  await dataSource.initialize();
  const service = new CentralTaxonomySyncService(
    dataSource.getRepository(Sector),
    dataSource.getRepository(TaxonomyCategory),
    dataSource.getRepository(TaxonomySubcategory),
  );

  try {
    const result = await service.syncFromCentral();
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
