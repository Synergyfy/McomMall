import { Test, TestingModule } from '@nestjs/testing';
import { PartnershipController } from './partnership.controller';
import { PartnershipService } from './partnership.service';
import { User } from '../users/entities/user.entity';

const mockPartnershipService = {
  createUserPartnershipRequest: jest.fn(),
  respondToUserPartnershipRequest: jest.fn(),
  getReceivedUserRequests: jest.fn(),
  getSentUserRequests: jest.fn(),
  getMyPartners: jest.fn(),
  createItemPartnershipRequest: jest.fn(),
  respondToItemPartnershipRequest: jest.fn(),
  getPartnerItems: jest.fn(),
  getAnalytics: jest.fn(),
};

describe('PartnershipController', () => {
  let controller: PartnershipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnershipController],
      providers: [
        {
          provide: PartnershipService,
          useValue: mockPartnershipService,
        },
      ],
    }).compile();

    controller = module.get<PartnershipController>(PartnershipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUserPartnershipRequest', () => {
    it('should call service.createUserPartnershipRequest', async () => {
      const user = { id: 'user1' } as User;
      const dto = { targetUserId: 'user2' };
      await controller.createUserPartnershipRequest(dto, user);
      expect(
        mockPartnershipService.createUserPartnershipRequest,
      ).toHaveBeenCalledWith(dto, user);
    });
  });

  describe('getMyPartners', () => {
    it('should call service.getMyPartners', async () => {
      const user = { id: 'user1' } as User;
      await controller.getMyPartners(user);
      expect(mockPartnershipService.getMyPartners).toHaveBeenCalledWith(user);
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics', async () => {
      const user = { id: 'user1' } as User;
      mockPartnershipService.getAnalytics.mockResolvedValue({
        totalPartners: 5,
      });
      const result = await controller.getAnalytics(user);
      expect(result.totalPartners).toBe(5);
    });
  });
});
