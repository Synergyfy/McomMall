import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { InstrumentScopeService } from './instrument-scope.service';
import { ScopeLine, ScopeMode } from './enums';

function makeService() {
  const businessRepository = {
    findOne: jest.fn().mockImplementation(({ where }) =>
      Promise.resolve({ id: where.id, status: 'published' }),
    ),
    find: jest.fn().mockImplementation(({ where }) =>
      Promise.resolve(
        (where?.id?._value ?? where?.id ?? []).map((id: string) => ({
          id,
          status: 'published',
        })),
      ),
    ),
  };
  const productRepository = {
    find: jest.fn().mockImplementation(({ where }) =>
      Promise.resolve(
        (where?.id?._value ?? where?.id ?? []).map((id: string) => ({
          id,
          productStatus: 'published',
          business: { id: 'b1' },
        })),
      ),
    ),
  };
  const serviceRepository = {
    find: jest.fn().mockImplementation(({ where }) =>
      Promise.resolve(
        (where?.id?._value ?? where?.id ?? []).map((id: string) => ({
          id,
          status: 'published',
          businessId: 'b1',
        })),
      ),
    ),
  };
  const scopeRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    save: jest.fn(),
  };
  const service = new InstrumentScopeService(
    scopeRepository as any,
    businessRepository as any,
    productRepository as any,
    serviceRepository as any,
  );
  return { service, businessRepository, scopeRepository };
}

const lines: ScopeLine[] = [
  {
    lineKey: 'product:p1',
    kind: 'product',
    id: 'p1',
    businessId: 'b1',
    unitPrice: 10,
    quantity: 2,
    lineTotal: 20,
  },
  {
    lineKey: 'product:p2',
    kind: 'product',
    id: 'p2',
    businessId: 'b2',
    unitPrice: 30,
    quantity: 1,
    lineTotal: 30,
  },
  {
    lineKey: 'service:s1',
    kind: 'service',
    id: 's1',
    businessId: 'b1',
    unitPrice: 15,
    quantity: 1,
    lineTotal: 15,
  },
];

describe('InstrumentScopeService matching', () => {
  it('NO_SCOPE matches every line (legacy behaviour)', () => {
    const { service } = makeService();
    expect(service.matches(null, lines[0])).toBe(true);
    expect(
      service.computeEligible(null, lines).eligibleSubtotal,
    ).toBe(65);
  });

  it('ALL with a business matches only that business', () => {
    const { service } = makeService();
    const scope = {
      mode: ScopeMode.ALL,
      businessId: 'b1',
      listingIds: [],
      productIds: [],
      serviceIds: [],
    };
    expect(service.matches(scope, lines[0])).toBe(true);
    expect(service.matches(scope, lines[1])).toBe(false);
    expect(service.computeEligible(scope, lines).eligibleSubtotal).toBe(35);
  });

  it('ALL without a business matches all of Mall', () => {
    const { service } = makeService();
    const scope = {
      mode: ScopeMode.ALL,
      businessId: null,
      listingIds: [],
      productIds: [],
      serviceIds: [],
    };
    expect(service.computeEligible(scope, lines).eligibleSubtotal).toBe(65);
  });

  it('LISTINGS matches all lines in selected listings', () => {
    const { service } = makeService();
    const scope = {
      mode: ScopeMode.LISTINGS,
      businessId: null,
      listingIds: ['b2'],
      productIds: [],
      serviceIds: [],
    };
    expect(service.computeEligible(scope, lines).eligibleSubtotal).toBe(30);
  });

  it('ITEMS matches product and service ids separately', () => {
    const { service } = makeService();
    const scope = {
      mode: ScopeMode.ITEMS,
      businessId: null,
      listingIds: [],
      productIds: ['p1'],
      serviceIds: ['s1'],
    };
    expect(service.computeEligible(scope, lines).eligibleSubtotal).toBe(35);
  });

  it('subtracts already-applied discounts and excludes shipping for scoped instruments', () => {
    const { service } = makeService();
    const scope = {
      mode: ScopeMode.ITEMS,
      businessId: null,
      listingIds: [],
      productIds: ['p1'],
      serviceIds: [],
    };
    const discounted = [{ ...lines[0], discount: 5 }];
    const result = service.computeEligiblePayable(
      scope,
      discounted,
      20,
      25, // includes 5 shipping
    );
    expect(result.eligibleSubtotal).toBe(15);
  });

  it('keeps shipping eligible for NO_SCOPE instruments', () => {
    const { service } = makeService();
    const result = service.computeEligiblePayable(null, lines, 65, 70);
    expect(result.eligibleSubtotal).toBe(65);
  });
});

describe('InstrumentScopeService validation', () => {
  it('treats NO_SCOPE with a business binding as ALL for that business', async () => {
    const { service } = makeService();
    const result = await service.normaliseScope({
      businessId: 'b1',
      scope: { mode: ScopeMode.NO_SCOPE },
      context: { isPlatformCaller: false },
    });
    expect(result.mode).toBe(ScopeMode.ALL);
    expect(result.businessId).toBe('b1');
  });

  it('rejects ALL without a business for a non-platform caller', async () => {
    const { service } = makeService();
    await expect(
      service.normaliseScope({
        scope: { mode: ScopeMode.ALL },
        context: { isPlatformCaller: false },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows ALL without a business for a platform caller', async () => {
    const { service } = makeService();
    const result = await service.normaliseScope({
      scope: { mode: ScopeMode.ALL },
      context: { isPlatformCaller: true },
    });
    expect(result.mode).toBe(ScopeMode.ALL);
    expect(result.businessId).toBeNull();
  });

  it('rejects empty LISTINGS scope', async () => {
    const { service } = makeService();
    await expect(
      service.normaliseScope({
        scope: { mode: ScopeMode.LISTINGS, listingIds: [] },
        context: { isPlatformCaller: true },
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('rejects empty ITEMS scope', async () => {
    const { service } = makeService();
    await expect(
      service.normaliseScope({
        scope: { mode: ScopeMode.ITEMS, productIds: [], serviceIds: [] },
        context: { isPlatformCaller: true },
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('rejects an instrument scope broader than its template', async () => {
    const { service } = makeService();
    await expect(
      service.normaliseScope({
        scope: {
          mode: ScopeMode.ITEMS,
          productIds: ['p9'],
          serviceIds: [],
        },
        templateScope: {
          mode: ScopeMode.ITEMS,
          productIds: ['p1'],
          serviceIds: [],
        },
        context: { isPlatformCaller: true },
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('allows a subset of a template restriction', async () => {
    const { service } = makeService();
    const result = await service.normaliseScope({
      scope: { mode: ScopeMode.ITEMS, productIds: ['p1'], serviceIds: [] },
      templateScope: {
        mode: ScopeMode.ITEMS,
        productIds: ['p1', 'p2'],
        serviceIds: [],
      },
      context: { isPlatformCaller: true },
    });
    expect(result.productIds).toEqual(['p1']);
  });
});
