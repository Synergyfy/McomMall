import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponProductService } from './coupon-product.service';
import { InitiateCouponPurchaseDto } from './dto/initiate-coupon-purchase.dto';
import { User } from '../users/entities/user.entity';
import { AuthenticatedRequest } from 'src/common/types';

describe('CouponController', () => {
  let controller: CouponController;
  let service: CouponService;
  let productService: CouponProductService;

  const mockUser = new User();
  mockUser.id = '1';

  const mockRequest = {
    user: mockUser,
  };

  const mockCoupon = {
    id: '1',
    code: 'TESTCODE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponService,
          useValue: {
            initiateCouponPurchase: jest.fn().mockResolvedValue({}),
            verifyAndCompletePurchase: jest.fn().mockResolvedValue(mockCoupon),
            initiateCouponReload: jest.fn().mockResolvedValue({}),
            verifyAndCompleteReload: jest.fn().mockResolvedValue(mockCoupon),
            findUserCoupons: jest.fn().mockResolvedValue([mockCoupon]),
            findCouponByCode: jest.fn().mockResolvedValue(mockCoupon),
          },
        },
        {
          provide: CouponProductService,
          useValue: {
            findCouponProductsByBusiness: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<CouponController>(CouponController);
    service = module.get<CouponService>(CouponService);
    productService = module.get<CouponProductService>(CouponProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initiatePurchase', () => {
    it('should initiate a coupon purchase', async () => {
      const initiateDto: InitiateCouponPurchaseDto = {
        couponProductId: '1',
        amount: 10,
        paymentMethod: 'stripe',
      };
      await controller.initiatePurchase(initiateDto);
      expect(service.initiateCouponPurchase).toHaveBeenCalledWith(initiateDto);
    });
  });

  describe('verifyPurchase', () => {
    it('should verify a coupon purchase', async () => {
      const verifyDto = {};
      const result = await controller.verifyPurchase(
        verifyDto,
        mockRequest as any,
      );
      expect(result).toEqual(mockCoupon);
      expect(service.verifyAndCompletePurchase).toHaveBeenCalledWith(
        verifyDto,
        mockUser.id,
      );
    });
  });

  describe('initiateReload', () => {
    it('should initiate a coupon reload', async () => {
      const initiateDto = {};
      await controller.initiateReload('TESTCODE', initiateDto);
      expect(service.initiateCouponReload).toHaveBeenCalledWith(
        'TESTCODE',
        initiateDto,
      );
    });
  });

  describe('verifyReload', () => {
    it('should verify a coupon reload', async () => {
      const verifyDto = {};
      const result = await controller.verifyReload(
        'TESTCODE',
        verifyDto,
        mockRequest as any,
      );
      expect(result).toEqual(mockCoupon);
      expect(service.verifyAndCompleteReload).toHaveBeenCalledWith(
        'TESTCODE',
        verifyDto,
        mockUser.id,
      );
    });
  });

  describe('findUserCoupons', () => {
    it('should return an array of coupons', async () => {
      const result = await controller.findUserCoupons(mockRequest as any);
      expect(result).toEqual([mockCoupon]);
      expect(service.findUserCoupons).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findCouponByCode', () => {
    it('should return a coupon', async () => {
      const result = await controller.findCouponByCode('TESTCODE');
      expect(result).toEqual(mockCoupon);
      expect(service.findCouponByCode).toHaveBeenCalledWith('TESTCODE');
    });
  });

  describe('findCouponProductsByBusiness', () => {
    it('should return an array of coupon products for a business', async () => {
      const result = await controller.findCouponProductsByBusiness('1');
      expect(result).toEqual([]);
      expect(productService.findCouponProductsByBusiness).toHaveBeenCalledWith(
        '1',
      );
    });
  });
});
