import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { OrderStatus } from '../order/enums/order-status.enum';

const product = {
  id: 'product-b',
  title: 'Product B',
  business: { id: 'business-b' },
  enableStockManagement: false,
  stock: 100,
  weight: 1,
  length: 1,
  width: 1,
  height: 1,
};

function buildService(overrides: Record<string, any> = {}) {
  const userRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-1' }),
  };
  const productRepository = {
    find: jest.fn().mockResolvedValue([product]),
  };
  const orderItemRepository = {
    create: jest.fn((value) => value),
    save: jest.fn(),
  };
  const orderRepository = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => ({ ...value, id: 'order-1' })),
  };
  const dataSource = {
    transaction: jest.fn(async (cb: any) => {
      const manager = {
        getRepository: (entity: any) => {
          if (entity.name === 'Order') return orderRepository;
          if (entity.name === 'OrderItem') return orderItemRepository;
          return orderRepository;
        },
      };
      return cb(manager);
    }),
  };
  const productService = {
    calculatePrice: jest.fn().mockReturnValue(10),
  };
  const couponService = {
    validateCoupon: jest.fn(),
    redeemForOrder: jest.fn(),
  };
  const giftCardService = {
    findActiveCardByCode: jest.fn(),
    getBusinessBinding: jest.fn().mockResolvedValue(null),
    redeem: jest.fn(),
  };
  const instrumentScopeService = {
    getEffectiveScope: jest.fn(),
    computeEligible: jest.fn(),
    computeEligiblePayable: jest.fn(),
  };
  const voucherService = {
    findVoucherByCode: jest.fn(),
    redeemForOrder: jest.fn(),
  };

  const service = new CheckoutService(
    userRepository as any,
    {} as any,
    productRepository as any,
    {} as any,
    orderRepository as any,
    orderItemRepository as any,
    {} as any,
    giftCardService as any,
    {} as any,
    {} as any,
    dataSource as any,
    productService as any,
    couponService as any,
    {} as any,
    instrumentScopeService as any,
    voucherService as any,
  );

  return {
    service,
    userRepository,
    productRepository,
    orderRepository,
    orderItemRepository,
    dataSource,
    couponService,
    giftCardService,
    voucherService,
    instrumentScopeService,
    ...overrides,
  };
}

const items = [{ productId: 'product-b', quantity: 1 }];

describe('CheckoutService instrument scope', () => {
  it('rejects a coupon with no eligible lines', async () => {
    const { service, couponService, instrumentScopeService, dataSource } =
      buildService();
    couponService.validateCoupon.mockResolvedValue({
      id: 'coupon-1',
      business: null,
      discountType: 'percentage',
      discountValue: 10,
    });
    instrumentScopeService.getEffectiveScope.mockResolvedValue({
      scopeMode: 'ITEMS',
      businessId: null,
      productIds: ['other-product'],
      serviceIds: [],
      listingIds: [],
    });
    instrumentScopeService.computeEligible.mockReturnValue({
      eligibleSubtotal: 0,
      lines: [],
    });

    await expect(
      service.initiateCheckout('user-1', { items, couponCode: 'SAVE10' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('rejects a gift card that is scoped to other products', async () => {
    const { service, giftCardService, instrumentScopeService, dataSource } =
      buildService();
    giftCardService.findActiveCardByCode.mockResolvedValue({
      id: 'gc-1',
      currentBalance: '25.00',
      purchaseBusinessId: 'business-a',
    });
    instrumentScopeService.getEffectiveScope.mockResolvedValue({
      scopeMode: 'ITEMS',
      businessId: 'business-a',
      productIds: ['other-product'],
      serviceIds: [],
      listingIds: [],
    });
    instrumentScopeService.computeEligiblePayable.mockReturnValue({
      eligibleSubtotal: 0,
      lines: [],
    });

    await expect(
      service.initiateCheckout('user-1', { items, giftCardCode: 'GC-1' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('rejects a voucher that is scoped to other products', async () => {
    const { service, voucherService, instrumentScopeService, dataSource } =
      buildService();
    voucherService.findVoucherByCode.mockResolvedValue({
      id: 'voucher-1',
      status: 'unredeemed',
      balance: '25.00',
      expiresAt: null,
      businessId: 'business-a',
      voucherProduct: null,
    });
    instrumentScopeService.getEffectiveScope.mockResolvedValue({
      scopeMode: 'ITEMS',
      businessId: 'business-a',
      productIds: ['other-product'],
      serviceIds: [],
      listingIds: [],
    });
    instrumentScopeService.computeEligiblePayable.mockReturnValue({
      eligibleSubtotal: 0,
      lines: [],
    });

    await expect(
      service.initiateCheckout('user-1', { items, voucherCode: 'V-1' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });

  it('applies a gift card and voucher up to the server total', async () => {
    const { service, giftCardService, voucherService, instrumentScopeService } =
      buildService();
    giftCardService.findActiveCardByCode.mockResolvedValue({
      id: 'gc-1',
      currentBalance: '25.00',
      purchaseBusinessId: null,
    });
    voucherService.findVoucherByCode.mockResolvedValue({
      id: 'voucher-1',
      status: 'unredeemed',
      balance: '25.00',
      expiresAt: null,
      businessId: null,
      voucherProduct: null,
    });
    instrumentScopeService.getEffectiveScope.mockResolvedValue(null);
    instrumentScopeService.computeEligiblePayable.mockReturnValue({
      eligibleSubtotal: 10,
      lines: [],
    });

    const result = await service.initiateCheckout('user-1', {
      items,
      giftCardCode: 'GC-1',
      giftCardAmount: 5,
      voucherCode: 'V-1',
      voucherAmount: 5,
    } as any);

    expect(result.paymentRequired).toBe(false);
    expect(result.remainingTotal).toBe(0);
  });

  it('still accepts a platform-wide coupon', async () => {
    const { service, couponService, instrumentScopeService } = buildService();
    couponService.validateCoupon.mockResolvedValue({
      id: 'coupon-1',
      business: null,
      discountType: 'percentage',
      discountValue: 100,
    });
    instrumentScopeService.getEffectiveScope.mockResolvedValue(null);

    const result = await service.initiateCheckout('user-1', {
      items,
      couponCode: 'FREE',
    } as any);

    expect(result.paymentRequired).toBe(false);
    expect(result.remainingTotal).toBe(0);
  });
});

describe('CheckoutService completion', () => {
  it('consumes gift card, coupon and voucher exactly once', async () => {
    const { service, orderRepository, couponService, giftCardService, voucherService } =
      buildService();
    const order = {
      id: 'order-1',
      total: 30,
      status: OrderStatus.PENDING,
      giftCardCode: 'GC-1',
      giftCardAmountApplied: 10,
      couponCode: 'CP-1',
      couponDiscountApplied: 10,
      voucherCode: 'V-1',
      voucherAmountApplied: 10,
    };
    const lockedOrder = { ...order };
    const orderWithItems = { ...order, items: [] };

    orderRepository.findOne
      .mockResolvedValueOnce(order)
      .mockResolvedValueOnce(lockedOrder)
      .mockResolvedValueOnce(orderWithItems);
    orderRepository.save.mockImplementation(async (value) => value);

    const result = await service.completeCheckout('user-1', {
      orderId: 'order-1',
    } as any);

    expect(result.status).toBe(OrderStatus.COMPLETED);
    expect(giftCardService.redeem).toHaveBeenCalledWith(
      { code: 'GC-1', amount: 10 },
      expect.objectContaining({ id: 'order-1' }),
      undefined,
      expect.anything(),
    );
    expect(couponService.redeemForOrder).toHaveBeenCalledWith(
      { code: 'CP-1', amount: 10 },
      expect.objectContaining({ id: 'order-1' }),
      expect.anything(),
    );
    expect(voucherService.redeemForOrder).toHaveBeenCalledWith(
      { code: 'V-1', amount: 10 },
      expect.objectContaining({ id: 'order-1' }),
      expect.anything(),
    );
  });

  it('rejects replaying completion of an order that is no longer pending', async () => {
    const { service, orderRepository } = buildService();
    orderRepository.findOne.mockResolvedValueOnce(null);

    await expect(
      service.completeCheckout('user-1', { orderId: 'order-1' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
