import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { User } from '../users/entities/user.entity';
import { AuthenticatedRequest } from '../../common/types';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponSourceType, DiscountType } from './coupon.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

describe('CouponController', () => {
  let controller: CouponController;
  let service: CouponService;

  const mockUser = new User();
  mockUser.id = '1';

  const mockRequest = {
    user: mockUser,
  } as AuthenticatedRequest;

  const mockCoupon = {
    id: '1',
    code: 'TESTCODE',
    title: 'Test Coupon',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockCoupon),
            findAll: jest.fn().mockResolvedValue({ items: [mockCoupon], meta: {} }),
            validateCoupon: jest.fn().mockResolvedValue(mockCoupon),
            saveCoupon: jest.fn().mockResolvedValue({ id: 'save-1', coupon: mockCoupon }),
            removeSavedCoupon: jest.fn().mockResolvedValue(undefined),
            getSavedCoupons: jest.fn().mockResolvedValue([{ id: 'save-1', coupon: mockCoupon }]),
            findCouponByCode: jest.fn().mockResolvedValue(mockCoupon),
            findProductById: jest.fn().mockResolvedValue(mockCoupon),
          },
        },
      ],
    }).compile();

    controller = module.get<CouponController>(CouponController);
    service = module.get<CouponService>(CouponService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a coupon', async () => {
      const createDto: CreateCouponDto = {
        title: 'Test Coupon',
        code: 'TESTCODE',
        sourceType: CouponSourceType.PLATFORM,
        discountValue: 10,
        discountType: DiscountType.FIXED,
      };
      const result = await controller.create(createDto);
      expect(result).toEqual(mockCoupon);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated coupons', async () => {
      const paginationDto: PaginationQueryDto = { page: 1, limit: 10 };
      const result = await controller.findAll(paginationDto);
      expect(result.items).toEqual([mockCoupon]);
      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('validate', () => {
    it('should validate a coupon code', async () => {
      const result = await controller.validate('TESTCODE', mockRequest);
      expect(result).toEqual(mockCoupon);
      expect(service.validateCoupon).toHaveBeenCalledWith('TESTCODE', mockUser);
    });
  });

  describe('saveCoupon', () => {
    it('should save a coupon for the user', async () => {
      const result = await controller.saveCoupon('TESTCODE', mockRequest);
      expect(result.coupon).toEqual(mockCoupon);
      expect(service.saveCoupon).toHaveBeenCalledWith('TESTCODE', mockUser);
    });
  });

  describe('removeSavedCoupon', () => {
    it('should remove a saved coupon', async () => {
      await controller.removeSavedCoupon('TESTCODE', mockRequest);
      expect(service.removeSavedCoupon).toHaveBeenCalledWith('TESTCODE', mockUser);
    });
  });

  describe('getSavedCoupons', () => {
    it('should return saved coupons for the user', async () => {
      const result = await controller.getSavedCoupons(mockRequest);
      expect(result[0].coupon).toEqual(mockCoupon);
      expect(service.getSavedCoupons).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a coupon by code', async () => {
      const result = await controller.findOne('TESTCODE');
      expect(result).toEqual(mockCoupon);
      expect(service.findCouponByCode).toHaveBeenCalledWith('TESTCODE');
    });
  });

  describe('getProductDetail', () => {
    it('should return coupon product detail', async () => {
      const result = await controller.getProductDetail('1');
      expect(result).toEqual(mockCoupon);
      expect(service.findProductById).toHaveBeenCalledWith('1');
    });
  });
});
