import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { Sector } from '../src/resources/taxonomy/entities/sector.entity';
import { TaxonomyCategory } from '../src/resources/taxonomy/entities/taxonomy-category.entity';
import { TaxonomySubcategory } from '../src/resources/taxonomy/entities/taxonomy-subcategory.entity';
import {
  ListingType,
  SellingMode,
} from '../src/resources/listings/listing.enum';

export async function clearDatabase(app: INestApplication) {
  const dataSource = app.get(DataSource);
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(
      `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`,
    );
  }
}

export async function seedTaxonomy(app: INestApplication) {
  const dataSource = app.get(DataSource);
  const sectorRepo = dataSource.getRepository(Sector);
  const categoryRepo = dataSource.getRepository(TaxonomyCategory);
  const subCategoryRepo = dataSource.getRepository(TaxonomySubcategory);

  const sector = sectorRepo.create({ name: 'Test Sector' });
  await sectorRepo.save(sector);

  const category = categoryRepo.create({
    name: 'Test Category',
    sectorId: sector.id,
  });
  await categoryRepo.save(category);

  const subCategory = subCategoryRepo.create({
    name: 'Test SubCategory',
    categoryId: category.id,
  });
  await subCategoryRepo.save(subCategory);

  return { sector, category, subCategory };
}

export async function getBusiness(app: INestApplication, jwtToken: string) {
  const { sector, category, subCategory } = await seedTaxonomy(app);

  const response = await request(app.getHttpServer())
    .post('/listings')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({
      listingType: [ListingType.PRODUCT],
      businessName: 'Test Business',
      shortDescription: 'Test short description long enough',
      businessPhone: '+447911123456',
      sectorId: sector.id,
      categoryId: category.id,
      subCategoryId: subCategory.id,
      productSellerProfile: {
        sellingModes: [SellingMode.PICKUP],
        hasAgeRestrictedItems: false,
      },
      location: {
        postcode: 'SW1A 1AA',
        addressLine1: '10 Downing Street',
        city: 'London',
        showPublicly: true,
      },
    })
    .expect(201);
  return response.body;
}

export async function createProduct(
  app: INestApplication,
  jwtToken: string,
  businessId: string,
) {
  const response = await request(app.getHttpServer())
    .post('/product')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send({
      businessId: businessId,
      title: 'Test Product',
      productType: 'physical',
      price: 10,
      description: 'Test product description',
      sku: `test-sku-${Date.now()}`,
      category: 'test',
    })
    .expect(201);
  return response.body;
}
