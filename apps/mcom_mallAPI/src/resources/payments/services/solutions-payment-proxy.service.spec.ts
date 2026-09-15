import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { SolutionsPaymentProxyService } from './solutions-payment-proxy.service';
import { User } from '../../users/entities/user.entity';

jest.mock('../../sso/token-crypto', () => ({
  decryptToken: jest.fn((value: string) => `decrypted:${value}`),
  isTokenEncryptionEnabled: jest.fn(() => true),
}));

function mockConfig(values: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('SolutionsPaymentProxyService', () => {
  const userRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  } as unknown as Repository<User>;
  let fetchSpy: jest.SpyInstance;

  const buildService = (configValues: Record<string, string> = {}) =>
    new SolutionsPaymentProxyService(
      mockConfig({
        MCOM_SOLUTIONS_BACKEND_URL: 'https://solutions.example.com',
        MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
        ...configValues,
      }),
      userRepository,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    (userRepository.findOne as jest.Mock).mockResolvedValue({
      id: 'mall-user-1',
      centralRefreshToken: 'stored-token',
    });
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('exposes the exact platform key Solutions resolves to McomMall', () => {
    expect(buildService().getPlatform()).toBe('MCOM Mall');
  });

  it('reports unavailable when the Solutions publishable key is missing', () => {
    const service = buildService({
      MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY: '',
    });
    expect(service.isAvailable()).toBe(false);
  });

  it('initiates a Stripe payment through Solutions and returns the client secret', async () => {
    const service = buildService();
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'access-1' }))
      .mockResolvedValueOnce(
        jsonResponse(200, { clientSecret: 'pi_secret_123', type: 'payment' }),
      );

    const result = await service.stripeInitiate(
      'mall-user-1',
      'variant-1',
      'quarterly',
    );

    expect(result).toEqual({
      clientSecret: 'pi_secret_123',
      type: 'payment',
    });
    const [, initCall] = fetchSpy.mock.calls;
    expect(initCall[0]).toContain('/api/v1/payment/platform/stripe/initiate');
    expect(JSON.parse(initCall[1].body)).toMatchObject({
      platform: 'MCOM Mall',
      externalPlanId: 'variant-1',
      billingCycle: 'quarterly',
    });
  });

  it('throws when Solutions returns no client secret', async () => {
    const service = buildService();
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'access-1' }))
      .mockResolvedValueOnce(jsonResponse(200, {}));

    await expect(
      service.stripeInitiate('mall-user-1', 'variant-1', 'annual'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('retries once with a fresh token after a 401 from Solutions', async () => {
    const service = buildService();
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'access-1' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'access-2' }))
      .mockResolvedValueOnce(
        jsonResponse(200, { clientSecret: 'pi_secret_9', type: 'payment' }),
      );

    const result = await service.stripeInitiate(
      'mall-user-1',
      'variant-1',
      'annual',
    );

    expect(result.clientSecret).toBe('pi_secret_9');
    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });

  it('throws Unauthorized when no Solutions session is linked', async () => {
    const service = buildService();
    (userRepository.findOne as jest.Mock).mockResolvedValueOnce({
      id: 'mall-user-1',
      centralRefreshToken: null,
    });

    await expect(
      service.stripeInitiate('mall-user-1', 'variant-1', 'annual'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('confirms a SetupIntent via setupIntentId', async () => {
    const service = buildService();
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'access-1' }))
      .mockResolvedValueOnce(jsonResponse(200, { status: 'active' }));

    const result = await service.stripeConfirm(
      'mall-user-1',
      'variant-1',
      'annual',
      'seti_123',
    );

    expect(result.ok).toBe(true);
    const [, confirmCall] = fetchSpy.mock.calls;
    expect(JSON.parse(confirmCall[1].body)).toMatchObject({
      setupIntentId: 'seti_123',
    });
  });

  it('initiates PayPal and returns order plus approval url', async () => {
    const service = buildService();
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'access-1' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          orderId: 'ORDER-1',
          approvalUrl: 'https://paypal.example/approve',
        }),
      );

    const result = await service.paypalInitiate(
      'mall-user-1',
      'variant-1',
      'annual',
      'https://mall.example/return',
      'https://mall.example/cancel',
    );

    expect(result).toEqual({
      orderId: 'ORDER-1',
      approvalUrl: 'https://paypal.example/approve',
    });
  });

  it('captures PayPal without a user session (Solutions capture is public)', async () => {
    const service = buildService();
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, { status: 'COMPLETED' }));

    const result = await service.paypalCapture('ORDER-1');

    expect(result.ok).toBe(true);
    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(fetchSpy.mock.calls[0][0]).toContain(
      '/api/v1/payment/platform/paypal/capture',
    );
  });
});
