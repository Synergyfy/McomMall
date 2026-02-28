import { Test, TestingModule } from '@nestjs/testing';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SearchBusinessDto } from './dto/listings.dto';
import { ServicesService } from '../services/services.service';
import { CapabilityService } from '../capability/capability.service';
import { Reflector } from '@nestjs/core';
import { CapabilitiesGuard } from '../capability/guards/capabilities.guard';

const mockServicesService = {
  findAllForBusiness: jest.fn(),
};

const mockCapabilityService = {
  checkPermission: jest.fn(),
};

describe('ListingsController', () => {
  let controller: ListingsController;
  let listingsService: ListingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [
        {
          provide: ListingsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            search: jest.fn(),
            findRecent: jest.fn(),
            findAllForUser: jest.fn(),
            findOnePublic: jest.fn(),
          },
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
        {
          provide: CapabilityService,
          useValue: mockCapabilityService,
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CapabilitiesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ListingsController>(ListingsController);
    listingsService = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call listingsService.search with the correct query', () => {
      const searchQuery: SearchBusinessDto = { queryText: 'test query' };
      controller.search(searchQuery);
      expect(listingsService.search).toHaveBeenCalledWith(searchQuery);
    });
  });

  describe('findAllServicesForBusiness', () => {
    it('should call servicesService.findAllForBusiness with the correct businessId', () => {
      const businessId = 'test-business-id';
      const paginationDto = { page: 1, limit: 10 };
      controller.findAllServicesForBusiness(businessId, paginationDto);
      expect(mockServicesService.findAllForBusiness).toHaveBeenCalledWith(
        businessId,
        paginationDto,
      );
    });
  });
});
