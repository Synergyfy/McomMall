import { Test, TestingModule } from '@nestjs/testing';
import { GroupingController } from './grouping.controller';
import { GroupingService } from './grouping.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/role.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { InitiateContributionPaymentDto } from './dto/initiate-contribution-payment.dto';
import { VerifyContributionPaymentDto } from './dto/verify-contribution-payment.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { MembershipTier } from '../membership/membership-tier.enum';

import { PlanType } from '../membership/dto/initiate-membership-payment.dto';

describe('GroupingController', () => {
  let controller: GroupingController;

  const mockUser: User = {
    id: 'user-id',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    isActive: true,
    isEmailVerified: true,
    isSuperUser: false,
    shippingAddresses: [],
    lastLogin: new Date(),
    trustScore: 100,
    role: UserRole.OWNER,
    password: 'hashedpassword',
    points: 100,
    created_at: new Date(),
    updated_at: new Date(),
    businesses: [],
    coupons: [],
    purchasedCoupons: [],
    couponProducts: [],
    promotionParticipations: [],
    reviews: [],
    socials: null,
    transactions: [],
    promotions: [],
    purchasedVouchers: [],
    voucherProducts: [],
    vouchers: [],
    offers: [],
    serviceProviderProfile: null,
    couponTransactions: [],
    giftCard: true,
    voucher: true,
    promotion: true,
    membership: {
      id: 'membership-id',
      tierType: MembershipTier.PROFESSIONAL,
      tier: null,
      tierId: null,
      isTrial: false,
      trialDuration: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      planType: PlanType.MONTHLY,
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      user: null,
      created_at: new Date(),
      updated_at: new Date(),
      payment: null,
      deleted_at: null,
    },
    wallet: null,
    deleted_at: null,
    populateName: jest.fn(),
    updateFullName: jest.fn(),
  };
  const mockGroupingService = {
    create: jest.fn(),
    joinGroup: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    initiateContributionPayment: jest.fn(),
    verifyContributionPayment: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupingController],
      providers: [
        {
          provide: GroupingService,
          useValue: mockGroupingService,
        },
      ],
    }).compile();

    controller = module.get<GroupingController>(GroupingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the service to create a group', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        localArea: 'Test Area',
        size: 6,
        recruitmentDeadline: new Date().toISOString(),
      };
      const createdGroup = { id: 'group-id' } as Group;
      mockGroupingService.create.mockResolvedValue(createdGroup);

      const result = await controller.create(createGroupDto, mockUser);

      expect(mockGroupingService.create).toHaveBeenCalledWith(
        createGroupDto,
        mockUser,
      );
      expect(result).toEqual(createdGroup);
    });
  });

  describe('findAll', () => {
    it('should call the service to find all groups for the user', async () => {
      const groups = [{ id: 'group-1' }] as Group[];
      mockGroupingService.findAll.mockResolvedValue(groups);

      const result = await controller.findAll(mockUser);

      expect(mockGroupingService.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(groups);
    });
  });

  describe('findOne', () => {
    it('should call the service to find a group by ID', async () => {
      const groupId = 'group-id';
      const group = { id: groupId } as Group;
      mockGroupingService.findOne.mockResolvedValue(group);

      const result = await controller.findOne(groupId, mockUser);

      expect(mockGroupingService.findOne).toHaveBeenCalledWith(
        groupId,
        mockUser,
      );
      expect(result).toEqual(group);
    });
  });

  describe('joinGroup', () => {
    it('should call the service to join a group', async () => {
      const groupId = 'group-id';
      const groupMember = { id: 'member-id' } as GroupMember;
      mockGroupingService.joinGroup.mockResolvedValue(groupMember);

      const result = await controller.joinGroup(groupId, mockUser);

      expect(mockGroupingService.joinGroup).toHaveBeenCalledWith(
        groupId,
        mockUser,
      );
      expect(result).toEqual(groupMember);
    });
  });

  describe('initiateContributionPayment', () => {
    it('should call the service to initiate a contribution payment', async () => {
      const groupId = 'group-id';
      const initiateDto: InitiateContributionPaymentDto = {
        paymentProvider: PaymentMethod.STRIPE,
      };
      const response = {
        clientSecret: 'test_secret',
        provider: PaymentMethod.STRIPE,
      };
      mockGroupingService.initiateContributionPayment.mockResolvedValue(
        response,
      );

      const result = await controller.initiateContributionPayment(
        groupId,
        mockUser,
        initiateDto,
      );

      expect(
        mockGroupingService.initiateContributionPayment,
      ).toHaveBeenCalledWith(groupId, mockUser, initiateDto);
      expect(result).toEqual(response);
    });
  });

  describe('verifyContributionPayment', () => {
    it('should call the service to verify a contribution payment', async () => {
      const groupId = 'group-id';
      const verifyDto: VerifyContributionPaymentDto = {
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi_123',
      };
      const groupMember = { id: 'member-id', status: 'active' } as GroupMember;
      mockGroupingService.verifyContributionPayment.mockResolvedValue(
        groupMember,
      );

      const result = await controller.verifyContributionPayment(
        groupId,
        mockUser,
        verifyDto,
      );

      expect(
        mockGroupingService.verifyContributionPayment,
      ).toHaveBeenCalledWith(groupId, mockUser, verifyDto);
      expect(result).toEqual(groupMember);
    });
  });

  describe('delete', () => {
    it('should call the service to delete a group', async () => {
      const groupId = 'group-id';
      mockGroupingService.delete.mockResolvedValue(undefined);

      await controller.delete(groupId, mockUser);

      expect(mockGroupingService.delete).toHaveBeenCalledWith(
        groupId,
        mockUser,
      );
    });
  });
});
