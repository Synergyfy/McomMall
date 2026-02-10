import { Test, TestingModule } from '@nestjs/testing';
import { PartnershipService } from './partnership.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Partnership } from './entities/partnership.entity';
import { UserPartnership } from './entities/user-partnership.entity';
import { UserPartnershipRequest } from './entities/user-partnership-request.entity';
import { ItemPartnershipRequest } from './entities/item-partnership-request.entity';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PartnershipStatus } from './partnership-status.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PartnershipService', () => {
  let service: PartnershipService;
  let emailService: EmailService;
  let productRepository: any;
  let userPartnershipRepository: any;
  let userPartnershipRequestRepository: any;
  let itemPartnershipRequestRepository: any;
  let userRepository: any;

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  } as User;

  const mockTargetUser = {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
  } as User;

  const mockProduct = {
    id: 'prod-1',
    title: 'Test Product',
    business: { user: mockTargetUser },
  } as Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnershipService,
        {
          provide: getRepositoryToken(Partnership),
          useValue: { save: jest.fn(), create: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserPartnership),
          useValue: { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), count: jest.fn() },
        },
        {
          provide: getRepositoryToken(UserPartnershipRequest),
          useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn(), count: jest.fn() },
        },
        {
          provide: getRepositoryToken(ItemPartnershipRequest),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn(), count: jest.fn() },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn(), createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([mockProduct]),
          })) },
        },
        {
          provide: getRepositoryToken(Service),
          useValue: { findOne: jest.fn(), createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          })) },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: { searchOwners: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: { sendPartnershipRequestEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PartnershipService>(PartnershipService);
    emailService = module.get<EmailService>(EmailService);
    productRepository = module.get(getRepositoryToken(Product));
    userPartnershipRepository = module.get(getRepositoryToken(UserPartnership));
    userPartnershipRequestRepository = module.get(getRepositoryToken(UserPartnershipRequest));
    itemPartnershipRequestRepository = module.get(getRepositoryToken(ItemPartnershipRequest));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCompositePartnershipRequest', () => {
    it('should create user request if not partners, and item request', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);
      userRepository.findOne.mockResolvedValue(mockTargetUser);
      userPartnershipRepository.findOne.mockResolvedValue(null); // No existing partnership
      userPartnershipRequestRepository.findOne.mockResolvedValue(null); // No pending request
      
      const mockUserRequest = { id: 'req-1', status: PartnershipStatus.PENDING };
      userPartnershipRequestRepository.create.mockReturnValue(mockUserRequest);
      userPartnershipRequestRepository.save.mockResolvedValue(mockUserRequest);

      const mockItemRequest = { id: 'item-req-1', status: PartnershipStatus.PENDING };
      itemPartnershipRequestRepository.create.mockReturnValue(mockItemRequest);
      itemPartnershipRequestRepository.save.mockResolvedValue(mockItemRequest);

      const result = await service.createCompositePartnershipRequest(
        { plusProductId: 'prod-1', baseProductId: 'my-prod-1' },
        mockUser
      );

      expect(userPartnershipRequestRepository.create).toHaveBeenCalled();
      expect(itemPartnershipRequestRepository.create).toHaveBeenCalled();
      expect(emailService.sendPartnershipRequestEmail).toHaveBeenCalledTimes(2); // One for user req, one for item req
      expect(result.userRequest).toBeDefined();
      expect(result.itemRequest).toBeDefined();
    });

    it('should only create item request if partnership exists', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);
      userRepository.findOne.mockResolvedValue(mockTargetUser);
      userPartnershipRepository.findOne.mockResolvedValue({ id: 'partnership-1', isActive: true }); // Active partnership

      const mockItemRequest = { id: 'item-req-1', status: PartnershipStatus.PENDING };
      itemPartnershipRequestRepository.create.mockReturnValue(mockItemRequest);
      itemPartnershipRequestRepository.save.mockResolvedValue(mockItemRequest);

      const result = await service.createCompositePartnershipRequest(
        { plusProductId: 'prod-1', baseProductId: 'my-prod-1' },
        mockUser
      );

      expect(userPartnershipRequestRepository.create).not.toHaveBeenCalled();
      expect(itemPartnershipRequestRepository.create).toHaveBeenCalled();
      expect(emailService.sendPartnershipRequestEmail).toHaveBeenCalledTimes(1); // Only item req
      expect(result.userRequest).toBeNull();
      expect(result.itemRequest).toBeDefined();
    });

    it('should throw error if partnering with self', async () => {
        productRepository.findOne.mockResolvedValue({ ...mockProduct, business: { user: mockUser } }); // Owned by self
        
        await expect(service.createCompositePartnershipRequest(
            { plusProductId: 'prod-1' },
            mockUser
        )).rejects.toThrow(BadRequestException);
    });
  });

  describe('searchPartnerItems', () => {
      it('should return formatted items', async () => {
          userPartnershipRepository.find.mockResolvedValue([]); // No partners
          
          const result = await service.searchPartnerItems('test', 'user-1');
          
          expect(result).toHaveLength(1); // 1 product mocked
          expect(result[0].type).toBe('product');
          expect(result[0].owner.name).toBe('Jane Doe');
      });

      it('should return empty array for short query', async () => {
          const result = await service.searchPartnerItems('a', 'user-1');
          expect(result).toEqual([]);
      });
  });
});