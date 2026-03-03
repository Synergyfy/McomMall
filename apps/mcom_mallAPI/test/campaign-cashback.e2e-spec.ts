import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/common/role.enum';
import {
  CampaignTargetType,
  CampaignDisplayType,
  CampaignUnlockMode,
  SpendingChannel,
  CampaignCategory,
  CampaignUsageType,
} from '../src/resources/campaign-cashback/campaign-cashback.enum';
import { ContributionPaymentProvider } from '../src/resources/campaign-cashback/dto/contribute.dto';
import { PaymentProviderService } from '../src/resources/payments/services/payment-provider.service';
import { EmailService } from '../src/resources/email/email.service';

/**
 * E2E TESTS: CampaignCashback (Full Flow)
 */

describe('CampaignCashback (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let paymentProviderService: PaymentProviderService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendUserWelcomeEmail: jest.fn().mockResolvedValue({}),
        sendOtp: jest.fn().mockResolvedValue({}),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    paymentProviderService = moduleFixture.get<PaymentProviderService>(
      PaymentProviderService,
    );

    await app.init();

    const adminEmail = `admin-${Date.now()}@test.com`;
    const userEmail = `user-${Date.now()}@test.com`;
    const password = 'Password123!';

    // Fix: Use correct endpoint /users/create
    const adminCreate = await request(app.getHttpServer())
      .post('/users/create')
      .send({
        firstName: 'Admin',
        lastName: 'Cash',
        email: adminEmail,
        password,
        confirm_password: password,
        phoneNumber: `A${Date.now()}`,
        role: UserRole.ADMIN,
      });

    if (adminCreate.status !== 201) {
      console.error('Admin Create Failed:', adminCreate.body);
    }

    const userCreate = await request(app.getHttpServer())
      .post('/users/create')
      .send({
        firstName: 'User',
        lastName: 'Cash',
        email: userEmail,
        password,
        confirm_password: password,
        phoneNumber: `U${Date.now()}`,
        role: UserRole.CUSTOMER,
      });

    if (userCreate.status !== 201) {
      console.error('User Create Failed:', userCreate.body);
    }

    const adminAuth = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: adminEmail, password });
    const userAuth = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: userEmail, password });

    if (!adminAuth.body.auth || !userAuth.body.auth) {
      console.error('Auth Failed:', {
        admin: adminAuth.body,
        user: userAuth.body,
      });
      throw new Error('Authentication failed during setup');
    }

    adminToken = adminAuth.body.auth.accessToken;
    userToken = userAuth.body.auth.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Scenario 1: Full Creation and Activation Flow', async () => {
    const now = new Date();
    const startDate = new Date(now.getTime() - 3600000).toISOString();
    const endDate = new Date(now.getTime() + 86400000).toISOString();

    const createDto = {
      name: 'E2E Integrated Campaign',
      type: CampaignCategory.REGULAR,
      startDate,
      endDate,
      targetType: CampaignTargetType.CUSTOMER,
      displayType: CampaignDisplayType.E_CARD,
      totalValue: 30,
      unlockMode: CampaignUnlockMode.REQUIRE_FULL_UNLOCK,
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
      value1Title: 'V1',
      value1Description: 'D1',
      value1UsageText: 'U1',
      value1Channels: [SpendingChannel.ONLINE],
      value1UsageTypes: [CampaignUsageType.ORDER_PRODUCT],
      value2Title: 'V2',
      value2Description: 'D2',
      value2UsageText: 'U2',
      value2Channels: [SpendingChannel.HYPERLOCAL],
      value2UsageTypes: [CampaignUsageType.BOOK_SERVICE],
      value3Title: 'V3',
      value3Description: 'D3',
      value3UsageText: 'U3',
      value3Channels: [SpendingChannel.NEARBY],
      value3UsageTypes: [CampaignUsageType.ANYWHERE],
      selectAll: true,
    };

    await request(app.getHttpServer())
      .post('/campaign-cashback')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createDto)
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get('/campaign-cashback')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const userCampaign = listResponse.body.find(
      (c) => c.campaign.name === 'E2E Integrated Campaign',
    );
    expect(userCampaign).toBeDefined();
    expect(userCampaign.wallets.length).toBeGreaterThan(0);
    expect(userCampaign.contributionPaid).toBe(false);

    jest
      .spyOn(paymentProviderService, 'verifyStripePaymentIntent')
      .mockResolvedValue({ ok: true } as any);

    await request(app.getHttpServer())
      .post(`/campaign-cashback/${userCampaign.id}/contribute`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 10,
        paymentMethod: ContributionPaymentProvider.STRIPE,
        transactionId: `e2e_tx_stripe_${Date.now()}`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/campaign-cashback/${userCampaign.id}/contribute`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 10,
        paymentMethod: ContributionPaymentProvider.STRIPE,
        transactionId: `e2e_tx_stripe_${Date.now()}`,
      })
      .expect(400);

    const finalGet = await request(app.getHttpServer())
      .get(`/campaign-cashback/${userCampaign.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(finalGet.body.contributionPaid).toBe(true);
  });
});
