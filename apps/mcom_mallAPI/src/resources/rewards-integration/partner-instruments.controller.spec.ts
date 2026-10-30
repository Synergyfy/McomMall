// The controller pulls in the mesh guards (which import ESM-only `jose`).
// Mock it so the CJS Jest runtime can load the module graph.
jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

import { PartnerInstrumentsController } from './partner-instruments.controller';

function makeController() {
  const giftCardService = {
    createPartnerGiftCard: jest.fn().mockResolvedValue({
      id: 'gc-1',
      code: 'GC-CODE',
      currentBalance: 10,
      expiryDate: new Date('2027-01-01T00:00:00.000Z'),
      currency: 'GBP',
      isActive: true,
      issuanceId: 'iss-1',
    }),
  };
  const voucherService = {
    createPartnerVoucher: jest.fn().mockResolvedValue({
      id: 'v-1',
      code: 'V-CODE',
      balance: 25,
      expiresAt: new Date('2027-01-01T00:00:00.000Z'),
      status: 'unredeemed',
      issuanceId: 'iss-1',
    }),
  };
  const couponService = {
    createPartnerCoupon: jest.fn().mockResolvedValue({
      id: 'c-1',
      code: 'C-CODE',
      discountValue: 5,
      expiresAt: null,
      status: 'active',
      issuanceId: 'iss-1',
    }),
  };
  const scopeService = {
    getScope: jest.fn().mockResolvedValue(null),
    toResponse: jest.fn().mockReturnValue({
      mode: 'NO_SCOPE',
      businessId: null,
      listingIds: [],
      productIds: [],
      serviceIds: [],
    }),
  };
  const flags = {
    isMeshEnabled: jest.fn().mockReturnValue(true),
    isTemplatesEnabled: jest.fn().mockReturnValue(true),
    isScopedInstrumentsEnabled: jest.fn().mockReturnValue(true),
    isPlatformCaller: jest.fn().mockReturnValue(true),
  };
  const statusService = {
    getStatus: jest.fn(),
    revoke: jest.fn(),
  };
  const controller = new PartnerInstrumentsController(
    giftCardService as any,
    voucherService as any,
    couponService as any,
    scopeService as any,
    flags as any,
    statusService as any,
  );
  return { controller, giftCardService, voucherService, couponService, flags };
}

const req = {
  serviceCaller: { callerAppId: 'mcom-rewards', scopes: ['mall:write'] },
} as any;

describe('PartnerInstrumentsController (mesh-guarded issuance)', () => {
  it('issues a voucher and returns a normalised handle', async () => {
    const { controller, voucherService } = makeController();
    const dto = {
      amount: 25,
      recipientEmail: 'jane@example.com',
      businessName: 'Acme Ltd',
      code: 'SHARED-1',
    };

    await expect(controller.createVoucher(dto, req)).resolves.toEqual(
      expect.objectContaining({
        type: 'voucher',
        id: 'v-1',
        code: 'V-CODE',
        issuanceId: 'iss-1',
        balance: 25,
        currency: 'GBP',
        scope: expect.objectContaining({ mode: 'NO_SCOPE' }),
      }),
    );
    expect(voucherService.createPartnerVoucher).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        context: { callerAppId: 'mcom-rewards', isPlatformCaller: true, businessId: null, scopeEnabled: true },
      }),
    );
  });

  it('issues a gift card and returns a normalised handle', async () => {
    const { controller, giftCardService } = makeController();
    const dto = {
      amount: 10,
      recipientEmail: 'jane@example.com',
      businessName: 'Acme Ltd',
    };

    await expect(controller.createGiftCard(dto, req)).resolves.toEqual(
      expect.objectContaining({
        type: 'gift_card',
        id: 'gc-1',
        code: 'GC-CODE',
        balance: 10,
        currency: 'GBP',
      }),
    );
    expect(giftCardService.createPartnerGiftCard).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        context: { callerAppId: 'mcom-rewards', isPlatformCaller: true, businessId: null, scopeEnabled: true },
      }),
    );
  });

  it('issues a coupon and returns a normalised handle', async () => {
    const { controller, couponService } = makeController();
    const dto = { amount: 5, businessName: 'Acme Ltd' };

    await expect(controller.createCoupon(dto, req)).resolves.toEqual(
      expect.objectContaining({
        type: 'coupon',
        id: 'c-1',
        code: 'C-CODE',
      }),
    );
    expect(couponService.createPartnerCoupon).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        context: { callerAppId: 'mcom-rewards', isPlatformCaller: true, businessId: null, scopeEnabled: true },
      }),
    );
  });

  it('returns 200 for an idempotent replay', async () => {
    const { controller, voucherService } = makeController();
    const replayed = {
      id: 'v-1',
      code: 'V-CODE',
      balance: 25,
      expiresAt: null,
      status: 'unredeemed',
      issuanceId: 'iss-1',
    };
    Object.defineProperty(replayed, '__replayed', { value: true });
    voucherService.createPartnerVoucher.mockResolvedValue(replayed);
    const res = { status: jest.fn().mockReturnThis() };

    await controller.createVoucher(
      {
        amount: 25,
        recipientEmail: 'jane@example.com',
        businessName: 'Acme Ltd',
        issuanceId: 'iss-1',
      },
      req,
      res as any,
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects scoped issuance when the flag is off', async () => {    const { controller, flags, voucherService } = makeController();
    flags.isScopedInstrumentsEnabled.mockReturnValue(false);

    await expect(
      controller.createVoucher(
        {
          amount: 10,
          recipientEmail: 'jane@example.com',
          businessName: 'Acme Ltd',
          scope: { mode: 'ALL' as any },
        },
        req,
      ),
    ).rejects.toThrow(/FEATURE_DISABLED/);
    expect(voucherService.createPartnerVoucher).not.toHaveBeenCalled();
  });
});
