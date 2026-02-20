import { Test, TestingModule } from '@nestjs/testing';
import { CouponProductBusinessController } from './coupon-product-business.controller';
import { CouponProductService } from './coupon-product.service';
import { CreateCouponProductDto } from './dto/create-coupon-product.dto';
import { UpdateCouponProductDto } from './dto/update-coupon-product.dto';
import { User } from '../users/entities/user.entity';
import { AuthenticatedRequest } from 'src/common/types';

describe('CouponProductBusinessController', () => {
  let controller: CouponProductBusinessController;
  let service: CouponProductService;

  const mockUser = new User();
  mockUser.id = '1';

  const mockRequest = {
    user: mockUser,
  };

  const mockCouponProduct = {
    id: '1',
    name: 'Test Coupon Product',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponProductBusinessController],
      providers: [
        {
          provide: CouponProductService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockCouponProduct),
            findAll: jest.fn().mockResolvedValue([mockCouponProduct]),
            findOne: jest.fn().mockResolvedValue(mockCouponProduct),
            update: jest.fn().mockResolvedValue(mockCouponProduct),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<CouponProductBusinessController>(
      CouponProductBusinessController,
    );
    service = module.get<CouponProductService>(CouponProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a coupon product', async () => {
      const createCouponProductDto: CreateCouponProductDto = {
        name: 'Test Coupon Product',
        description: 'Test Description',
        fixedAmounts: [10, 20],
        allowCustomAmount: true,
        minCustomAmount: 5,
        maxCustomAmount: 50,
        isEnabled: true,
        expiryDays: 30,
        backgroundImage: 'http://example.com/image.png',
        textColor: '#FFFFFF',
        allowReloading: true,
        bonusThreshold: 100,
        bonusAmount: 10,
      };
      const result = await controller.create(
        createCouponProductDto,
        mockRequest as any,
      );
      expect(result).toEqual(mockCouponProduct);
      expect(service.create).toHaveBeenCalledWith(
        createCouponProductDto,
        mockUser,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of coupon products', async () => {
      const result = await controller.findAll(mockRequest as any);
      expect(result).toEqual([mockCouponProduct]);
      expect(service.findAll).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a coupon product', async () => {
      const result = await controller.findOne('1', mockRequest as any);
      expect(result).toEqual(mockCouponProduct);
      expect(service.findOne).toHaveBeenCalledWith('1', mockUser);
    });
  });

  describe('update', () => {
    it('should update a coupon product', async () => {
      const updateCouponProductDto: UpdateCouponProductDto = {
        name: 'Updated Coupon Product',
      };
      const result = await controller.update(
        '1',
        updateCouponProductDto,
        mockRequest as any,
      );
      expect(result).toEqual(mockCouponProduct);
      expect(service.update).toHaveBeenCalledWith(
        '1',
        updateCouponProductDto,
        mockUser,
      );
    });
  });

  describe('remove', () => {
    it('should remove a coupon product', async () => {
      await controller.remove('1', mockRequest as any);
      expect(service.remove).toHaveBeenCalledWith('1', mockUser);
    });
  });
});
