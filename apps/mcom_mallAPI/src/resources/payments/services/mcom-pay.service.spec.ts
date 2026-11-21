import { McomPayService } from './mcom-pay.service';

describe('McomPayService charge verification & allocation', () => {
  const charge = {
    id: 'clx8p2qr10000x4vj3k5m7n9p',
    appClientId: 'mcom-mall',
    amountMinor: '10270',
    currency: 'GBP',
    feeMinor: '318',
    netMinor: '9952',
    method: 'stripe' as const,
    status: 'paid',
    reference: 'mall-order-user-1-stripe-102.70',
    externalCustomerId: 'user-1',
    mcomUserId: 'central-1',
    providerRef: 'pi_123',
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  function build() {
    const allocationRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (v: any) => v),
      create: jest.fn((v: any) => v),
    };
    const service = new McomPayService(
      { get: jest.fn() } as any,
      { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() } as any,
      allocationRepository as any,
      {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      } as any,
    );
    jest.spyOn(service, 'getCharge').mockResolvedValue(charge as any);
    return { service, allocationRepository };
  }

  it('converts major units to exact integer minor-unit strings', () => {
    const { service } = build();
    expect(service.toMinorUnits(102.7)).toBe('10270');
    expect(service.toMinorUnits('102.70')).toBe('10270');
    expect(service.toMinorUnits('0.01')).toBe('1');
    expect(service.toMinorUnits(10.29)).toBe('1029');
    expect(() => service.toMinorUnits(0)).toThrow();
    expect(() => service.toMinorUnits('not-a-number')).toThrow();
  });

  it('accepts a paid charge that matches amount, currency, method and payer', async () => {
    const { service } = build();
    const result = await service.verifySettledCharge(
      charge.id,
      102.7,
      'GBP',
      'stripe',
      { mallUserId: 'user-1', mcomUserId: 'central-1' },
    );
    expect(result.ok).toBe(true);
  });

  it('rejects a charge that belongs to another customer', async () => {
    const { service } = build();
    const result = await service.verifySettledCharge(
      charge.id,
      102.7,
      'GBP',
      'stripe',
      { mallUserId: 'someone-else' },
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/different customer/i);
  });

  it('rejects amount and method mismatches', async () => {
    const { service } = build();
    const amount = await service.verifySettledCharge(
      charge.id,
      1,
      'GBP',
      'stripe',
    );
    expect(amount.ok).toBe(false);
    expect(amount.reason).toMatch(/Amount mismatch/i);

    const method = await service.verifySettledCharge(
      charge.id,
      102.7,
      'GBP',
      'wallet',
    );
    expect(method.ok).toBe(false);
    expect(method.reason).toMatch(/method mismatch/i);
  });

  it('allocates a charge once and treats a retry as idempotent', async () => {
    const { service, allocationRepository } = build();
    allocationRepository.findOne.mockResolvedValueOnce(null);

    const allocation = {
      mcomChargeId: charge.id,
      purpose: 'ORDER',
      entityType: 'order',
      entityId: 'order-1',
      userId: 'user-1',
      amountMinor: charge.amountMinor,
      currency: 'GBP',
    };
    const first = await service.allocate(allocation as any);
    expect(first.entityId).toBe('order-1');

    allocationRepository.findOne.mockResolvedValueOnce({ ...allocation });
    const retry = await service.allocate(allocation as any);
    expect(retry.entityId).toBe('order-1');
  });

  it('refuses to reuse a charge for a different business event', async () => {
    const { service, allocationRepository } = build();
    allocationRepository.findOne.mockReset();
    allocationRepository.findOne.mockResolvedValueOnce({
      mcomChargeId: charge.id,
      purpose: 'ORDER',
      entityType: 'order',
      entityId: 'order-1',
      userId: 'user-1',
      amountMinor: charge.amountMinor,
      currency: 'GBP',
    });

    await expect(
      service.allocate({
        mcomChargeId: charge.id,
        purpose: 'ORDER',
        entityType: 'order',
        entityId: 'order-2',
        userId: 'user-1',
        amountMinor: charge.amountMinor,
        currency: 'GBP',
      }),
    ).rejects.toMatchObject({ code: 'CHARGE_ALREADY_USED', httpStatus: 409 });
  });
});
