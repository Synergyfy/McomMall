import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/resources/users/users.service';
import { clearDatabase } from './test-utils';
import { UserRole } from '../src/common/role.enum';
import { Product } from 'src/resources/product/entities/product.entity';
import { Business } from 'src/resources/listings/entities/listing.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ListingType,
  BusinessStatus,
} from 'src/resources/listings/listing.enum';

/**
 * E2E TEST SUITE: Review Moderation Flow
 *
 * Strategy:
 * 1. Setup: Create Admin, Owner, Business, and Product.
 * 2. User Submission: Customer submits a review for a product.
 *    - Expect status: PENDING.
 *    - Expect product averageRating: 0.
 * 3. Visibility: Public endpoint should NOT show the review.
 * 4. Admin Publishing: Admin publishes the review.
 *    - Expect status: PUBLISHED.
 *    - Expect product averageRating: Updated (e.g. 5.0).
 */

describe('Review Moderation (e2e)', () => {
  let app: INestApplication;
  let customerToken: string;
  let adminToken: string;
  let productRepo: Repository<Product>;
  let bizRepo: Repository<Business>;
  let testProduct: Product;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailerService)
      .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await clearDatabase(app);

    const usersService = app.get(UsersService);
    productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
    bizRepo = app.get<Repository<Business>>(getRepositoryToken(Business));

    // 1. Create Admin
    await usersService.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'password123',
      confirm_password: 'password123',
      phoneNumber: '000',
      role: UserRole.ADMIN,
    });
    const adminLogin = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.auth.accessToken;

    // 2. Create Owner & Business
    const owner = await usersService.create({
      firstName: 'Owner',
      lastName: 'X',
      email: 'owner@test.com',
      password: 'password123',
      confirm_password: 'password123',
      phoneNumber: '111',
      role: UserRole.OWNER,
    });

    const biz = await bizRepo.save(
      bizRepo.create({
        businessName: 'Review Biz',
        user: owner,
        listingType: [ListingType.RETAIL],
        status: BusinessStatus.PUBLISHED,
        businessPhone: '111',
        shortDescription: 'Test',
      }),
    );

    // 3. Create Product
    testProduct = await productRepo.save(
      productRepo.create({
        title: 'Reviewable Product',
        business: biz,
        price: 50,
        sku: 'REV-PROD-1',
        category: 'Electronics',
        productType: 'physical',
        description: 'Test description',
      }),
    );

    // 4. Create Customer
    await usersService.create({
      firstName: 'Customer',
      lastName: 'Y',
      email: 'customer@test.com',
      password: 'password123',
      confirm_password: 'password123',
      phoneNumber: '222',
      role: UserRole.CUSTOMER,
    });
    const customerLogin = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'customer@test.com', password: 'password123' });
    customerToken = customerLogin.body.auth.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should follow the review moderation flow: Submit (Pending) -> Publish (Updated Rating)', async () => {
    // Step 1: Customer submits review
    const reviewPayload = {
      productId: testProduct.id,
      rating: 5,
      comment: 'Absolutely amazing product!',
    };

    const createRes = await request(app.getHttpServer())
      .post('/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(reviewPayload)
      .expect(201);

    const reviewId = createRes.body.id;
    expect(createRes.body.status).toBe('pending');

    // Step 2: Verify product rating is still 0 (pending reviews don't count)
    const productBefore = await request(app.getHttpServer())
      .get(`/product/${testProduct.id}`)
      .expect(200);

    // Note: The specific endpoint might be /products/:id or /product/:id depending on your controller
    // Assuming /product/:id based on standard resource naming in some controllers
    expect(productBefore.body.averageRating).toBe(0);

    // Step 3: Verify review is NOT in public listing
    const publicReviews = await request(app.getHttpServer())
      .get(`/reviews/product/${testProduct.id}`)
      .expect(200);

    const isVisible = publicReviews.body.some((r: any) => r.id === reviewId);
    expect(isVisible).toBe(false);

    // Step 4: Admin publishes review
    await request(app.getHttpServer())
      .put(`/reviews/${reviewId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Step 5: Verify product rating is now updated
    const productAfter = await request(app.getHttpServer())
      .get(`/product/${testProduct.id}`)
      .expect(200);

    expect(productAfter.body.averageRating).toBe(5);
    expect(productAfter.body.reviewCount).toBe(1);

    // Step 6: Verify review IS now in public listing
    const publicReviewsAfter = await request(app.getHttpServer())
      .get(`/reviews/product/${testProduct.id}`)
      .expect(200);

    const isVisibleAfter = publicReviewsAfter.body.some(
      (r: any) => r.id === reviewId,
    );
    expect(isVisibleAfter).toBe(true);
  });
});
