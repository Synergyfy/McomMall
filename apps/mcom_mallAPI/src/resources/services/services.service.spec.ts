import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { BundledService } from './entities/bundled-service.entity';
import { ConfigurableAddon } from './entities/configurable-addon.entity';
import { Business } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListingType } from '../listings/listing.enum';
import { PricingModel, DeliveryMode, VariantType } from './service.enum';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ActivitiesService } from '../activities/activities.service';
import { CapabilityService } from '../capability/capability.service';

const mockServiceRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
  findAndCount: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockBusinessRepository = {
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
};

const mockUserRepository = {};
const mockBundledServiceRepository = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
  find: jest.fn(),
};
const mockConfigurableAddonRepository = {
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
  find: jest.fn(),
};

describe('ServicesService', () => {
  let service: ServicesService;
  let businessRepository: Repository<Business>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(BundledService),
          useValue: mockBundledServiceRepository,
        },
        {
          provide: getRepositoryToken(ConfigurableAddon),
          useValue: mockConfigurableAddonRepository,
        },
        {
          provide: ActivitiesService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CapabilityService,
          useValue: {
            checkPermission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createServiceDto: CreateServiceDto = {
      name: 'Test Service',
      businessId: 'test-business-id',
      category: 'Wellness',
      pricingModel: PricingModel.FIXED,
      fixedPrice: 100,
      enableGuestPricing: false,
      isQuoteModel: false,
    };
    const userId = 'test-user-id';
    const business = {
      id: 'test-business-id',
      user: { id: userId },
      listingType: [ListingType.SERVICE],
    };

    it('should create a service', async () => {
      mockServiceRepository.count.mockResolvedValue(0);
      mockBusinessRepository.findOne.mockResolvedValue(business);
      mockServiceRepository.create.mockReturnValue(createServiceDto);
      mockServiceRepository.save.mockResolvedValue(createServiceDto);

      const result = await service.create(createServiceDto, userId);
      expect(result).toEqual(createServiceDto);
    });

    it('should create a service with all new fields', async () => {
      const fullServiceDto: CreateServiceDto = {
        ...createServiceDto,
        subcategory: 'Massage',
        targetAudience: ['Adults'],
        tags: ['relaxing'],
        deliveryConfig: {
          mode: DeliveryMode.ONSITE,
          cities: ['London'],
          regions: ['Greater London'],
          travelFee: 10,
        },
        pricingRules: {
          weekendMultiplier: 1.2,
        },
        availability: {
          schedule: [
            {
              day: 'monday',
              enabled: true,
              startTime: '09:00',
              endTime: '17:00',
            },
          ],
          slotDuration: 60,
          bufferTime: 15,
          maxBookingsPerSlot: 1,
        },
        variants: [
          { name: '60 min', type: VariantType.TIME, price: 80, duration: 60 },
        ],
        enableTieredPackages: true,
        tiers: [{ name: 'Basic', price: 50, features: ['Feature 1'] }],
        requireApproval: true,
        bookingRequirements: {
          requireAddress: true,
          requirePhone: true,
          requirePhotos: false,
          requireProblemDescription: true,
        },
      };

      mockServiceRepository.count.mockResolvedValue(0);
      mockBusinessRepository.findOne.mockResolvedValue(business);
      mockServiceRepository.create.mockReturnValue(fullServiceDto);
      mockServiceRepository.save.mockResolvedValue(fullServiceDto);

      const result = await service.create(fullServiceDto, userId);
      expect(result).toEqual(fullServiceDto);
      expect(mockServiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Wellness',
          subcategory: 'Massage',
          deliveryConfig: expect.any(Object),
          variants: expect.any(Array),
        }),
      );
    });

    it('should create a service with media urls', async () => {
      const createServiceDtoWithMedia = {
        ...createServiceDto,
        media: ['http://example.com/image.jpg'],
      };
      mockServiceRepository.count.mockResolvedValue(0);
      mockBusinessRepository.findOne.mockResolvedValue(business);
      mockServiceRepository.create.mockReturnValue(createServiceDtoWithMedia);
      mockServiceRepository.save.mockResolvedValue(createServiceDtoWithMedia);

      await service.create(createServiceDtoWithMedia, userId);
      expect(mockServiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          media: ['http://example.com/image.jpg'],
        }),
      );
    });

    it('should add SERVICE to listingType if not present', async () => {
      const productBusiness = {
        ...business,
        listingType: [ListingType.PRODUCT],
      };
      mockServiceRepository.count.mockResolvedValue(0);
      mockBusinessRepository.findOne.mockResolvedValue(productBusiness);
      mockServiceRepository.create.mockReturnValue(createServiceDto);
      mockServiceRepository.save.mockResolvedValue(createServiceDto);
      mockBusinessRepository.save.mockResolvedValue(productBusiness);

      await service.create(createServiceDto, userId);
      expect(mockBusinessRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listingType: expect.arrayContaining([
            ListingType.PRODUCT,
            ListingType.SERVICE,
          ]),
        }),
      );
    });

    it('should throw ForbiddenException if user does not own business', async () => {
      const otherUserBusiness = {
        ...business,
        user: { id: 'other-user-id' },
      };
      mockServiceRepository.count.mockResolvedValue(0);
      mockBusinessRepository.findOne.mockResolvedValue(otherUserBusiness);

      await expect(service.create(createServiceDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if business not found', async () => {
      mockServiceRepository.count.mockResolvedValue(0);
      mockBusinessRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createServiceDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if service with same name already exists', async () => {
      mockServiceRepository.count.mockResolvedValue(0);
      mockBusinessRepository.findOne.mockResolvedValue(business);
      mockServiceRepository.findOne.mockResolvedValue(createServiceDto);

      await expect(service.create(createServiceDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateServiceDto = { name: 'New Name' };
    const userId = 'test-user-id';
    const serviceId = 'test-service-id';
    const serviceInstance = {
      id: serviceId,
      businessId: 'test-business-id',
      business: {
        id: 'test-business-id',
        user: { id: userId },
      },
    };

    it('should update a service', async () => {
      mockServiceRepository.findOne.mockResolvedValue(serviceInstance);
      mockServiceRepository.update.mockResolvedValue(undefined);
      mockServiceRepository.findOne.mockResolvedValue({
        ...serviceInstance,
        ...updateServiceDto,
      });

      const result = await service.update(serviceId, updateServiceDto, userId);
      expect(result.name).toEqual('New Name');
    });
  });
});
