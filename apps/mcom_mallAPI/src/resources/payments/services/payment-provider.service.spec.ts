import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderService } from './payment-provider.service';

describe('PaymentProviderService', () => {
  let service: PaymentProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProviderService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'STRIPE_SECRET_KEY') return 'sk_test_mock';
              if (key === 'PAYPAL_CLIENT_ID') return 'mock_paypal_id';
              if (key === 'PAYPAL_CLIENT_SECRET') return 'mock_paypal_secret';
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<PaymentProviderService>(PaymentProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyStripePaymentIntent', () => {
    it('should reject payment intent if amount_received does not match expected cents', async () => {
      const mockIntent = {
        id: 'pi_123',
        status: 'succeeded',
        amount_received: 100, // 100 cents (£1.00)
        currency: 'gbp',
      };

      jest.spyOn((service as any).stripe.paymentIntents, 'retrieve').mockResolvedValue(mockIntent as any);

      // Expecting 100 GBP (£100 = 10000 cents) but received 100 cents (£1)
      const result = await service.verifyStripePaymentIntent('pi_123', 100, 'gbp');
      expect(result.ok).toBe(false);
      expect(result.reason).toContain('Amount or currency mismatch');
    });

    it('should pass payment intent if amount_received matches exact expected cents', async () => {
      const mockIntent = {
        id: 'pi_123',
        status: 'succeeded',
        amount_received: 10000, // 10000 cents (£100.00)
        currency: 'gbp',
      };

      jest.spyOn((service as any).stripe.paymentIntents, 'retrieve').mockResolvedValue(mockIntent as any);

      const result = await service.verifyStripePaymentIntent('pi_123', 100, 'gbp');
      expect(result.ok).toBe(true);
    });
  });

  describe('createPaypalPayout', () => {
    it('should return simulated payout payload in test environment', async () => {
      const result = await service.createPaypalPayout(50, 'GBP', 'merchant@mcom.com');
      expect(result).toBeDefined();
    });
  });
});
