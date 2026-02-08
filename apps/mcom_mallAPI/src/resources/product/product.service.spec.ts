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
import { TrialService } from '../trial/trial.service';
import { PromotionService } from '../promotion/promotion.service';
import { Trial } from '../payments/entities/trial.entity';

describe('ProductService', () => {
  let service: ProductService;
  let trialRepository: Repository<Trial>;
  let trialService: TrialService;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
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

  const mockTrialRepository = {
    findOne: jest.fn(),
  };

  const mockActivitiesService = {
    create: jest.fn(),
  };

  const mockTrialService = {
    markTaskAsCompleted: jest.fn(),
  };

  const mockPromotionService = {
    findUserPromotions: jest.fn(),
    isProductQualified: jest.fn(),
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
          provide: getRepositoryToken(Trial),
          useValue: mockTrialRepository,
        },
        {
          provide: ActivitiesService,
          useValue: mockActivitiesService,
        },
        {
          provide: TrialService,
          useValue: mockTrialService,
        },
        {
          provide: PromotionService,
          useValue: mockPromotionService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    trialRepository = module.get<Repository<Trial>>(getRepositoryToken(Trial));
    trialService = module.get<TrialService>(TrialService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product and mark trial task as completed if user has a trial', async () => {
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
      business.user = { id: 'user-with-trial' } as User;
      mockProductRepository.create.mockReturnValue(createProductDto);
      mockProductRepository.save.mockResolvedValue({ ...createProductDto, title: 'Test Product' });
      mockTrialRepository.findOne.mockResolvedValue(new Trial());
      mockActivitiesService.create.mockResolvedValue(undefined);

      await service.create(createProductDto, business);

      expect(mockProductRepository.save).toHaveBeenCalledWith(createProductDto);
      expect(trialService.markTaskAsCompleted).toHaveBeenCalledWith(
        'user-with-trial',
        'createdProductOrService',
      );
    });

    it('should create a product and not mark trial task as completed if user has no trial', async () => {
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
      business.user = { id: 'user-without-trial' } as User;
      mockProductRepository.create.mockReturnValue(createProductDto);
      mockProductRepository.save.mockResolvedValue({ ...createProductDto, title: 'Test Product' });
      mockTrialRepository.findOne.mockResolvedValue(null);
      mockActivitiesService.create.mockResolvedValue(undefined);

      await service.create(createProductDto, business);

      expect(mockProductRepository.save).toHaveBeenCalledWith(createProductDto);
      expect(trialService.markTaskAsCompleted).not.toHaveBeenCalled();
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