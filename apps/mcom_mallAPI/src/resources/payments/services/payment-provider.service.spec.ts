import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderService } from './payment-provider.service';

describe('PaymentProviderService', () => {
  let service: PaymentProviderService;
  const originalFetch = global.fetch;

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

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
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

      jest
        .spyOn((service as any).stripe.paymentIntents, 'retrieve')
        .mockResolvedValue(mockIntent as any);

      // Expecting 100 GBP (£100 = 10000 cents) but received 100 cents (£1)
      const result = await service.verifyStripePaymentIntent(
        'pi_123',
        100,
        'gbp',
      );
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

      jest
        .spyOn((service as any).stripe.paymentIntents, 'retrieve')
        .mockResolvedValue(mockIntent as any);

      const result = await service.verifyStripePaymentIntent(
        'pi_123',
        100,
        'gbp',
      );
      expect(result.ok).toBe(true);
    });
  });

  describe('createPaypalPayout', () => {
    it('should throw when PayPal credentials are missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PaymentProviderService,
          { provide: ConfigService, useValue: { get: () => null } },
        ],
      }).compile();
      const svc = module.get<PaymentProviderService>(PaymentProviderService);

      await expect(
        svc.createPaypalPayout(50, 'GBP', 'merchant@mcom.com'),
      ).rejects.toThrow('PayPal Payouts is not configured');
    });

    it('should return the payout batch on a successful PayPal response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => ({
          batch_header: {
            payout_batch_id: 'payout_batch_123',
            batch_status: 'PENDING',
          },
        }),
      }) as any;

      const result = await service.createPaypalPayout(
        50,
        'GBP',
        'merchant@mcom.com',
      );
      expect(result.batch_header.payout_batch_id).toBe('payout_batch_123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw when PayPal returns a non-2xx response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ name: 'UNAUTHORIZED' }),
      }) as any;

      await expect(
        service.createPaypalPayout(50, 'GBP', 'merchant@mcom.com'),
      ).rejects.toThrow('PayPal payout failed');
    });

    it('should throw when the payout response is missing batch_header', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({}),
      }) as any;

      await expect(
        service.createPaypalPayout(50, 'GBP', 'merchant@mcom.com'),
      ).rejects.toThrow('missing payout_batch_id');
    });
  });

  describe('refundPaypalOrder', () => {
    it('should return the refund result when status is COMPLETED', async () => {
      jest
        .spyOn((service as any).paymentsController, 'refundCapturedPayment')
        .mockResolvedValue({
          result: { id: 'refund_123', status: 'COMPLETED' },
        });

      const result = await service.refundPaypalOrder('capture_123');
      expect(result.id).toBe('refund_123');
    });

    it('should throw when the refund status is FAILED', async () => {
      jest
        .spyOn((service as any).paymentsController, 'refundCapturedPayment')
        .mockResolvedValue({ result: { id: 'refund_123', status: 'FAILED' } });

      await expect(service.refundPaypalOrder('capture_123')).rejects.toThrow(
        'PayPal refund failed',
      );
    });

    it('should throw (not simulate) when the SDK call errors', async () => {
      jest
        .spyOn((service as any).paymentsController, 'refundCapturedPayment')
        .mockRejectedValue(new Error('paypal api down'));

      await expect(service.refundPaypalOrder('capture_123')).rejects.toThrow(
        'PayPal refund failed',
      );
    });
  });
});
