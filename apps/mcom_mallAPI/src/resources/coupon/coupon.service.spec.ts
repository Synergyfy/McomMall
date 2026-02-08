import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CouponService } from './coupon.service';
import { Coupon } from './entities/coupon.entity';
import { CouponProduct } from './entities/coupon-product.entity';
import { User } from '../users/entities/user.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { WalletService } from '../wallet/wallet.service';
import { CouponTransactionService } from './coupon-transaction.service';
import { InitiateCouponPurchaseDto } from './dto/initiate-coupon-purchase.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { VerifyCouponPurchaseDto } from './dto/verify-coupon-purchase.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';

describe('CouponService', () => {
  let service: CouponService;
  let couponRepository: Repository<Coupon>;
  let couponProductRepository: Repository<CouponProduct>;
  let paymentProviderService: PaymentProviderService;
  let walletService: WalletService;
  let couponTransactionService: CouponTransactionService;
  let dataSource: DataSource;

  const mockUser = new User();
  mockUser.id = '1';

  const mockCouponProduct = new CouponProduct();
  mockCouponProduct.id = '1';
  mockCouponProduct.name = 'Test Coupon Product';
  mockCouponProduct.user = mockUser;
  mockCouponProduct.isEnabled = true;
  mockCouponProduct.fixedAmounts = [10, 20];

  const mockCoupon = new Coupon();
  mockCoupon.id = '1';
  mockCoupon.code = 'TESTCODE';
  mockCoupon.couponProduct = mockCouponProduct;
  mockCoupon.owner = mockUser;
  mockCoupon.buyer = mockUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: {
            create: jest.fn().mockReturnValue(mockCoupon),
            save: jest.fn().mockResolvedValue(mockCoupon),
            findOne: jest.fn().mockResolvedValue(null),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CouponProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: PaymentProviderService,
          useValue: {
            createStripePaymentIntent: jest.fn(),
            createPaypalOrder: jest.fn(),
            verifyStripePaymentIntent: jest.fn(),
            verifyPaypalOrder: jest.fn(),
          },
        },
        {
          provide: WalletService,
          useValue: {
            creditEarning: jest.fn(),
          },
        },
        {
          provide: CouponTransactionService,
          useValue: {
            createTransaction: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation(async (cb) => {
              const manager = {
                getRepository: jest.fn().mockImplementation((entity) => {
                  if (entity === Coupon) {
                    return couponRepository;
                  }
                  return {
                    create: jest.fn(),
                    save: jest.fn(),
                  };
                }),
              };
              return cb(manager);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    couponRepository = module.get<Repository<Coupon>>(getRepositoryToken(Coupon));
    couponProductRepository = module.get<Repository<CouponProduct>>(
      getRepositoryToken(CouponProduct),
    );
    paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    walletService = module.get<WalletService>(WalletService);
    couponTransactionService = module.get<CouponTransactionService>(
      CouponTransactionService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateCouponPurchase', () => {
    it('should initiate a stripe payment', async () => {
      const initiateDto: InitiateCouponPurchaseDto = {
        couponProductId: '1',
        amount: 10,
        paymentMethod: 'stripe',
      };
      jest.spyOn(couponProductRepository, 'findOneBy').mockResolvedValue(mockCouponProduct);
      jest.spyOn(paymentProviderService, 'createStripePaymentIntent').mockResolvedValue({
        client_secret: 'client_secret',
      } as any);

      const result = await service.initiateCouponPurchase(initiateDto);

      expect(result.provider).toEqual(PaymentMethod.STRIPE);
      expect(result.clientSecret).toEqual('client_secret');
      expect(couponProductRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
        isEnabled: true,
      });
      expect(paymentProviderService.createStripePaymentIntent).toHaveBeenCalledWith(
        10,
        'GBP',
      );
    });
  });

  describe('findUserCoupons', () => {
    it('should return an array of coupons', async () => {
      const mockCoupons = [mockCoupon];
      jest.spyOn(couponRepository, 'find').mockResolvedValue(mockCoupons);

      const result = await service.findUserCoupons(mockUser.id);

      expect(result).toEqual(mockCoupons);
      expect(couponRepository.find).toHaveBeenCalledWith({
        where: [{ buyer: { id: mockUser.id } }, { recipient: { id: mockUser.id } }],
        relations: ['owner', 'couponProduct'],
      });
    });
  });

  describe('findCouponByCode', () => {
    it('should return a coupon', async () => {
      jest.spyOn(couponRepository, 'findOne').mockResolvedValue(mockCoupon);

      const result = await service.findCouponByCode('TESTCODE');

      expect(result).toEqual(mockCoupon);
      expect(couponRepository.findOne).toHaveBeenCalledWith({
        where: { code: 'TESTCODE' },
        relations: ['couponProduct', 'transactions', 'owner'],
      });
    });
  });

  describe('verifyAndCompletePurchase', () => {
    it('should verify a stripe payment and create a new coupon', async () => {
      const createCouponDto: CreateCouponDto = {
        couponProductId: '1',
        amount: 10,
      };
      const verifyDto: VerifyCouponPurchaseDto = {
        purchaseDetails: createCouponDto,
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
      };
      jest.spyOn(couponProductRepository, 'findOne').mockResolvedValue(mockCouponProduct);
      jest.spyOn(paymentProviderService, 'verifyStripePaymentIntent').mockResolvedValue({
        ok: true,
      } as any);

      const result = await service.verifyAndCompletePurchase(verifyDto, mockUser.id);

      expect(result).toEqual(mockCoupon);
      expect(couponProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', isEnabled: true },
        relations: ['user'],
      });
      expect(paymentProviderService.verifyStripePaymentIntent).toHaveBeenCalledWith(
        'pi_123',
        10,
        'GBP',
      );
      expect(couponRepository.create).toHaveBeenCalled();
      expect(couponRepository.save).toHaveBeenCalledWith(mockCoupon);
      expect(walletService.creditEarning).toHaveBeenCalled();
      expect(couponTransactionService.createTransaction).toHaveBeenCalled();
    });
  });
});