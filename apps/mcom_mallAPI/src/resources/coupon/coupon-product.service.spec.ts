import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponProductService } from './coupon-product.service';
import { CouponProduct } from './entities/coupon-product.entity';
import { User } from '../users/entities/user.entity';
import { CreateCouponProductDto } from './dto/create-coupon-product.dto';
import { UpdateCouponProductDto } from './dto/update-coupon-product.dto';
import { Business } from '../listings/entities/listing.entity';
import { CapabilityService } from '../capability/capability.service';

describe('CouponProductService', () => {
  let service: CouponProductService;
  let repository: Repository<CouponProduct>;
  let businessRepository: Repository<Business>;

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softRemove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  const mockUser = new User();
  mockUser.id = '1';

  const mockCouponProduct = new CouponProduct();
  mockCouponProduct.id = '1';
  mockCouponProduct.name = 'Test Coupon Product';
  mockCouponProduct.user = mockUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponProductService,
        {
          provide: getRepositoryToken(CouponProduct),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useFactory: mockRepository,
        },
        {
          provide: CapabilityService,
          useValue: {
            checkPermission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CouponProductService>(CouponProductService);
    repository = module.get<Repository<CouponProduct>>(
      getRepositoryToken(CouponProduct),
    );
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new coupon product', async () => {
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
      jest.spyOn(repository, 'count').mockResolvedValue(0);
      jest.spyOn(repository, 'create').mockReturnValue(mockCouponProduct);
      jest.spyOn(repository, 'save').mockResolvedValue(mockCouponProduct);

      const result = await service.create(createCouponProductDto, mockUser);

      expect(result).toEqual(mockCouponProduct);
      expect(repository.create).toHaveBeenCalledWith({
        ...createCouponProductDto,
        user: mockUser,
      });
      expect(repository.save).toHaveBeenCalledWith(mockCouponProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of coupon products', async () => {
      const mockCouponProducts = [mockCouponProduct];
      jest.spyOn(repository, 'find').mockResolvedValue(mockCouponProducts);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(mockCouponProducts);
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a coupon product', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCouponProduct);

      const result = await service.findOne('1', mockUser);

      expect(result).toEqual(mockCouponProduct);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', user: { id: mockUser.id } },
      });
    });
  });

  describe('update', () => {
    it('should update a coupon product', async () => {
      const updateCouponProductDto: UpdateCouponProductDto = {
        name: 'Updated Coupon Product',
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCouponProduct);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockCouponProduct,
        ...updateCouponProductDto,
      });

      const result = await service.update(
        '1',
        updateCouponProductDto,
        mockUser,
      );

      expect(result.name).toEqual(updateCouponProductDto.name);
      expect(service.findOne).toHaveBeenCalledWith('1', mockUser);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockCouponProduct,
        ...updateCouponProductDto,
      });
    });
  });

  describe('remove', () => {
    it('should remove a coupon product', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCouponProduct);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockCouponProduct);

      const result = await service.remove('1', mockUser);

      expect(result).toEqual(mockCouponProduct);
      expect(service.findOne).toHaveBeenCalledWith('1', mockUser);
      expect(repository.softRemove).toHaveBeenCalledWith(mockCouponProduct);
    });
  });

  describe('findCouponProductsByBusiness', () => {
    it('should return an array of coupon products for a business', async () => {
      const mockBusiness = new Business();
      mockBusiness.id = '1';
      mockBusiness.user = mockUser;
      const mockCouponProducts = [mockCouponProduct];
      jest.spyOn(businessRepository, 'findOne').mockResolvedValue(mockBusiness);
      jest.spyOn(repository, 'find').mockResolvedValue(mockCouponProducts);

      const result = await service.findCouponProductsByBusiness('1');

      expect(result).toEqual(mockCouponProducts);
      expect(businessRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          user: { id: mockUser.id },
          isEnabled: true,
        },
      });
    });
  });

  describe('findAllPublic', () => {
    let queryBuilder;

    beforeEach(() => {
      queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };
      (repository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );
    });

    it('should filter by search, min/max amount, businessId and businessName', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const searchDto = {
        page: 1,
        limit: 10,
        search: 'Coupon',
        minAmount: 5,
        maxAmount: 50,
        businessId: 'bus-1',
        businessName: 'My Business',
      };

      await service.findAllPublic(searchDto as any);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(couponProduct.name ILIKE :search OR couponProduct.description ILIKE :search)',
        { search: '%Coupon%' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'couponProduct.minCustomAmount >= :minAmount',
        { minAmount: 5 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'couponProduct.maxCustomAmount <= :maxAmount',
        { maxAmount: 50 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'business.id = :businessId',
        { businessId: 'bus-1' },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'business.businessName ILIKE :businessName',
        { businessName: '%My Business%' },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'couponProduct.createdAt',
        'DESC',
      );
    });
  });
});
