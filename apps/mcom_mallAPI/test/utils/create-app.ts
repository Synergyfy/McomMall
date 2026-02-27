
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PaymentProviderService } from '../src/resources/payments/services/payment-provider.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Mock Implementation for PaymentProviderService
const mockPaymentProviderService = {
  createStripePaymentIntent: jest.fn().mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret',
    status: 'succeeded',
    currency: 'gbp',
    amount: 1000,
  }),
  createPaypalOrder: jest.fn().mockResolvedValue({
    id: 'ORDER-123',
    status: 'CREATED',
    links: [{ href: 'https://paypal.com/checkout?token=ORDER-123', rel: 'approve' }],
  }),
  capturePaypalOrder: jest.fn().mockResolvedValue({
    status: 'COMPLETED',
    purchase_units: [{
        payments: {
            captures: [{
                amount: { value: '10.00', currency_code: 'GBP' }
            }]
        }
    }]
  }),
  verifyStripePaymentIntent: jest.fn().mockResolvedValue({
    ok: true,
    details: { status: 'succeeded' },
  }),
  captureAndVerifyPaypalOrder: jest.fn().mockResolvedValue({
    ok: true,
    details: { status: 'COMPLETED' },
  }),
};

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PaymentProviderService)
    .useValue(mockPaymentProviderService)
    .compile();

  const app = moduleFixture.createNestApplication();

  // Apply the same global pipes/interceptors as main.ts if needed
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.init();

  // Ensure we are using the test database and synchronize schema
  const dataSource = app.get(DataSource);
  if (dataSource.options.database !== process.env.POSTGRES_NAME) {
      console.warn(`WARNING: Test app connected to ${dataSource.options.database} instead of ${process.env.POSTGRES_NAME}`);
  }

  // Synchronize schema for fresh test run
  await dataSource.synchronize(true);

  return app;
}
