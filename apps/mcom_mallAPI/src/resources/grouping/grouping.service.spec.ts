import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { DigitalValueService } from '../digital-value/digital-value.service';
import { CapabilityService } from '../capability/capability.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GroupingService } from './grouping.service';
import { UserRole } from '../../common/role.enum';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { User } from '../users/entities/user.entity';
import { MembershipTier } from '../membership/membership-tier.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupStatus } from './group-status.enum';
import { GroupMemberStatus } from './group-member-status.enum';
import { GroupTransaction } from './entities/group-transaction.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { InitiateContributionPaymentDto } from './dto/initiate-contribution-payment.dto';
import { VerifyContributionPaymentDto } from './dto/verify-contribution-payment.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { PlanType } from '../membership/dto/initiate-membership-payment.dto';

describe('GroupingService', () => {
  let service: GroupingService;
  let groupMemberRepository: Repository<GroupMember>;
  let groupRepository: Repository<Group>;

  const mockManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
  };

  const mockPaymentProviderService = {
    createStripePaymentIntent: jest.fn(),
    createPaypalOrder: jest.fn(),
    verifyStripePaymentIntent: jest.fn(),
    captureAndVerifyPaypalOrder: jest.fn(),
  };

  const baseMockUser = {
    fullName: 'Test User',
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

  const founder = {
    ...baseMockUser,
    id: 'founder-id',
    populateName: jest.fn(),
  };

  const groupDto: CreateGroupDto = {
    name: 'Test Group',
    localArea: 'Test Area',
    size: 6,
    recruitmentDeadline: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupingService,
        {
          provide: getRepositoryToken(Group),
          useValue: {
            create: jest.fn((data) => data),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GroupMember),
          useValue: {
            create: jest.fn((data) => data),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(GroupTransaction),
          useValue: {
            create: jest.fn((data) => data),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        {
          provide: CentralIntegrationService,
          useValue: {
            processCashback: jest.fn(),
            validateDigitalValue: jest.fn(),
          },
        },
        {
          provide: DigitalValueService,
          useValue: { createVoucher: jest.fn() },
        },
        {
          provide: CapabilityService,
          useValue: { checkPermission: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<GroupingService>(GroupingService);
    groupMemberRepository = module.get<Repository<GroupMember>>(
      getRepositoryToken(GroupMember),
    );
    groupRepository = module.get<Repository<Group>>(getRepositoryToken(Group));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a group and add the founder as a member with PENDING_PAYMENT status', async () => {
      mockManager.findOne.mockResolvedValue(founder);
      mockManager.create.mockImplementation((entity, data) => data);
      mockManager.save.mockImplementation((entity, data) =>
        Promise.resolve(data ?? entity),
      );

      const result = await service.create(groupDto, founder);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.findOne).toHaveBeenCalledWith(User, {
        where: { id: founder.id },
        relations: ['membership'],
      });
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Group' }),
      );
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ balance: 0 }),
      );
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: GroupMemberStatus.PENDING_PAYMENT,
          user: founder,
        }),
      );
      expect(result.name).toBe('Test Group');
      expect(result.members).toHaveLength(1);
      expect(result.members[0].status).toBe(GroupMemberStatus.PENDING_PAYMENT);
    });
  });

  describe('joinGroup', () => {
    it('should allow a user to join a group with PENDING_PAYMENT status', async () => {
      const groupId = 'group-id';
      const group = { id: groupId, status: GroupStatus.RECRUITING, size: 6 };
      mockManager.findOne.mockResolvedValue(group);
      mockManager.count.mockResolvedValue(1);
      mockManager.exists.mockResolvedValue(false);
      mockManager.create.mockImplementation((_, data) => data);
      mockManager.save.mockImplementation((entity, data) =>
        Promise.resolve(data),
      );

      const result = await service.joinGroup(groupId, baseMockUser);

      expect(result.status).toBe(GroupMemberStatus.PENDING_PAYMENT);
    });
  });

  describe('findAll', () => {
    it('should return groups with correct isOwner and memberCount flags', async () => {
      const user = { id: 'user-id' } as User;
      const foundedGroup = { id: 'group-1', founderId: user.id } as Group;
      const memberGroup = { id: 'group-2', founderId: 'other-user' } as Group;
      const bothGroup = { id: 'group-3', founderId: user.id } as Group;

      const memberships = [
        { group: memberGroup },
        { group: bothGroup },
      ] as GroupMember[];
      const founded = [foundedGroup, bothGroup];
      const memberCounts = [
        { groupId: 'group-1', count: '1' },
        { groupId: 'group-2', count: '5' },
        { groupId: 'group-3', count: '10' },
      ];

      jest.spyOn(groupMemberRepository, 'find').mockResolvedValue(memberships);
      jest.spyOn(groupRepository, 'find').mockResolvedValue(founded);
      jest.spyOn(groupMemberRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(memberCounts),
      } as any);

      const result = await service.findAll(user);

      expect(result).toHaveLength(3);
      const group1 = result.find((g) => g.id === 'group-1');
      expect(group1.isOwner).toBe(true);
      expect(group1.memberCount).toBe(1);

      const group2 = result.find((g) => g.id === 'group-2');
      expect(group2.isOwner).toBe(false);
      expect(group2.memberCount).toBe(5);

      const group3 = result.find((g) => g.id === 'group-3');
      expect(group3.isOwner).toBe(true);
      expect(group3.memberCount).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a group DTO with its relations', async () => {
      const group = {
        id: 'group-id',
        founderId: founder.id,
        members: [{}, {}],
      } as Group;
      jest.spyOn(groupRepository, 'findOne').mockResolvedValue(group);

      const result = await service.findOne('group-id', founder);

      expect(result.isOwner).toBe(true);
      expect(result.memberCount).toBe(2);
      expect(groupRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'group-id' },
        relations: ['members', 'wallet', 'members.user'],
      });
    });

    it('should throw NotFoundException if group not found', async () => {
      jest.spyOn(groupRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('group-id', founder)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('initiateContributionPayment', () => {
    const groupId = 'group-id';
    const initiateDto: InitiateContributionPaymentDto = {
      paymentProvider: PaymentMethod.STRIPE,
    };

    it('should initiate a Stripe payment', async () => {
      jest.spyOn(groupMemberRepository, 'findOne').mockResolvedValue({
        status: GroupMemberStatus.PENDING_PAYMENT,
      } as GroupMember);
      mockPaymentProviderService.createStripePaymentIntent.mockResolvedValue({
        client_secret: 'stripe-secret',
      });

      const result = await service.initiateContributionPayment(
        groupId,
        baseMockUser,
        initiateDto,
      );

      expect(result.provider).toBe(PaymentMethod.STRIPE);
      expect(result.clientSecret).toBe('stripe-secret');
    });
  });

  describe('verifyContributionPayment', () => {
    const groupId = 'group-id';
    const verifyDto: VerifyContributionPaymentDto = {
      paymentProvider: PaymentMethod.STRIPE,
      transactionId: 'pi_123',
    };

    it('should verify a payment and activate the member', async () => {
      const groupMember = {
        status: GroupMemberStatus.PENDING_PAYMENT,
      } as GroupMember;
      const groupWallet = { balance: 2750 };
      jest
        .spyOn(groupMemberRepository, 'findOne')
        .mockResolvedValue(groupMember);
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({
        ok: true,
      });
      mockManager.findOne.mockResolvedValue(groupWallet);
      mockManager.save.mockImplementation((_, data) => Promise.resolve(data));
      mockManager.create.mockImplementation((_, data) => data);

      const result = await service.verifyContributionPayment(
        groupId,
        baseMockUser,
        verifyDto,
      );

      expect(result.status).toBe(GroupMemberStatus.ACTIVE);
      expect(groupWallet.balance).toBe(3000);
      expect(mockManager.update).toHaveBeenCalledWith(
        Group,
        { id: groupId },
        { status: GroupStatus.ACTIVE },
      );
    });
  });

  describe('delete', () => {
    const groupId = 'group-id';

    it('should allow a founder to delete their group', async () => {
      const group = { id: groupId, founderId: founder.id } as Group;
      jest.spyOn(groupRepository, 'findOne').mockResolvedValue(group);
      jest.spyOn(groupRepository, 'softDelete').mockResolvedValue(undefined);

      await service.delete(groupId, founder);

      expect(groupRepository.softDelete).toHaveBeenCalledWith(groupId);
    });

    it('should throw ForbiddenException if a non-founder tries to delete a group', async () => {
      const group = { id: groupId, founderId: 'other-user-id' } as Group;
      jest.spyOn(groupRepository, 'findOne').mockResolvedValue(group);

      await expect(service.delete(groupId, founder)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if the group does not exist', async () => {
      jest.spyOn(groupRepository, 'findOne').mockResolvedValue(null);

      await expect(service.delete(groupId, founder)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
