import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { PartnershipRequest } from '../partnership/entities/partnership-request.entity';
import { ActivitiesService } from '../activities/activities.service';
import { PromotionService } from '../promotion/promotion.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';
import { CapabilityService } from '../capability/capability.service';

describe('ProductService', () => {
  let service: ProductService;
  let activityTimerService: ActivityTimerService;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockPartnershipRepository = {
    findOne: jest.fn(),
  };

  const mockPartnershipRequestRepository = {
    findOne: jest.fn(),
  };

  const mockActivitiesService = {
    create: jest.fn(),
  };

  const mockActivityTimerService = {
    completeTaskByKey: jest.fn(),
  };

  const mockPromotionService = {
    findUserPromotions: jest.fn(),
    isProductQualified: jest.fn(),
  };

  const mockCapabilityService = {
    checkPermission: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Partnership),
          useValue: mockPartnershipRepository,
        },
        {
          provide: getRepositoryToken(PartnershipRequest),
          useValue: mockPartnershipRequestRepository,
        },
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
        {
          provide: ActivityTimerService,
          useValue: mockActivityTimerService,
        },
        {
          provide: PromotionService,
          useValue: mockPromotionService,
        },
        {
          provide: CapabilityService,
          useValue: mockCapabilityService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    activityTimerService = module.get<ActivityTimerService>(ActivityTimerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product and complete activity task', async () => {
      const createProductDto = {
        title: 'Test Product',
        productType: 'physical',
        price: 100,
        description: 'Test Description',
        sku: 'TEST-SKU',
        category: 'Test Category',
        bussinessId: 'test-business-id',
        media: ['http://example.com/image.jpg'],
      };
      const business = new Business();
      business.user = { id: 'user-id' } as User;
      mockProductRepository.create.mockReturnValue(createProductDto);
      mockProductRepository.save.mockResolvedValue({ ...createProductDto, title: 'Test Product' });
      mockActivitiesService.create.mockResolvedValue(undefined);

      await service.create(createProductDto, business);

      expect(mockProductRepository.save).toHaveBeenCalledWith(createProductDto);
      expect(activityTimerService.completeTaskByKey).toHaveBeenCalledWith(
        'user-id',
        'createdProductOrService',
      );
    });
  });

  describe('findAllForBusiness', () => {
    it('should return paginated products and calculate points for authenticated user', async () => {
      const businessId = 'some-business-id';
      const user = new User();
      const paginationDto = { page: 1, limit: 10 };
      const products = [{ id: '1', price: 100 }];
      const total = 1;

      mockProductRepository.findAndCount = jest.fn().mockResolvedValue([products, total]);
      mockPromotionService.findUserPromotions.mockResolvedValue([]);
      mockPromotionService.isProductQualified.mockReturnValue(true);

      const result = await service.findAllForBusiness(
        businessId,
        paginationDto,
        user,
      );

      expect((result.data[0] as any).points).toBe(0);
      expect(mockProductRepository.findAndCount).toHaveBeenCalledWith({
        where: { business: { id: businessId } },
        relations: ['business', 'business.user'],
        skip: 0,
        take: 10,
      });
    });
  });
});