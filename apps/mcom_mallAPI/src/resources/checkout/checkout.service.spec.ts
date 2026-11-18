import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { OrderStatus } from '../order/enums/order-status.enum';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';

const product = {
  id: 'product-b',
  title: 'Product B',
  business: { id: 'business-b' },
  approvalStatus: ApprovalStatus.APPROVED,
  productStatus: 'published',
  visibility: 'public',
  adminDisabled: false,
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
  const shippingAddressRepository = {
    findOne: jest.fn(),
  };
  const paymentProviderService = {
    verifyWalletCharge: jest.fn().mockResolvedValue({ ok: true }),
    settleWalletReference: jest.fn().mockResolvedValue({ ok: true }),
    createWalletHold: jest.fn().mockResolvedValue({ holdId: 'hold-1', amount: 10 }),
    buildWalletKey: jest.fn(() => 'wallet-key'),
    allocateCharge: jest.fn().mockResolvedValue({ id: 'allocation-1' }),
    getMcomCharge: jest.fn().mockResolvedValue({ id: 'charge-1' }),
    verifyStripePaymentIntent: jest.fn().mockResolvedValue({ ok: true }),
    captureAndVerifyPaypalOrder: jest.fn().mockResolvedValue({ ok: true }),
    createStripePaymentIntent: jest
      .fn()
      .mockResolvedValue({ client_secret: 'pi_secret' }),
    createPaypalOrder: jest
      .fn()
      .mockResolvedValue({ id: 'paypal-order', approvalUrl: null }),
    createWalletCharge: jest.fn().mockResolvedValue({ chargeId: 'charge-1' }),
  };
  const mcomWalletService = {
    buildKey: jest.fn(() => 'key'),
    captureHold: jest.fn(),
    toHttpException: jest.fn((error) => error),
  };
  const shippingPricingService = {
    getShippingFee: jest.fn().mockResolvedValue({ fee: 0 }),
  };
  const moneyEngineService = {
    getOwnedByCode: jest.fn(),
    getScopeForDefinition: jest.fn(),
    resolvePriceReducer: jest.fn(),
    redeemForOrder: jest.fn().mockResolvedValue({
      voucher: { id: 'mv-1', code: 'MV-1' },
      realDeduction: 5,
      rewardDeduction: 0,
    }),
    redeemPriceReducer: jest.fn(),
  };
  const featureFlags = {
    isMoneyVoucherCheckoutEnabled: jest.fn(() => false),
  };

  const service = new CheckoutService(
    userRepository as any, // user
    {} as any, // offer
    productRepository as any, // product
    orderRepository as any, // order
    orderItemRepository as any, // order item
    shippingAddressRepository as any, // shipping address
    giftCardService as any, // gift card
    paymentProviderService as any, // payment provider
    mcomWalletService as any, // mcom wallet
    dataSource as any, // data source
    productService as any, // product service
    couponService as any, // coupon
    shippingPricingService as any, // shipping pricing
    instrumentScopeService as any, // instrument scope
    voucherService as any, // voucher
    moneyEngineService as any, // money engine
    featureFlags as any, // feature flags
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
    moneyEngineService,
    featureFlags,
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

  it('applies a money-engine wallet as a payment instrument', async () => {
    const {
      service,
      orderRepository,
      moneyEngineService,
      featureFlags,
      instrumentScopeService,
    } = buildService();
    featureFlags.isMoneyVoucherCheckoutEnabled.mockReturnValue(true);
    moneyEngineService.getOwnedByCode.mockResolvedValue({
      id: 'mv-1',
      code: 'MV-1',
      state: 'active',
      realBalance: 25,
      rewardBalance: 0,
      functionalType: 'spending_power',
      definition: { scopeType: 'any_shop' },
    });
    moneyEngineService.getScopeForDefinition.mockReturnValue(null);
    instrumentScopeService.computeEligiblePayable.mockReturnValue({
      eligibleSubtotal: 10,
      lines: [],
    });

    const result = await service.initiateCheckout('user-1', {
      items,
      moneyVoucherCode: 'MV-1',
      moneyVoucherAmount: 5,
    } as any);

    expect(result.remainingTotal).toBe(5);
    expect(result.paymentRequired).toBe(true);
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        moneyVoucherCode: 'MV-1',
        moneyVoucherAmountApplied: 5,
      }),
    );
  });

  it('rejects money vouchers when the checkout flag is off', async () => {
    const { service } = buildService();

    await expect(
      service.initiateCheckout('user-1', {
        items,
        moneyVoucherCode: 'MV-1',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a price-reducer wallet as a payment instrument', async () => {
    const { service, moneyEngineService, featureFlags } = buildService();
    featureFlags.isMoneyVoucherCheckoutEnabled.mockReturnValue(true);
    moneyEngineService.getOwnedByCode.mockResolvedValue({
      id: 'mv-1',
      code: 'MV-1',
      state: 'active',
      realBalance: 25,
      rewardBalance: 0,
      functionalType: 'price_reducer',
      definition: { scopeType: 'any_shop' },
    });

    await expect(
      service.initiateCheckout('user-1', {
        items,
        moneyVoucherCode: 'MV-1',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('CheckoutService completion', () => {
  it('consumes gift card, coupon and voucher exactly once', async () => {
    const {
      service,
      orderRepository,
      couponService,
      giftCardService,
      voucherService,
      moneyEngineService,
    } = buildService();
    const order = {
      id: 'order-1',
      total: 35,
      status: OrderStatus.PENDING,
      giftCardCode: 'GC-1',
      giftCardAmountApplied: 10,
      couponCode: 'CP-1',
      couponDiscountApplied: 10,
      voucherCode: 'V-1',
      voucherAmountApplied: 10,
      moneyVoucherCode: 'MV-1',
      moneyVoucherAmountApplied: 5,
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
    expect(moneyEngineService.redeemForOrder).toHaveBeenCalledWith(
      { code: 'MV-1', amount: 5, userId: 'user-1', businessId: null },
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
