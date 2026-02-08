import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PartnershipService } from './partnership.service';
import { Partnership } from './entities/partnership.entity';
import { PartnershipRequest } from './entities/partnership-request.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PartnershipRequestStatus } from './partnership.enum';
import { RespondToPartnershipRequestDto } from './dto/respond-to-partnership-request.dto';

const mockUser = new User();
mockUser.id = 'user1';

const mockServiceOwner = new User();
mockServiceOwner.id = 'user2';

const mockBusiness = new Business();
mockBusiness.user = mockUser;

const mockServiceBusiness = new Business();
mockServiceBusiness.user = mockServiceOwner;

const mockProduct = new Product();
mockProduct.id = 'product1';
mockProduct.business = mockBusiness;

const mockService = new Service();
mockService.id = 'service1';
mockService.business = mockServiceBusiness;

const mockPartnershipRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockPartnershipRequestRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockProductRepository = {
  findOne: jest.fn(),
};

const mockServiceRepository = {
  findOne: jest.fn(),
};

describe('PartnershipService', () => {
  let service: PartnershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnershipService,
        {
          provide: getRepositoryToken(Partnership),
          useValue: mockPartnershipRepository,
        },
        {
          provide: getRepositoryToken(PartnershipRequest),
          useValue: mockPartnershipRequestRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Service),
          useValue: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<PartnershipService>(PartnershipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPartnershipRequest', () => {
    it('should create a partnership request', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockServiceRepository.findOne.mockResolvedValue(mockService);
      mockPartnershipRequestRepository.create.mockImplementation((req) => req);
      mockPartnershipRequestRepository.save.mockResolvedValue({} as any);

      const dto = { productId: 'product1', serviceId: 'service1' };
      await service.createPartnershipRequest(dto, mockUser);

      expect(mockPartnershipRequestRepository.create).toHaveBeenCalledWith({
        product: mockProduct,
        service: mockService,
        requestingUser: mockUser,
        serviceOwner: mockServiceOwner,
      });
      expect(mockPartnershipRequestRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
      const dto = { productId: 'product1', serviceId: 'service1' };
      await expect(service.createPartnershipRequest(dto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user does not own the product', async () => {
      const anotherUser = new User();
      anotherUser.id = 'user3';
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      const dto = { productId: 'product1', serviceId: 'service1' };
      await expect(service.createPartnershipRequest(dto, anotherUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('respondToPartnershipRequest', () => {
    it('should accept a partnership request and create a partnership', async () => {
      const request = new PartnershipRequest();
      request.id = 'request1';
      request.service = mockService;
      request.product = mockProduct;

      mockPartnershipRequestRepository.findOne.mockResolvedValue(request);
      mockPartnershipRequestRepository.save.mockResolvedValue(request);
      mockPartnershipRepository.create.mockImplementation((p) => p);
      mockPartnershipRepository.save.mockResolvedValue({} as any);

      const dto: RespondToPartnershipRequestDto = { status: PartnershipRequestStatus.ACCEPTED };
      await service.respondToPartnershipRequest(request.id, dto, mockServiceOwner);

      expect(mockPartnershipRepository.create).toHaveBeenCalledWith({
        product: mockProduct,
        service: mockService,
        partnershipRequest: request,
      });
      expect(mockPartnershipRepository.save).toHaveBeenCalled();
      expect(request.status).toEqual(PartnershipRequestStatus.ACCEPTED);
    });

    it('should decline a partnership request', async () => {
      const request = new PartnershipRequest();
      request.id = 'request1';
      request.service = mockService;

      mockPartnershipRequestRepository.findOne.mockResolvedValue(request);
      mockPartnershipRequestRepository.save.mockResolvedValue(request);

      const dto: RespondToPartnershipRequestDto = { status: PartnershipRequestStatus.DECLINED };
      await service.respondToPartnershipRequest(request.id, dto, mockServiceOwner);

      expect(mockPartnershipRepository.save).not.toHaveBeenCalled();
      expect(request.status).toEqual(PartnershipRequestStatus.DECLINED);
      expect(mockPartnershipRequestRepository.save).toHaveBeenCalledWith(request);
    });
  });
});