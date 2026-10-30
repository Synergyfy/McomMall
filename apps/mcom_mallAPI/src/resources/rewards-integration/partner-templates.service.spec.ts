import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PartnerTemplatesService } from './partner-templates.service';

function makeService() {
  const business = {
    id: 'b1',
    businessName: 'Acme Ltd',
    businessEmail: 'shop@acme.test',
    user: { id: 'u1', centralUserId: 'mcom-u1' },
  };
  const businessRepository = {
    findOne: jest.fn().mockResolvedValue(business),
  };
  const giftCardTemplateRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  };
  const voucherProductRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  };
  const couponRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
  };
  const flags = {
    isTemplatesEnabled: jest.fn().mockReturnValue(true),
  };
  const service = new PartnerTemplatesService(
    businessRepository as any,
    giftCardTemplateRepository as any,
    voucherProductRepository as any,
    couponRepository as any,
    flags as any,
  );
  return {
    service,
    businessRepository,
    giftCardTemplateRepository,
    couponRepository,
    flags,
  };
}

describe('PartnerTemplatesService', () => {
  it('requires one business identifier', async () => {
    const { service } = makeService();
    await expect(service.list('gift-cards', {}, true)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns 503 when the templates flag is off', async () => {
    const { service, flags } = makeService();
    flags.isTemplatesEnabled.mockReturnValue(false);
    await expect(
      service.list('gift-cards', { businessId: 'b1' }, true),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('does not allow a business caller to include inactive templates', async () => {
    const { service } = makeService();
    await expect(
      service.list(
        'gift-cards',
        { businessId: 'b1', includeInactive: true },
        false,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a template owned by another business', async () => {
    const { service, giftCardTemplateRepository } = makeService();
    giftCardTemplateRepository.findOne.mockResolvedValue({
      id: 't1',
      name: 'Other',
      ownerId: 'someone-else',
      isActive: true,
    });

    await expect(
      service.getOne('gift-cards', 't1', { businessId: 'b1' }, false),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('maps a gift-card template to the agreed response shape', async () => {
    const { service, giftCardTemplateRepository } = makeService();
    giftCardTemplateRepository.findOne.mockResolvedValue({
      id: 't1',
      name: 'Birthday',
      description: 'Happy birthday',
      fixedAmounts: ['10', '25'],
      allowCustomAmount: true,
      minCustomAmount: '5',
      maxCustomAmount: '500',
      expiryPeriodDays: 365,
      allowReloading: false,
      bonusThreshold: null,
      bonusAmount: null,
      backgroundImageUrl: 'https://img',
      backgroundColor: '#fff',
      textColor: '#000',
      isActive: true,
      ownerId: 'u1',
      scopeConfig: null,
    });

    const result = await service.getOne(
      'gift-cards',
      't1',
      { businessId: 'b1' },
      false,
    );
    expect(result.business).toEqual(
      expect.objectContaining({ id: 'b1', name: 'Acme Ltd', mcomUserId: 'mcom-u1' }),
    );
    expect(result.template).toEqual(
      expect.objectContaining({
        id: 't1',
        kind: 'gift_card',
        fixedAmounts: [10, 25],
        allowCustomAmount: true,
        minCustomAmount: 5,
        maxCustomAmount: 500,
      }),
    );
  });
});
