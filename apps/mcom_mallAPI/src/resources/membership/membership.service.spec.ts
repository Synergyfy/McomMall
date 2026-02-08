import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MembershipService } from './membership.service';
import { Membership } from './entities/membership.entity';
import { User } from '../users/entities/user.entity';
import { MembershipTier } from './membership-tier.enum';
import { UserRole } from '../../common/role.enum';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { MembershipPayment } from './entities/membership-payment.entity';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { InitiateMembershipPaymentDto } from './dto/initiate-membership-payment.dto';
import { VerifyMembershipPaymentDto } from './dto/verify-membership-payment.dto';

describe('MembershipService', () => {
  let service: MembershipService;
  let membershipRepository: Repository<Membership>;
  let userRepository: Repository<User>;
  let paymentRepository: Repository<MembershipPayment>;
  let paymentProviderService: PaymentProviderService;
  let dataSource: DataSource;

  const mockMembershipRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentProviderService = {
    createStripePaymentIntent: jest.fn(),
    createPaypalOrder: jest.fn(),
    verifyStripePaymentIntent: jest.fn(),
    captureAndVerifyPaypalOrder: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (callback) => {
      const mockEntityManager = {
        getRepository: (entity) => {
          if (entity === Membership) return mockMembershipRepository;
          if (entity === User) return mockUserRepository;
          if (entity === MembershipPayment) return mockPaymentRepository;
        },
      };
      return callback(mockEntityManager);
    }),
  };

  const user = {
    id: 'user-id-1',
    role: UserRole.OWNER,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: getRepositoryToken(Membership),
          useValue: mockMembershipRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(MembershipPayment),
          useValue: mockPaymentRepository,
        },
        {
          provide: PaymentProviderService,
          useValue: mockPaymentProviderService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
    membershipRepository = module.get<Repository<Membership>>(
      getRepositoryToken(Membership),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    paymentRepository = module.get<Repository<MembershipPayment>>(
      getRepositoryToken(MembershipPayment),
    );
    paymentProviderService = module.get<PaymentProviderService>(
      PaymentProviderService,
    );
    dataSource = module.get<DataSource>(DataSource);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiateMembershipPayment', () => {
    const initiateDto: InitiateMembershipPaymentDto = {
      tier: MembershipTier.PROFESSIONAL,
      paymentProvider: PaymentMethod.STRIPE,
    };

    it('should throw ConflictException if user already has an active membership', async () => {
      mockMembershipRepository.findOne.mockResolvedValue({ isActive: true });
      await expect(
        service.initiateMembershipPayment(initiateDto, user),
      ).rejects.toThrow(ConflictException);
    });

    it('should initiate a Stripe payment', async () => {
      mockMembershipRepository.findOne.mockResolvedValue(null);
      mockPaymentProviderService.createStripePaymentIntent.mockResolvedValue({
        client_secret: 'stripe-secret',
      });

      const result = await service.initiateMembershipPayment(initiateDto, user);

      expect(result).toEqual({
        clientSecret: 'stripe-secret',
        provider: PaymentMethod.STRIPE,
      });
      expect(
        mockPaymentProviderService.createStripePaymentIntent,
      ).toHaveBeenCalledWith(100, 'GBP');
    });

    it('should initiate a PayPal payment', async () => {
      const paypalDto: InitiateMembershipPaymentDto = {
        ...initiateDto,
        paymentProvider: PaymentMethod.PAYPAL,
      };
      mockMembershipRepository.findOne.mockResolvedValue(null);
      mockPaymentProviderService.createPaypalOrder.mockResolvedValue({
        id: 'paypal-order-id',
      });

      const result = await service.initiateMembershipPayment(paypalDto, user);

      expect(result).toEqual({
        orderId: 'paypal-order-id',
        provider: PaymentMethod.PAYPAL,
      });
      expect(
        mockPaymentProviderService.createPaypalOrder,
      ).toHaveBeenCalledWith(100, 'GBP');
    });
  });

  describe('verifyAndCreateMembership', () => {
    const verifyDto: VerifyMembershipPaymentDto = {
      paymentProvider: PaymentMethod.STRIPE,
      transactionId: 'stripe-pi-123',
      purchaseDetails: {
        tier: MembershipTier.PROFESSIONAL,
      },
    };

    it('should throw ConflictException if user already has an active membership', async () => {
      mockMembershipRepository.findOne.mockResolvedValue({ isActive: true });
      await expect(
        service.verifyAndCreateMembership(verifyDto, user),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if payment verification fails', async () => {
      mockMembershipRepository.findOne.mockResolvedValue(null);
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({
        ok: false,
        reason: 'failed',
      });

      await expect(
        service.verifyAndCreateMembership(verifyDto, user),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a membership on successful Stripe payment verification', async () => {
      const newMembership = { id: 'mem-id-1' };
      const newPayment = { id: 'pay-id-1' };

      mockMembershipRepository.findOne.mockResolvedValue(null);
      mockPaymentProviderService.verifyStripePaymentIntent.mockResolvedValue({
        ok: true,
      });
      mockPaymentRepository.create.mockReturnValue(newPayment);
      mockPaymentRepository.save.mockResolvedValue(newPayment);
      mockMembershipRepository.create.mockReturnValue(newMembership);
      mockMembershipRepository.save.mockResolvedValue(newMembership);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.verifyAndCreateMembership(verifyDto, user);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(newPayment);
      expect(mockMembershipRepository.save).toHaveBeenCalledWith(newMembership);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...user,
        membership: newMembership,
      });
      expect(result).toEqual(newMembership);
    });

    it('should create a membership on successful PayPal payment verification', async () => {
      const paypalVerifyDto: VerifyMembershipPaymentDto = {
        ...verifyDto,
        paymentProvider: PaymentMethod.PAYPAL,
        transactionId: 'paypal-order-123',
      };
      const newMembership = { id: 'mem-id-1' };
      const newPayment = { id: 'pay-id-1' };

      mockMembershipRepository.findOne.mockResolvedValue(null);
      mockPaymentProviderService.captureAndVerifyPaypalOrder.mockResolvedValue({
        ok: true,
      });
      mockPaymentRepository.create.mockReturnValue(newPayment);
      mockPaymentRepository.save.mockResolvedValue(newPayment);
      mockMembershipRepository.create.mockReturnValue(newMembership);
      mockMembershipRepository.save.mockResolvedValue(newMembership);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.verifyAndCreateMembership(paypalVerifyDto, user);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockPaymentProviderService.captureAndVerifyPaypalOrder).toHaveBeenCalledWith(
        'paypal-order-123',
        100,
        'GBP',
      );
      expect(result).toEqual(newMembership);
    });
  });

  describe('findOne', () => {
    it('should return a membership if found', async () => {
      const membership = { id: 'mem-id-1' };
      mockMembershipRepository.findOne.mockResolvedValue(membership);
      const result = await service.findOne(user.id);
      expect(result).toEqual(membership);
    });

    it('should throw NotFoundException if membership not found', async () => {
      mockMembershipRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(user.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMembershipPrice', () => {
    it('should return the correct price for a tier', () => {
      expect(service.getMembershipPrice(MembershipTier.BASIC)).toBe(10);
      expect(service.getMembershipPrice(MembershipTier.EXTENDED)).toBe(50);
      expect(service.getMembershipPrice(MembershipTier.PROFESSIONAL)).toBe(100);
    });

    it('should throw NotFoundException for an invalid tier', () => {
      expect(() => service.getMembershipPrice('invalid-tier' as any)).toThrow(
        NotFoundException,
      );
    });
  });
});