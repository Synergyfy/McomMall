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
import { CapabilityService } from '../capability/capability.service';

describe('ProductService (New Way - Frontend Compatibility)', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;

  const mockProductRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((product) => Promise.resolve({ id: 'new-id', ...product })),
    count: jest.fn().mockResolvedValue(0),
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
        {
          provide: CapabilityService,
          useValue: mockCapabilityService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product with all new fields and map productStatus', async () => {
    const createProductDto: any = {
      title: 'New Product',
      productType: 'physical',
      price: 100,
      salePrice: 80,
      description: 'Full description',
      sku: 'NEW-SKU',
      category: 'Electronics',
      subCategory: 'Smartphones',
      brand: 'Pear',
      gender: 'unisex',
      shippingMethod: 'delivery',
      fulfillmentType: ['pickup', 'shipping'],
      isFreeDelivery: true,
      isPaidDelivery: false,
      freeDeliveryRadius: 10,
      pickupInstructions: 'Pick up at main gate',
      lowStockThreshold: 10,
      stock: 50,
      productStatus: 'publish', // Should be mapped to 'published'
      sizeGuide: { system: 'international', measurements: [] },
      bussinessId: 'business-id',
    };

    const business = {
      id: 'business-id',
      user: { id: 'user-id' },
    } as any;

    const result = await service.create(createProductDto, business);

    expect(result.productStatus).toBe('published');
    expect(result.subCategory).toBe('Smartphones');
    expect(result.brand).toBe('Pear');
    expect(result.gender).toBe('unisex');
    expect(result.shippingMethod).toBe('delivery');
    expect(result.fulfillmentType).toEqual(['pickup', 'shipping']);
    expect(result.isFreeDelivery).toBe(true);
    expect(result.isPaidDelivery).toBe(false);
    expect(result.freeDeliveryRadius).toBe(10);
    expect(result.pickupInstructions).toBe('Pick up at main gate');
    expect(result.salePrice).toBe(80);
    expect(result.lowStockThreshold).toBe(10);
    expect(result.stock).toBe(50);
    expect(result.sizeGuide).toEqual({ system: 'international', measurements: [] });
  });

  it('should create a product by mapping frontend-style fields (productName, regular_price, etc.)', async () => {
    const createProductDto: any = {
      productName: 'Frontend Product',
      product_type: 'physical',
      regular_price: 150,
      sale_price: 120,
      fullDesc: 'Frontend full description',
      shortDesc: 'Frontend short description',
      sku: 'FE-SKU',
      category: 'Shoes',
      quantity: 30,
      images: ['img1.jpg'],
      videos: ['vid1.mp4'],
      bussinessId: 'business-id',
    };

    const business = {
      id: 'business-id',
      user: { id: 'user-id' },
    } as any;

    const result = await service.create(createProductDto, business);

    expect(result.title).toBe('Frontend Product');
    expect(result.price).toBe(150);
    expect(result.salePrice).toBe(120);
    expect(result.description).toBe('Frontend full description');
    expect(result.shortDescription).toBe('Frontend short description');
    expect(result.stock).toBe(30);
    expect(result.media).toEqual(['img1.jpg', 'vid1.mp4']);
  });
});
