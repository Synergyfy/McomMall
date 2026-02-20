import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { User } from '../users/entities/user.entity';
import { MembershipTier } from './membership-tier.enum';
import { UserRole } from '../../common/role.enum';
import { InitiateMembershipPaymentDto } from './dto/initiate-membership-payment.dto';
import { VerifyMembershipPaymentDto } from './dto/verify-membership-payment.dto';
import { PaymentMethod } from '../order/entities/order-payment.entity';
import { Membership } from './entities/membership.entity';

describe('MembershipController', () => {
  let controller: MembershipController;
  let service: MembershipService;

  const mockUser: User = {
    id: 'user-id',
    role: UserRole.OWNER,
  } as User;

  const mockMembershipService = {
    initiateMembershipPayment: jest.fn(),
    verifyAndCreateMembership: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipController],
      providers: [
        {
          provide: MembershipService,
          useValue: mockMembershipService,
        },
      ],
    }).compile();

    controller = module.get<MembershipController>(MembershipController);
    service = module.get<MembershipService>(MembershipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the membership for the current user', async () => {
      const membership = { id: 'mem-id' } as Membership;
      mockMembershipService.findOne.mockResolvedValue(membership);

      const result = await controller.findOne(mockUser);

      expect(mockMembershipService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(membership);
    });
  });

  describe('initiatePayment', () => {
    it('should call the service to initiate a payment', async () => {
      const initiateDto: InitiateMembershipPaymentDto = {
        tier: MembershipTier.PROFESSIONAL,
        paymentProvider: PaymentMethod.STRIPE,
      };
      const expectedResponse = {
        clientSecret: 'stripe-secret',
        provider: PaymentMethod.STRIPE,
      };

      mockMembershipService.initiateMembershipPayment.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.initiatePayment(initiateDto, mockUser);

      expect(mockMembershipService.initiateMembershipPayment).toHaveBeenCalledWith(
        initiateDto,
        mockUser,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('verifyPayment', () => {
    it('should call the service to verify a payment and create a membership', async () => {
      const verifyDto: VerifyMembershipPaymentDto = {
        paymentProvider: PaymentMethod.STRIPE,
        transactionId: 'pi-123',
        purchaseDetails: {
          tier: MembershipTier.PROFESSIONAL,
        },
      };
      const createdMembership = { id: 'mem-id-1' } as Membership;

      mockMembershipService.verifyAndCreateMembership.mockResolvedValue(
        createdMembership,
      );

      const result = await controller.verifyPayment(verifyDto, mockUser);

      expect(mockMembershipService.verifyAndCreateMembership).toHaveBeenCalledWith(
        verifyDto,
        mockUser,
      );
      expect(result).toEqual(createdMembership);
    });
  });
});