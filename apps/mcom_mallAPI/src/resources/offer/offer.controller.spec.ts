import { Test, TestingModule } from '@nestjs/testing';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { RewardCouponType, OfferScope } from './offer.enum';
import { UpdateOfferDto } from './dto/update-offer.dto';

const mockOfferService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser = {
  id: 'user-uuid',
  businessId: 'biz-uuid',
};

describe('OfferController', () => {
  let controller: OfferController;
  let service: OfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        {
          provide: OfferService,
          useValue: mockOfferService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OfferController>(OfferController);
    service = module.get<OfferService>(OfferService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call offerService.create with correct params', () => {
      const createOfferDto: CreateOfferDto = {
        name: 'Test Offer',
        points: 100,
        rewardCouponType: RewardCouponType.FIXED_CART_DISCOUNT,
        offerScope: OfferScope.ALL_LISTINGS,
        businessIds: ['biz-uuid'],
      };
      controller.create(mockUser as any, createOfferDto);
      expect(service.create).toHaveBeenCalledWith(
        mockUser,
        createOfferDto,
      );
    });
  });

  describe('findAll', () => {
    it('should call offerService.findAll with correct params', () => {
      controller.findAll(mockUser as any);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should call offerService.findOne with correct params', () => {
      const id = 'offer-uuid';
      controller.findOne(mockUser as any, id);
      expect(service.findOne).toHaveBeenCalledWith(
        mockUser.id,
        id,
      );
    });
  });

  describe('update', () => {
    it('should call offerService.update with correct params', () => {
      const id = 'offer-uuid';
      const updateOfferDto: UpdateOfferDto = { name: 'Updated' };
      controller.update(mockUser as any, id, updateOfferDto);
      expect(service.update).toHaveBeenCalledWith(
        id,
        updateOfferDto,
        mockUser,
      );
    });
  });

  describe('remove', () => {
    it('should call offerService.remove with correct params', () => {
      const id = 'offer-uuid';
      controller.remove(mockUser as any, id);
      expect(service.remove).toHaveBeenCalledWith(
        mockUser.id,
        id,
      );
    });
  });
});
