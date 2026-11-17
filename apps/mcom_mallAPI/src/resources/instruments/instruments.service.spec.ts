import { NotFoundException } from '@nestjs/common';
import { InstrumentsService } from './instruments.service';

function buildService() {
  const couponRepository = { findOne: jest.fn().mockResolvedValue(null) };
  const userVoucherRepository = { findOne: jest.fn().mockResolvedValue(null) };
  const voucherRepository = { findOne: jest.fn().mockResolvedValue(null) };
  const giftCardRepository = { findOne: jest.fn().mockResolvedValue(null) };

  const service = new InstrumentsService(
    couponRepository as any,
    userVoucherRepository as any,
    voucherRepository as any,
    giftCardRepository as any,
  );

  return {
    service,
    couponRepository,
    userVoucherRepository,
    voucherRepository,
    giftCardRepository,
  };
}

describe('InstrumentsService', () => {
  it('resolves a money-engine wallet', async () => {
    const { service, userVoucherRepository } = buildService();
    userVoucherRepository.findOne.mockResolvedValue({
      code: 'MV1',
      state: 'active',
      realBalance: 50,
      rewardBalance: 50,
      functionalType: 'spending_power',
      definition: {
        visualType: 'voucher',
        functionalType: 'spending_power',
        scopeType: 'any_shop',
        validShops: [],
      },
    });

    await expect(service.resolve('MV1')).resolves.toMatchObject({
      kind: 'coupon_voucher',
      behavior: 'spending_power',
      balance: 100,
      status: 'active',
      source: 'money_voucher',
    });
  });

  it('resolves a native voucher', async () => {
    const { service, voucherRepository } = buildService();
    voucherRepository.findOne.mockResolvedValue({
      code: 'V1',
      balance: 20,
      status: 'partially_redeemed',
      business: null,
    });

    await expect(service.resolve('V1')).resolves.toMatchObject({
      kind: 'voucher',
      balance: 20,
      source: 'voucher',
    });
  });

  it('resolves a gift card', async () => {
    const { service, giftCardRepository } = buildService();
    giftCardRepository.findOne.mockResolvedValue({
      code: 'G1',
      currentBalance: 40,
      isActive: true,
      purchaseBusiness: null,
    });

    await expect(service.resolve('G1')).resolves.toMatchObject({
      kind: 'gift_card',
      balance: 40,
      source: 'gift_card',
    });
  });

  it('resolves a standard coupon as a price reducer', async () => {
    const { service, couponRepository } = buildService();
    couponRepository.findOne.mockResolvedValue({
      code: 'SAVE10',
      status: 'active',
      discountValue: 10,
      business: null,
      metadata: null,
    });

    await expect(service.resolve('SAVE10')).resolves.toMatchObject({
      kind: 'standard_coupon',
      behavior: 'price_reducer',
      balance: null,
      source: 'coupon',
    });
  });

  it('throws when no ledger knows the code', async () => {
    const { service } = buildService();

    await expect(service.resolve('MISSING')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
