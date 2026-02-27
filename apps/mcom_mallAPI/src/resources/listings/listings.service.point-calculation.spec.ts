import { Test, TestingModule } from '@nestjs/testing';
import { ListingsService } from './listing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Business } from './entities/listing.entity';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityTimerService } from '../activity-timer/activity-timer.service';
import { PromotionService } from '../promotion/promotion.service';
import { Promotion } from '../promotion/entities/promotion.entity';
import { PromotionScope } from '../promotion/promotion.enum';
import { ListingType, BusinessStatus } from './listing.enum';
import { Product } from '../product/entities/product.entity';
import { CapabilityService } from '../capability/capability.service';

describe('ListingsService - Points Calculation', () => {
  let service: ListingsService;
  let promotionService: PromotionService;

  const mockUser = { id: 'user-1' } as User;
  const mockOwnerA = { id: 'owner-A' } as User;
  const mockOwnerB = { id: 'owner-B' } as User;

  const mockBusinessA: Business = {
    id: 'business-A',
    user: mockOwnerA,
    listingType: [ListingType.PRODUCT],
    businessName: 'Business A',
    shortDescription: 'Short description',
    businessPhone: '1234567890',
    products: [
      { id: 'product-A1' } as Product,
      { id: 'product-A2' } as Product,
    ],
    status: BusinessStatus.PUBLISHED,
    isGoogleVerified: false,
    isClaimed: true,
    isVerified: false,
    location: null,
    socialLinks: [],
    sector: null,
    category: null,
    subCategory: null,
    businessHours: [],
    specialDays: [],
    campaigns: [],
    services: [],
    promotions: [],
    reviews: [],
    offers: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: getRepositoryToken(Business),
          useValue: {
            findOne: jest.fn().mockImplementation((options) => {
              if (options.where.id === 'business-A') {
                return Promise.resolve(
                  JSON.parse(JSON.stringify(mockBusinessA)),
                );
              }
              return Promise.resolve(null);
            }),
          },
        },
        { provide: getRepositoryToken(Category), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: DataSource, useValue: { createQueryRunner: jest.fn() } },
        { provide: ActivitiesService, useValue: { create: jest.fn() } },
        {
          provide: ActivityTimerService,
          useValue: { completeTaskByKey: jest.fn() },
        },
        {
          provide: PromotionService,
          useValue: {
            findUserPromotions: jest.fn(),
            isProductQualified: jest.fn(),
          },
        },
        { provide: CapabilityService, useValue: {} },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    promotionService = module.get<PromotionService>(PromotionService);
  });

  it('should not calculate points if user is not authenticated', async () => {
    const result = await service.findOnePublic('business-A');
    expect(promotionService.findUserPromotions).not.toHaveBeenCalled();
    expect((result.products[0] as any).points).toBeUndefined();
  });

  it('should qualify products for ALL_PRODUCTS scope only if owner matches', async () => {
    const mockPromotions = [
      {
        user: mockOwnerA, // Correct owner
        points: 100,
        promotionScope: PromotionScope.ALL_PRODUCTS,
      },
      {
        user: mockOwnerB, // Wrong owner
        points: 200,
        promotionScope: PromotionScope.ALL_PRODUCTS,
      },
    ] as Promotion[];
    jest
      .spyOn(promotionService, 'findUserPromotions')
      .mockResolvedValue(mockPromotions);
    (promotionService.isProductQualified as jest.Mock).mockImplementation(
      (product, promotion, _business) =>
        (service as any).isProductQualified(product, promotion, _business),
    );

    const result = await service.findOnePublic('business-A', mockUser);
    expect((result.products[0] as any).points).toBe(100);
    expect((result.products[1] as any).points).toBe(100);
  });

  it('should qualify products for ALL_LISTINGS scope only if owner matches', async () => {
    const mockPromotions = [
      {
        user: mockOwnerA, // Correct owner
        points: 100,
        promotionScope: PromotionScope.ALL_LISTINGS,
      },
      {
        user: mockOwnerB, // Wrong owner
        points: 200,
        promotionScope: PromotionScope.ALL_LISTINGS,
      },
    ] as Promotion[];
    jest
      .spyOn(promotionService, 'findUserPromotions')
      .mockResolvedValue(mockPromotions);
    (promotionService.isProductQualified as jest.Mock).mockImplementation(
      (product, promotion, _business) => {
        return promotion.user.id === _business.user.id;
      },
    );

    const result = await service.findOnePublic('business-A', mockUser);
    expect((result.products[0] as any).points).toBe(100);
    expect((result.products[1] as any).points).toBe(100);
  });

  it('should qualify products for SPECIFIC_LISTINGS scope', async () => {
    const mockPromotions = [
      {
        user: mockOwnerA,
        points: 100,
        promotionScope: PromotionScope.SPECIFIC_LISTINGS,
        businesses: [{ id: 'business-A' }],
      },
      {
        user: mockOwnerB,
        points: 200,
        promotionScope: PromotionScope.SPECIFIC_LISTINGS,
        businesses: [{ id: 'business-B' }],
      },
    ] as Promotion[];
    jest
      .spyOn(promotionService, 'findUserPromotions')
      .mockResolvedValue(mockPromotions);
    (promotionService.isProductQualified as jest.Mock).mockImplementation(
      (product, promotion, business) => {
        if (promotion.businesses) {
          return promotion.businesses.some(
            (promoBusiness) => promoBusiness.id === business.id,
          );
        }
        return false;
      },
    );

    const result = await service.findOnePublic('business-A', mockUser);
    expect((result.products[0] as any).points).toBe(100);
    expect((result.products[1] as any).points).toBe(100);
  });

  it('should qualify products for SPECIFIC_PRODUCTS scope', async () => {
    const mockPromotions = [
      {
        user: mockOwnerA,
        points: 100,
        promotionScope: PromotionScope.SPECIFIC_PRODUCTS,
        includedProducts: [{ id: 'product-A1' }],
      },
      {
        user: mockOwnerA,
        points: 200,
        promotionScope: PromotionScope.SPECIFIC_PRODUCTS,
        includedProducts: [{ id: 'product-A1' }, { id: 'product-A2' }],
      },
    ] as Promotion[];
    jest
      .spyOn(promotionService, 'findUserPromotions')
      .mockResolvedValue(mockPromotions);
    (promotionService.isProductQualified as jest.Mock).mockImplementation(
      (product, promotion, business) => {
        if (promotion.includedProducts) {
          return promotion.includedProducts.some(
            (includedProduct) => includedProduct.id === product.id,
          );
        }
        return false;
      },
    );

    const result = await service.findOnePublic('business-A', mockUser);
    expect((result.products[0] as any).points).toBe(300); // 100 + 200
    expect((result.products[1] as any).points).toBe(200);
  });

  it('should correctly sum points from multiple valid promotions of different scopes', async () => {
    const mockPromotions = [
      {
        user: mockOwnerA, // Qualifies all products
        points: 10,
        promotionScope: PromotionScope.ALL_PRODUCTS,
      },
      {
        user: mockOwnerA, // Qualifies product-A1
        points: 20,
        promotionScope: PromotionScope.SPECIFIC_PRODUCTS,
        includedProducts: [{ id: 'product-A1' }],
      },
      {
        user: mockOwnerB, // Does not qualify (wrong owner)
        points: 100,
        promotionScope: PromotionScope.ALL_PRODUCTS,
      },
    ] as Promotion[];
    jest
      .spyOn(promotionService, 'findUserPromotions')
      .mockResolvedValue(mockPromotions);
    (promotionService.isProductQualified as jest.Mock).mockImplementation(
      (product, promotion, business) => {
        if (promotion.promotionScope === PromotionScope.ALL_PRODUCTS) {
          return promotion.user.id === business.user.id;
        }
        if (promotion.promotionScope === PromotionScope.SPECIFIC_PRODUCTS) {
          return promotion.includedProducts.some(
            (includedProduct) => includedProduct.id === product.id,
          );
        }
        return false;
      },
    );

    const result = await service.findOnePublic('business-A', mockUser);
    expect((result.products[0] as any).points).toBe(30); // 10 + 20
    expect((result.products[1] as any).points).toBe(10);
  });

  it('should not crash and award no points for promotions with a null user', async () => {
    const mockPromotions = [
      {
        user: null, // Simulate a promotion with no owner
        points: 100,
        promotionScope: PromotionScope.ALL_PRODUCTS,
      },
    ] as Promotion[];
    jest
      .spyOn(promotionService, 'findUserPromotions')
      .mockResolvedValue(mockPromotions);
    (promotionService.isProductQualified as jest.Mock).mockReturnValue(false);

    const result = await service.findOnePublic('business-A', mockUser);
    expect((result.products[0] as any).points).toBe(0);
    expect((result.products[1] as any).points).toBe(0);
  });
});
