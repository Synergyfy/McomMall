import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderPayment } from './entities/order-payment.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../coupon/coupon.service';
import { PromotionEngineService } from '../promotion/promotion-engine.service';
import { NotificationService } from '../notification/notification.service';
import { PointsService } from '../transaction/points.service';
import { Offer } from '../offer/entities/offer.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { VoucherService } from '../voucher/voucher.service';
import { GiftCardService } from '../gift-card/gift-card.service';
import { Business } from '../listings/entities/listing.entity';
import { BadRequestException } from '@nestjs/common';
import { VoucherStatus } from '../voucher/entities/voucher.entity';
import { BookingService } from '../booking/booking.service';
import { PartnershipService } from '../partnership/partnership.service';
import { ProductServiceBooking } from './entities/product-service-booking.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { WalletService } from '../wallet/wallet.service';

describe('OrderService', () => {
  let service: OrderService;
  let pointsService: PointsService;
  let offerRepository: Repository<Offer>;
  let cartService: CartService;
  let userRepository: Repository<User>;
  let entityManager: EntityManager;
  let voucherService: VoucherService;
  let giftCardService: GiftCardService;
  let businessRepository: Repository<Business>;

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(() => ({
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        totalSales: '300',
        orders: '2',
        productsSold: '6',
      }),
    })),
  };

  const mockPointsService = {
    redeemPointsForOrder: jest.fn(),
  };

  const mockOfferRepository = {
    findOneBy: jest.fn(),
  };

  const mockCartService = {
    getCart: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockVoucherService = {
    findVoucherByCode: jest.fn(),
    redeemForOrder: jest.fn(),
  };

  const mockGiftCardService = {
    checkBalance: jest.fn(),
    redeem: jest.fn(),
    purchaseGiftCard: jest.fn(),
  };

  const mockBusinessRepository = {
    findOne: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn().mockImplementation(async (cb) => {
      const manager = {
        create: jest.fn((_entity, data) => data),
        save: jest.fn((entity, data) => Promise.resolve(data || entity)),
        findOne: jest.fn(),
      };
      return cb(manager);
    }),
  };

  const mockBookingService = {
    createBookingForOrder: jest.fn(),
  };

  const mockPartnershipService = {
    getProductPartnerships: jest.fn(),
  };

  const mockProductServiceBookingRepository = {
    create: jest.fn(),
  }

  const mockPartnershipRepository = {
    findOne: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: {} },
        { provide: getRepositoryToken(OrderPayment), useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Offer), useValue: mockOfferRepository },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        { provide: CartService, useValue: mockCartService },
        {
          provide: CouponService,
          useValue: {
            redeemForOrder: jest.fn(),
          },
        },
        {
          provide: PromotionEngineService,
          useValue: { processPurchase: jest.fn() },
        },
        { provide: NotificationService, useValue: {} },
        { provide: PointsService, useValue: mockPointsService },
        { provide: VoucherService, useValue: mockVoucherService },
        { provide: GiftCardService, useValue: mockGiftCardService },
        { provide: BookingService, useValue: mockBookingService },
        { provide: PartnershipService, useValue: mockPartnershipService },
        { provide: getRepositoryToken(ProductServiceBooking), useValue: mockProductServiceBookingRepository },
        { provide: getRepositoryToken(Partnership), useValue: mockPartnershipRepository },
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: WalletService, useValue: { creditEarning: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    pointsService = module.get<PointsService>(PointsService);
    offerRepository = module.get<Repository<Offer>>(getRepositoryToken(Offer));
    cartService = module.get<CartService>(CartService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    entityManager = module.get<EntityManager>(EntityManager);
    voucherService = module.get<VoucherService>(VoucherService);
    giftCardService = module.get<GiftCardService>(GiftCardService);
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    const userId = 'user-id';
    const user = { id: userId };
    const business = { id: 'biz-id', user: { id: 'owner-id' } };
    const cart = {
      items: [
        {
          product: {
            id: 'prod-id',
            price: 100,
            businessId: 'biz-id',
            business,
          },
          quantity: 1,
        },
      ],
    };

    beforeEach(() => {
      mockCartService.getCart.mockResolvedValue(cart);
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockBusinessRepository.findOne.mockResolvedValue(business);
    });

    it('should call redeemPointsForOrder when an offerId is provided', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        offerId: 'offer-id',
        payment: {
          amount: 100,
          paymentMethod: 'card',
          transactionId: 'txn-id',
        } as any,
      };
      const offer = { id: 'offer-id', points: 50 };
      mockOfferRepository.findOneBy.mockResolvedValue(offer);

      await service.checkout(userId, createCheckoutDto);

      expect(pointsService.redeemPointsForOrder).toHaveBeenCalled();
      expect(pointsService.redeemPointsForOrder).toHaveBeenCalledWith(
        expect.any(Object), // order
        user,
        offer,
        expect.any(Object), // entityManager
      );
    });

    it('should apply voucher discount and redeem voucher when voucherCode is provided', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        voucherCode: 'VOUCHER123',
        payment: {
          amount: 50, // 100 (cart) - 50 (voucher)
          paymentMethod: 'card',
          transactionId: 'txn-id',
        } as any,
      };
      const voucher = {
        code: 'VOUCHER123',
        balance: 50,
        status: VoucherStatus.UNREDEEMED,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };

      mockVoucherService.findVoucherByCode.mockResolvedValue(voucher);

      const result = await service.checkout(userId, createCheckoutDto);

      expect(voucherService.findVoucherByCode).toHaveBeenCalledWith(
        'VOUCHER123',
      );
      expect(result.total).toBe(50);
      expect(voucherService.redeemForOrder).toHaveBeenCalled();
      expect(voucherService.redeemForOrder).toHaveBeenCalledWith(
        { code: 'VOUCHER123', amount: 50 },
        expect.any(Object), // order
        expect.any(Object), // entity manager
      );
    });

    it('should throw BadRequestException for invalid voucher', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        voucherCode: 'INVALIDVOUCHER',
        payment: {
          amount: 100,
          paymentMethod: 'card',
          transactionId: 'txn-id',
        } as any,
      };

      mockVoucherService.findVoucherByCode.mockRejectedValue(
        new Error('Voucher not found'),
      );

      await expect(service.checkout(userId, createCheckoutDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.checkout(userId, createCheckoutDto)).rejects.toThrow(
        'Invalid voucher: Voucher not found',
      );
    });

    it('should handle both gift card and voucher redemption', async () => {
      const createCheckoutDto: CreateCheckoutDto = {
        giftCardCode: 'GIFTCARD123',
        voucherCode: 'VOUCHER123',
        payment: {
          amount: 30, // 100 (cart) - 20 (giftcard) - 50 (voucher)
          paymentMethod: 'card',
          transactionId: 'txn-id',
        } as any,
      };
      const giftCard = { currentBalance: 20 };
      const voucher = {
        code: 'VOUCHER123',
        balance: 50,
        status: VoucherStatus.UNREDEEMED,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      };

      mockGiftCardService.checkBalance.mockResolvedValue(giftCard);
      mockVoucherService.findVoucherByCode.mockResolvedValue(voucher);

      const result = await service.checkout(userId, createCheckoutDto);

      expect(giftCardService.checkBalance).toHaveBeenCalledWith('GIFTCARD123');
      expect(giftCardService.redeem).toHaveBeenCalledWith(
        { code: 'GIFTCARD123', amount: 20 },
        expect.any(Object),
        'biz-id',
        expect.any(Object),
      );

      expect(voucherService.findVoucherByCode).toHaveBeenCalledWith(
        'VOUCHER123',
      );
      expect(voucherService.redeemForOrder).toHaveBeenCalledWith(
        { code: 'VOUCHER123', amount: 50 },
        expect.any(Object),
        expect.any(Object),
      );

      expect(result.total).toBe(30);
    });
  });
});