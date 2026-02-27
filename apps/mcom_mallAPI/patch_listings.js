const fs = require('fs');
const content = fs.readFileSync('src/resources/listings/listings.service.point-calculation.spec.ts', 'utf8');
const newContent = "import { Sector } from '../taxonomy/entities/sector.entity';\nimport { TaxonomyCategory } from '../taxonomy/entities/taxonomy-category.entity';\nimport { TaxonomySubcategory } from '../taxonomy/entities/taxonomy-subcategory.entity';\n" + content.replace(
  "const mockBusinessA: Business = {",
  "const mockBusinessA = { sectorId: \"sector-1\", categoryId: \"category-1\", subCategoryId: \"sub-category-1\","
).replace(
  "        { provide: CapabilityService, useValue: {} },",
  "        { provide: CapabilityService, useValue: {} },\n        {\n          provide: getRepositoryToken(Sector),\n          useValue: {},\n        },\n        {\n          provide: getRepositoryToken(TaxonomyCategory),\n          useValue: {},\n        },\n        {\n          provide: getRepositoryToken(TaxonomySubcategory),\n          useValue: {},\n        },"
);
fs.writeFileSync('src/resources/listings/listings.service.point-calculation.spec.ts', newContent);
