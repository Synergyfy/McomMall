import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, QueryRunner } from 'typeorm';
import { PromotionEngineService } from './promotion-engine.service';
import { Promotion } from './entities/promotion.entity';
import { PromotionParticipant } from './entities/promotion-participant.entity';
import { PromotionActivity } from './entities/promotion-activity.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { PromotionScope, PromotionType } from './promotion.enum';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';

describe('PromotionEngineService', () => {
  let service: PromotionEngineService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let manager: EntityManager;

  // Repositories
  let productRepo: Repository<Product>;
  let participantRepo: Repository<PromotionParticipant>;

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  const mockParticipantRepository = {
    find: jest.fn(),
  };

  const mockManager = {
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: mockManager,
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionEngineService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRepositoryToken(Promotion), useValue: {} },
        { provide: getRepositoryToken(PromotionParticipant), useValue: mockParticipantRepository },
        { provide: getRepositoryToken(PromotionActivity), useValue: { create: jest.fn().mockImplementation(dto => dto) } },
        { provide: getRepositoryToken(Product), useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<PromotionEngineService>(PromotionEngineService);
    dataSource = module.get<DataSource>(DataSource);
    productRepo = module.get(getRepositoryToken(Product));
    participantRepo = module.get(getRepositoryToken(PromotionParticipant));
    queryRunner = dataSource.createQueryRunner();
    manager = queryRunner.manager;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process purchase, award points, update wallet, and create transaction', async () => {
    const user = { id: 'u1', points: 100 } as User;
    const order = { id: 'o1', total: 100, items: [{ product: { id: 'p1' }, price: 50, quantity: 2 }] } as any;
    const business = { id: 'b1', user: { id: 'owner1' } };
    const product = { id: 'p1', business };
    const promotion = {
      id: 'promo1',
      isActive: true,
      beginDate: new Date('2023-01-01'),
      endDate: new Date('2030-01-01'),
      minimumSpend: 50,
      promotionScope: PromotionScope.ALL_LISTINGS,
      businesses: [business],
      promotionType: PromotionType.MULTIPLIER,
      multiplier: 2,
    } as any;
    const participant = { id: 'part1', promotion, pointsEarned: 0, user };

    // Mocks
    mockParticipantRepository.find.mockResolvedValue([participant]);
    mockProductRepository.findOne.mockResolvedValue(product);
    mockManager.count.mockResolvedValue(0); // Limit check

    // Mock save to return entity
    mockManager.save.mockImplementation(entity => Promise.resolve(entity));

    await service.processPurchase(user, order);

    // Verify Transaction Flow
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();

    // Verify Points Calculation (50 * 2 * 2 = 200)
    // Save Participant
    expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'part1',
        pointsEarned: 200
    }));

    // Verify Wallet Update (100 + 200 = 300)
    expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'u1',
        points: 300
    }));

    // Verify Activity Log
    expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        pointsEarned: 200,
        participant: expect.objectContaining({ id: 'part1' })
    }));

    // Verify Point Transaction Creation (The Ghost Fix)
    expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        points: 200,
        type: 'EARNED',
        user: expect.objectContaining({ id: 'u1' }),
        order: expect.objectContaining({ id: 'o1' })
    }));
  });

  it('should rollback transaction if save fails', async () => {
    const user = { id: 'u1', points: 0 } as User;
    const order = { items: [{ product: { id: 'p1' }, quantity: 1, price: 10 }] } as any;
    const promotion = {
        id: 'promo1', isActive: true,
        promotionScope: PromotionScope.ALL_LISTINGS,
        businesses: [{id: 'b1'}],
        promotionType: PromotionType.BONUS_POINTS,
        bonusPoints: 100
    };
    const participant = { id: 'part1', promotion, pointsEarned: 0 };

    mockParticipantRepository.find.mockResolvedValue([participant]);
    mockProductRepository.findOne.mockResolvedValue({ id: 'p1', business: { id: 'b1' } });

    // Fail the save
    mockManager.save.mockRejectedValue(new Error('Save failed'));

    await service.processPurchase(user, order);

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});