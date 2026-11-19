import { OrderService } from './order.service';
import { RewardCouponType } from '../offer/offer.enum';

const product = {
  id: 'product-1',
  title: 'Bluetooth Headphones',
  price: 59.99,
  salePrice: null,
  approvalStatus: 'approved',
  productStatus: 'published',
  visibility: 'public',
  adminDisabled: false,
  enableStockManagement: false,
  stock: 10,
  business: {
    id: 'business-1',
    status: 'published',
    businessName: 'Test Business',
    user: { id: 'owner-1', isActive: true },
  },
};

const baseOffer = {
  id: 'offer-1',
  name: 'Test offer',
  rewardCouponType: RewardCouponType.FIXED_CART_DISCOUNT,
  discountAmount: 20,
  discountPercentage: null,
  points: 30,
  isActive: true,
  approvalStatus: 'approved',
  adminDisabled: false,
  beginDate: null,
  endDate: null,
  user: { id: 'owner-1' },
  includedProducts: [],
  excludedProducts: [],
  freeProduct: null,
};

function buildService(offer: any = baseOffer) {
  const service = Object.create(OrderService.prototype) as OrderService;

  const productRepository = {
    findOne: jest.fn().mockResolvedValue(product),
  };
  const userRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-1', points: 50 }),
    findOneBy: jest.fn().mockResolvedValue({ id: 'user-1', points: 50 }),
  };
  const offerRepository = {
    findOne: jest.fn().mockResolvedValue(offer),
  };

  Object.assign(service as any, {
    productRepository,
    userRepository,
    offerRepository,
    cartService: {
      getCart: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    },
    productService: {
      calculatePrice: jest.fn().mockReturnValue(59.99),
    },
    rewardsIntegrationService: {
      buildProductLines: jest.fn().mockResolvedValue([]),
      evaluateIssuances: jest.fn().mockReturnValue([]),
    },
    rewardsClient: {
      isEnabled: jest.fn().mockReturnValue(false),
    },
    entityManager: {
      getRepository: jest.fn(),
    },
    bookingService: {
      quoteForService: jest.fn(),
    },
    partnershipService: {
      getProductPartnerships: jest.fn().mockResolvedValue([]),
    },
    logger: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
  });

  return service;
}

const quoteRequest = {
  directPurchase: { productId: product.id, quantity: 1 },
  offerId: 'offer-1',
} as any;

describe('OrderService quote offer pricing', () => {
  it('subtracts a fixed offer discount from the server total', async () => {
    const service = buildService();
    const quote = await service.quote('user-1', quoteRequest);

    expect(quote.subtotal).toBe(59.99);
    expect(quote.offerDiscount).toBe(20);
    expect(quote.finalAmount).toBe(39.99);
    expect(quote.applied.offer).toEqual({ id: 'offer-1', name: 'Test offer' });
  });

  it('subtracts a percentage offer discount from the server total', async () => {
    const service = buildService({
      ...baseOffer,
      rewardCouponType: RewardCouponType.PERCENTAGE_DISCOUNT,
      discountAmount: null,
      discountPercentage: 10,
    });
    const quote = await service.quote('user-1', quoteRequest);

    expect(quote.offerDiscount).toBe(6);
    expect(quote.finalAmount).toBe(53.99);
  });

  it('rejects an offer that does not apply to any cart line', async () => {
    const service = buildService({
      ...baseOffer,
      includedProducts: [{ id: 'different-product' }],
    });

    await expect(service.quote('user-1', quoteRequest)).rejects.toThrow(
      /does not apply/i,
    );
  });
});
