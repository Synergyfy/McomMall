import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromotionEngineService } from './promotion-engine.service';
import { Promotion } from './entities/promotion.entity';
import { PromotionParticipant } from './entities/promotion-participant.entity';
import { PromotionActivity } from './entities/promotion-activity.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { PromotionScope, PromotionType } from './promotion.enum';

const mockPromotionRepository = () => ({});
const mockPromotionParticipantRepository = () => ({
  find: jest.fn(),
  save: jest.fn(),
});
const mockPromotionActivityRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});
const mockProductRepository = () => ({
  findOne: jest.fn(),
});

describe('PromotionEngineService', () => {
  let service: PromotionEngineService;
  let promotionParticipantRepository: Repository<PromotionParticipant>;
  let promotionActivityRepository: Repository<PromotionActivity>;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionEngineService,
        {
          provide: getRepositoryToken(Promotion),
          useFactory: mockPromotionRepository,
        },
        {
          provide: getRepositoryToken(PromotionParticipant),
          useFactory: mockPromotionParticipantRepository,
        },
        {
          provide: getRepositoryToken(PromotionActivity),
          useFactory: mockPromotionActivityRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<PromotionEngineService>(PromotionEngineService);
    promotionParticipantRepository = module.get(
      getRepositoryToken(PromotionParticipant),
    );
    promotionActivityRepository = module.get(
      getRepositoryToken(PromotionActivity),
    );
    productRepository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPurchase', () => {
    let user: User;
    let order: Order;
    let promotion: Promotion;
    let participation: PromotionParticipant;

    beforeEach(() => {
      user = { id: 'user-1' } as User;
      order = {
        items: [{ product: { id: 'product-1' } }],
        total: 100,
      } as Order;
      promotion = {
        id: 'promo-1',
        isActive: true,
        beginDate: new Date('2020-01-01'),
        endDate: new Date('2099-01-01'),
        minimumSpend: 50,
        limitPerCustomer: null,
        promotionScope: PromotionScope.ALL_LISTINGS,
        promotionType: PromotionType.BONUS_POINTS,
        bonusPoints: 10,
        businesses: [],
        includedProducts: [],
      } as unknown as Promotion;
      participation = {
        id: 'part-1',
        promotion,
        pointsEarned: 0,
      } as PromotionParticipant;

      (productRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'product-1',
        business: { id: 'business-1', user: { id: 'owner-1' } },
      });
      (promotionParticipantRepository.find as jest.Mock).mockResolvedValue([
        participation,
      ]);
      (promotionActivityRepository.count as jest.Mock).mockResolvedValue(0);
      (promotionParticipantRepository.save as jest.Mock).mockResolvedValue(
        participation,
      );
      (promotionActivityRepository.create as jest.Mock).mockReturnValue(
        {} as PromotionActivity,
      );
      (promotionActivityRepository.save as jest.Mock).mockResolvedValue(
        {} as PromotionActivity,
      );
    });

    it('should award points for an ALL_LISTINGS promotion', async () => {
      await service.processPurchase(user, order);
      expect(promotionParticipantRepository.save).toHaveBeenCalled();
      expect(promotionActivityRepository.create).toHaveBeenCalled();
      expect(promotionActivityRepository.save).toHaveBeenCalled();
    });

    it('should award points for a SPECIFIC_LISTINGS promotion if product business matches', async () => {
      promotion.promotionScope = PromotionScope.SPECIFIC_LISTINGS;
      promotion.businesses = [{ id: 'business-1' }] as any;
      await service.processPurchase(user, order);
      expect(promotionParticipantRepository.save).toHaveBeenCalled();
    });

    it('should not award points for a SPECIFIC_LISTINGS promotion if product business does not match', async () => {
      promotion.promotionScope = PromotionScope.SPECIFIC_LISTINGS;
      promotion.businesses = [{ id: 'business-2' }] as any;
      await service.processPurchase(user, order);
      expect(promotionParticipantRepository.save).not.toHaveBeenCalled();
    });

    it('should award points for a SPECIFIC_PRODUCTS promotion if product matches', async () => {
      promotion.promotionScope = PromotionScope.SPECIFIC_PRODUCTS;
      promotion.includedProducts = [{ id: 'product-1' }] as any;
      await service.processPurchase(user, order);
      expect(promotionParticipantRepository.save).toHaveBeenCalled();
    });

    it('should not award points if minimum spend is not met', async () => {
      order.total = 40;
      await service.processPurchase(user, order);
      expect(promotionParticipantRepository.save).not.toHaveBeenCalled();
    });

    it('should not award points if customer limit is reached', async () => {
      promotion.limitPerCustomer = 1;
      (promotionActivityRepository.count as jest.Mock).mockResolvedValue(1);
      await service.processPurchase(user, order);
      expect(promotionParticipantRepository.save).not.toHaveBeenCalled();
    });
  });
});
