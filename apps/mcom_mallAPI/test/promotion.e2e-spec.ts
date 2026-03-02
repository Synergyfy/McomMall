import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CapabilityService } from '../src/resources/capability/capability.service';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearDatabase, getBusiness, createProduct, seedTaxonomy } from './test-utils';
import { createAuthenticatedUser } from './utils/auth';
import { UsersService } from '../src/resources/users/users.service';
import { CreateUserDto } from '../src/resources/users/dto/create-user.dto';
import { UserRole } from '../src/common/role.enum';
import { CreatePromotionDto } from 'src/resources/promotion/dto/create-promotion.dto';
import {
  PromotionScope,
  PromotionType,
} from 'src/resources/promotion/promotion.enum';
import { SellingMode, ListingType } from '../src/resources/listings/listing.enum';

describe('PromotionController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let business: any;
  let product: any;
  let promotion: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
      .overrideProvider(CapabilityService)
      .useValue({ checkPermission: jest.fn().mockResolvedValue(undefined) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await clearDatabase(app);

    const authData = await createAuthenticatedUser(app, UserRole.OWNER);
    jwtToken = authData.accessToken;
    const userId = authData.user.id;
    
    const { sector, category, subCategory } = await seedTaxonomy(app);

    const businessResponse = await request(app.getHttpServer())
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

    business = businessResponse.body;
    product = await createProduct(app, jwtToken, business.id);

    const createPromotionDto: CreatePromotionDto = {
      name: 'Test Promotion',
      promotionType: PromotionType.MULTIPLIER,
      promotionScope: PromotionScope.SPECIFIC_LISTINGS,
      businessIds: [business.id],
      includedProductIds: [product.id],
      excludedProductIds: [],
      multiplier: 2,
      minimumSpend: 10,
      description: 'test',
      termsAndConditions: 'test',
      isActive: true,
      beginDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      bonusPoints: 0,
      limitPerCustomer: 0,
    };

    const promotionResponse = await request(app.getHttpServer())
      .post('/promotions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createPromotionDto)
      .expect(201);

    promotion = promotionResponse.body;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/promotions (GET)', () => {
    return request(app.getHttpServer())
      .get('/promotions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(promotion.id);
      });
  });

  it('/promotions/check (GET)', () => {
    return request(app.getHttpServer())
      .get(
        `/promotions/check?businessId=${business.id}&productId=${product.id}`,
      )
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(promotion.id);
      });
  });

  it('/promotions/check (GET) with ALL_LISTINGS scope', async () => {
    const createPromotionDto: CreatePromotionDto = {
      name: 'All Listings Promotion',
      promotionType: PromotionType.MULTIPLIER,
      promotionScope: PromotionScope.ALL_LISTINGS,
      multiplier: 3,
      minimumSpend: 20,
      description: 'test all listings',
      termsAndConditions: 'test all listings',
      isActive: true,
      beginDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      bonusPoints: 0,
      limitPerCustomer: 0,
      businessIds: [],
      includedProductIds: [],
      excludedProductIds: [],
    };

    await request(app.getHttpServer())
      .post('/promotions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(createPromotionDto)
      .expect(201);

    return request(app.getHttpServer())
      .get(`/promotions/check?businessId=${business.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(2);
      });
  });
});
