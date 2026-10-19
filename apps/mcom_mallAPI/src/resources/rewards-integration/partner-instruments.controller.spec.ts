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
    }),
  };
  const voucherService = {
    createPartnerVoucher: jest.fn().mockResolvedValue({
      id: 'v-1',
      code: 'V-CODE',
    }),
  };
  const couponService = {
    createPartnerCoupon: jest.fn().mockResolvedValue({
      id: 'c-1',
      code: 'C-CODE',
    }),
  };
  const controller = new PartnerInstrumentsController(
    giftCardService as any,
    voucherService as any,
    couponService as any,
  );
  return { controller, giftCardService, voucherService, couponService };
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

    await expect(controller.createVoucher(dto, req)).resolves.toEqual({
      type: 'voucher',
      id: 'v-1',
      code: 'V-CODE',
    });
    expect(voucherService.createPartnerVoucher).toHaveBeenCalledWith(dto);
  });

  it('issues a gift card and returns a normalised handle', async () => {
    const { controller, giftCardService } = makeController();
    const dto = {
      amount: 10,
      recipientEmail: 'jane@example.com',
      businessName: 'Acme Ltd',
    };

    await expect(controller.createGiftCard(dto, req)).resolves.toEqual({
      type: 'gift_card',
      id: 'gc-1',
      code: 'GC-CODE',
    });
    expect(giftCardService.createPartnerGiftCard).toHaveBeenCalledWith(dto);
  });

  it('issues a coupon and returns a normalised handle', async () => {
    const { controller, couponService } = makeController();
    const dto = { amount: 5, businessName: 'Acme Ltd' };

    await expect(controller.createCoupon(dto, req)).resolves.toEqual({
      type: 'coupon',
      id: 'c-1',
      code: 'C-CODE',
    });
    expect(couponService.createPartnerCoupon).toHaveBeenCalledWith(dto);
  });
});
