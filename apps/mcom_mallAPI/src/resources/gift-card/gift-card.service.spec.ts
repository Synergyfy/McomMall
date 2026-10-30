import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GiftCardService } from './gift-card.service';

/**
 * W1/W2 regression coverage:
 *  - Postgres `numeric` columns arrive as strings; comparisons must be numeric.
 *  - Templated/business cards are authorised by business, not recipient ownerId.
 */
describe('GiftCardService redemption', () => {
  const buildService = (overrides: Record<string, any> = {}) => {
    const service = Object.create(GiftCardService.prototype) as any;
    const saved: any[] = [];
    const card = overrides.card ?? {
      id: 'gc-1',
      code: 'MCOM-1',
      ownerId: 'user-1',
      currentBalance: '25.00',
      initialBalance: '25.00',
      isActive: true,
      templateId: null,
      purchaseBusinessId: null,
    };

    service.giftCardRepository = {
      findOne: jest.fn().mockResolvedValue(card),
    };
    service.transactionRepository = {
      create: jest.fn((value) => value),
    };
    service.digitalValueService = {
      getByCode: jest.fn().mockRejectedValue(new NotFoundException('not found')),
    };
    service.getSettings = jest.fn().mockResolvedValue({ redemptionRules: null });
    service.templateRepository = {
      findOne: jest.fn().mockResolvedValue({ ownerId: 'owner-1' }),
    };
    service.businessRepository = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: 'template-business', user: { id: 'owner-1' } }),
    };
    service.eventEmitter = undefined;

    const transactionalManager = {
      findOne: jest.fn().mockResolvedValue({ ...card }),
      save: jest.fn(async (entity) => {
        saved.push(entity);
        return entity;
      }),
    };
    const manager = {
      transaction: jest.fn(async (cb: any) => cb(transactionalManager)),
    };

    return { service, card, saved, manager, transactionalManager };
  };

  const order = { id: 'order-1', total: '100.00', user: { id: 'user-1' } };

  it('redeems 9.99 from a 25.00 balance instead of comparing strings', async () => {
    const { service, saved, manager } = buildService();

    await service.redeem(
      { code: 'MCOM-1', amount: '9.99' },
      order,
      undefined,
      manager,
    );

    expect(saved[0].currentBalance).toBe(15.01);
  });

  it('allows an amount exactly equal to the balance', async () => {
    const { service, saved, manager } = buildService();

    await service.redeem(
      { code: 'MCOM-1', amount: '25.00' },
      order,
      undefined,
      manager,
    );

    expect(saved[0].currentBalance).toBe(0);
  });

  it('rejects an amount above the balance', async () => {
    const { service, manager } = buildService();

    await expect(
      service.redeem(
        { code: 'MCOM-1', amount: '25.01' },
        order,
        undefined,
        manager,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rounds monetary values to two decimals', () => {
    const { service } = buildService();
    expect(service.toMoney('9.999')).toBe(10);
    expect(service.toMoney('9.994')).toBe(9.99);
  });

  describe('ownership', () => {
    it('allows a templated card at the template owner business', async () => {
      const { service } = buildService();
      const card = {
        id: 'gc-1',
        ownerId: 'recipient-1',
        templateId: 'template-1',
        purchaseBusinessId: null,
      };

      await expect(
        service.assertRedemptionOwnership(card, {
          businessId: 'template-business',
          userId: 'recipient-1',
        }),
      ).resolves.toBeUndefined();
    });

    it('rejects a templated card at another business', async () => {
      const { service } = buildService();
      const card = {
        id: 'gc-1',
        ownerId: 'recipient-1',
        templateId: 'template-1',
        purchaseBusinessId: 'business-a',
      };

      await expect(
        service.assertRedemptionOwnership(card, {
          businessId: 'business-b',
          userId: 'recipient-1',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows a business card when the order business matches purchaseBusinessId', async () => {
      const { service } = buildService();
      const card = {
        id: 'gc-1',
        ownerId: 'recipient-1',
        templateId: null,
        purchaseBusinessId: 'business-a',
      };

      await expect(
        service.assertRedemptionOwnership(card, {
          businessId: 'business-a',
          userId: 'recipient-1',
        }),
      ).resolves.toBeUndefined();
    });

    it('keeps platform cards recipient-only', async () => {
      const { service } = buildService();
      const card = {
        id: 'gc-1',
        ownerId: 'recipient-1',
        templateId: null,
        purchaseBusinessId: null,
      };

      await expect(
        service.assertRedemptionOwnership(card, {
          businessId: 'business-a',
          userId: 'someone-else',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      await expect(
        service.assertRedemptionOwnership(card, {
          businessId: null,
          userId: 'recipient-1',
        }),
      ).resolves.toBeUndefined();
    });
  });
});
