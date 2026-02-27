import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from '../utils/create-app';
import { createAuthenticatedUser } from '../utils/auth';
import { PaymentMethod } from '../../src/resources/order/entities/order-payment.entity';
import { MembershipTier } from '../../src/resources/membership/membership-tier.enum';
import { UserRole } from '../../src/common/role.enum';

describe('Subscription Flow (E2E)', () => {
  let app: INestApplication;
  let ownerToken: string;
  let ownerId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const { user, accessToken } = await createAuthenticatedUser(
      app,
      UserRole.OWNER,
    );
    ownerToken = accessToken;
    ownerId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should initiate a Stripe payment for membership', async () => {
    const response = await request(app.getHttpServer())
      .post('/membership/initiate-payment')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        tier: MembershipTier.PROFESSIONAL,
        paymentProvider: PaymentMethod.STRIPE,
        planType: 'monthly',
      });

    // We expect this to call the mocked createStripePaymentIntent
    // The implementation might return 201 with clientSecret
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('clientSecret');
    expect(response.body.clientSecret).toBe('pi_test_123_secret');
  });

  it('should verify the Stripe payment and create membership', async () => {
    // verify-payment logic
    const response = await request(app.getHttpServer())
      .post('/membership/verify-payment')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_test_123',
        purchaseDetails: {
          tier: MembershipTier.PROFESSIONAL,
          planType: 'monthly',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      'tierType',
      MembershipTier.PROFESSIONAL,
    );
    expect(response.body.user.id).toBe(ownerId);
  });
});
