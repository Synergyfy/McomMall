import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { Partnership } from '../partnership/entities/partnership.entity';
import { PartnershipRequest } from '../partnership/entities/partnership-request.entity';
import { ActivitiesService } from '../activities/activities.service';
import { PromotionService } from '../promotion/promotion.service';
import { CapabilityService } from '../capability/capability.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';

describe('ProductService - Variants', () => {
  let service: ProductService;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
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
    checkPermission: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product with attributes and variations', async () => {
    const createProductDto: CreateProductDto = {
      title: 'Variant Product',
      productType: 'physical',
      price: 100,
      description: 'Test Description',
      sku: 'VAR-PROD',
      category: 'Test Category',
      bussinessId: 'test-business-id',
      media: ['http://example.com/image.jpg'],
      attributes: [
        {
          name: 'Color',
          options: [
            { name: 'Red', priceModifier: 0 },
            { name: 'Blue', priceModifier: 0 },
          ],
        },
        {
          name: 'Size',
          options: [
            { name: 'S', priceModifier: 0 },
            { name: 'M', priceModifier: 0 },
          ],
        },
      ],
      variations: [
        {
          id: 'v1',
          combination: { Color: 'Red', Size: 'S' },
          sku: 'VAR-PROD-RED-S',
          price: 100,
          stock: 10,
          available: true,
        },
      ],
    };

    const business = new Business();
    business.user = { id: 'user-id' } as User;

    mockProductRepository.count.mockResolvedValue(0);
    mockCapabilityService.checkPermission.mockResolvedValue(true);

    // Mock the create method to return the DTO merged with business
    mockProductRepository.create.mockImplementation((dto) => dto);

    mockProductRepository.save.mockResolvedValue({
      id: 'new-product-id',
      ...createProductDto,
    });

    await service.create(createProductDto, business);

    expect(mockProductRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: createProductDto.attributes,
        variations: createProductDto.variations,
      }),
    );

    expect(mockProductRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: createProductDto.attributes,
        variations: createProductDto.variations,
      }),
    );
  });

  describe('calculatePrice', () => {
    it('should calculate price using variation salePrice as absolute value', () => {
      const product = {
        price: 100,
        useVariantPricing: true,
        variations: [
          {
            combination: { Color: 'Red', Size: 'S' },
            price: 120,
            salePrice: 115,
            available: true,
            stock: 10,
          },
        ],
      } as unknown as Product;

      const selectedOptions = { Color: 'Red', Size: 'S' };
      const finalPrice = service.calculatePrice(product, selectedOptions);

      // Should return 115 directly, not 100 + 115
      expect(finalPrice).toBe(115);
    });

    it('should calculate price using variation price as absolute value if salePrice is missing', () => {
      const product = {
        price: 100,
        useVariantPricing: true,
        variations: [
          {
            combination: { Color: 'Red', Size: 'S' },
            price: 120,
            available: true,
            stock: 10,
          },
        ],
      } as unknown as Product;

      const selectedOptions = { Color: 'Red', Size: 'S' };
      const finalPrice = service.calculatePrice(product, selectedOptions);

      // Should return 120 directly
      expect(finalPrice).toBe(120);
    });

    it('should return base salePrice if no variation is found', () => {
      const product = {
        price: 100,
        salePrice: 90,
        useVariantPricing: true,
        variations: [],
      } as unknown as Product;

      const selectedOptions = { Color: 'Blue' };
      const finalPrice = service.calculatePrice(product, selectedOptions);

      expect(finalPrice).toBe(90);
    });

    it('should return base price if useVariantPricing is false', () => {
      const product = {
        price: 100,
        useVariantPricing: false,
        variations: [
          {
            combination: { Color: 'Red' },
            price: 120,
          },
        ],
      } as unknown as Product;

      const selectedOptions = { Color: 'Red' };
      const finalPrice = service.calculatePrice(product, selectedOptions);

      expect(finalPrice).toBe(100);
    });
  });
});
