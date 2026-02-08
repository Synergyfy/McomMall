import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PromotionService } from './promotion.service';
import { Promotion } from './entities/promotion.entity';
import { Product } from '../product/entities/product.entity';
import { Business } from '../listings/entities/listing.entity';
import { PromotionType, PromotionScope } from './promotion.enum';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { PromotionParticipant } from './entities/promotion-participant.entity';
import { PromotionActivity } from './entities/promotion-activity.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { ActivitiesService } from '../activities/activities.service';
import { TrialService } from '../trial/trial.service';

const mockPromotionRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoin: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  })),
});

const mockProductRepository = () => ({
  findBy: jest.fn(),
});

const mockBusinessRepository = () => ({
  findBy: jest.fn(),
  find: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockPromotionParticipantRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  })),
});

const mockPromotionActivityRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

const mockPointTransactionRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getRawOne: jest.fn(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
});

const mockActivitiesService = () => ({
  create: jest.fn(),
});

const mockTrialService = () => ({
  markTaskAsCompleted: jest.fn(),
});

describe('PromotionService', () => {
  let service: PromotionService;
  let promotionRepository;
  let pointTransactionRepository;
  let productRepository: Repository<Product>;
  let businessRepository: Repository<Business>;
  let userRepository: Repository<User>;
  let promotionParticipantRepository: Repository<PromotionParticipant>;
  let promotionActivityRepository: Repository<PromotionActivity>;

  const userId = 'some-user-id';
  const promotionId = 'some-promotion-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionService,
        {
          provide: getRepositoryToken(Promotion),
          useFactory: mockPromotionRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useFactory: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
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
          provide: getRepositoryToken(PointTransaction),
          useFactory: mockPointTransactionRepository,
        },
        {
          provide: ActivitiesService,
          useFactory: mockActivitiesService,
        },
        {
          provide: TrialService,
          useFactory: mockTrialService,
        },
      ],
    }).compile();

    service = module.get<PromotionService>(PromotionService);
    promotionRepository = module.get(getRepositoryToken(Promotion));
    pointTransactionRepository = module.get(
      getRepositoryToken(PointTransaction),
    );
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    promotionParticipantRepository = module.get<
      Repository<PromotionParticipant>
    >(getRepositoryToken(PromotionParticipant));
    promotionActivityRepository = module.get<Repository<PromotionActivity>>(
      getRepositoryToken(PromotionActivity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionService,
        {
          provide: getRepositoryToken(Promotion),
          useFactory: mockPromotionRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useFactory: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
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
          provide: getRepositoryToken(PointTransaction),
          useFactory: mockPointTransactionRepository,
        },
        {
          provide: ActivitiesService,
          useFactory: mockActivitiesService,
        },
        {
          provide: TrialService,
          useFactory: mockTrialService,
        },
      ],
    }).compile();

    service = module.get<PromotionService>(PromotionService);
    promotionRepository = module.get(getRepositoryToken(Promotion));
    pointTransactionRepository = module.get(
      getRepositoryToken(PointTransaction),
    );
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    businessRepository = module.get<Repository<Business>>(
      getRepositoryToken(Business),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    promotionParticipantRepository = module.get<
      Repository<PromotionParticipant>
    >(getRepositoryToken(PromotionParticipant));
    promotionActivityRepository = module.get<Repository<PromotionActivity>>(
      getRepositoryToken(PromotionActivity),
    );
    (userRepository.findOne as jest.Mock).mockResolvedValue({ id: userId });
  });
  describe('create', () => {
    it('should create a promotion for specific listings', async () => {
      const createPromotionDto = {
        name: 'Test Promotion',
        promotionType: PromotionType.BONUS_POINTS,
        promotionScope: PromotionScope.SPECIFIC_LISTINGS,
        bonusPoints: 100,
        minimumSpend: 10,
        businessIds: ['business-1'],
        includedProductIds: [],
        excludedProductIds: [],
      };
      const promotion = { id: promotionId, ...createPromotionDto };
      const businesses = [{ id: 'business-1' }];

      (promotionRepository.create as jest.Mock).mockReturnValue(promotion);
      (businessRepository.findBy as jest.Mock).mockResolvedValue(businesses);
      (promotionRepository.save as jest.Mock).mockResolvedValue(promotion);

      const result = await service.create(userId, createPromotionDto as any);

      expect(promotionRepository.create).toHaveBeenCalled();
      expect(businessRepository.findBy).toHaveBeenCalledWith({
        id: expect.anything(),
        user: { id: userId },
      });
      expect(promotionRepository.save).toHaveBeenCalledWith(promotion);
      expect(result).toEqual(promotion);
    });

    it('should create a promotion for all products', async () => {
      const createPromotionDto = {
        name: 'Test Promotion',
        promotionType: PromotionType.BONUS_POINTS,
        promotionScope: PromotionScope.ALL_PRODUCTS,
        bonusPoints: 100,
        minimumSpend: 10,
      };
      const promotion = { id: promotionId, ...createPromotionDto };
      const businesses = [
        { id: 'business-1', products: [{ id: 'product-1' }] },
      ];

      (promotionRepository.create as jest.Mock).mockReturnValue(promotion);
      (businessRepository.find as jest.Mock).mockResolvedValue(businesses);
      (promotionRepository.save as jest.Mock).mockResolvedValue(promotion);

      const result = await service.create(userId, createPromotionDto as any);

      expect(promotionRepository.create).toHaveBeenCalled();
      expect(businessRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['products'],
      });
      expect(promotionRepository.save).toHaveBeenCalledWith(promotion);
      expect(result).toEqual(promotion);
    });

    it('should create a promotion for specific products', async () => {
      const createPromotionDto = {
        name: 'Test Promotion',
        promotionType: PromotionType.BONUS_POINTS,
        promotionScope: PromotionScope.SPECIFIC_PRODUCTS,
        bonusPoints: 100,
        minimumSpend: 10,
        includedProductIds: ['product-1'],
      };
      const promotion = { id: promotionId, ...createPromotionDto };
      const products = [{ id: 'product-1' }];

      (promotionRepository.create as jest.Mock).mockReturnValue(promotion);
      (productRepository.findBy as jest.Mock).mockResolvedValue(products);
      (promotionRepository.save as jest.Mock).mockResolvedValue(promotion);

      const result = await service.create(userId, createPromotionDto as any);

      expect(promotionRepository.create).toHaveBeenCalled();
      expect(productRepository.findBy).toHaveBeenCalledWith({
        id: In(['product-1']),
      });
      expect(promotionRepository.save).toHaveBeenCalledWith(promotion);
      expect(result).toEqual(promotion);
    });
  });

  describe('findAll', () => {
    it('should return an array of promotions', async () => {
      const promotions = [{ id: promotionId, name: 'Test Promotion' }];
      (promotionRepository.find as jest.Mock).mockResolvedValue(promotions);

      const result = await service.findAll(userId);

      expect(promotionRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
      });
      expect(result).toEqual(promotions);
    });
  });

  describe('findUserPromotions', () => {
    it('should return an array of promotions a user is participating in', async () => {
      const promotions = [{ id: 'promo1' }, { id: 'promo2' }];
      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(promotions),
      };
      (promotionRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.findUserPromotions(userId);

      expect(promotionRepository.createQueryBuilder).toHaveBeenCalledWith(
        'promotion',
      );
      expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
        'promotion.participants',
        'participant',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'participant.userId = :userId',
        { userId },
      );
      expect(result).toEqual(promotions);
    });
  });

  describe('findOne', () => {
    it('should return a promotion', async () => {
      const promotion = { id: promotionId, name: 'Test Promotion' };
      promotionRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(promotion),
      }));

      const result = await service.findOne(userId, promotionId);

      expect(result).toEqual(promotion);
    });

    it('should throw NotFoundException if promotion not found', async () => {
      promotionRepository.createQueryBuilder.mockImplementation(() => ({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }));

      await expect(service.findOne(userId, promotionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a promotion', async () => {
      const updatePromotionDto = { name: 'Updated Promotion' };
      const existingPromotion = { id: promotionId, name: 'Test Promotion' };

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(existingPromotion as any);
      (promotionRepository.save as jest.Mock).mockResolvedValue({
        ...existingPromotion,
        ...updatePromotionDto,
      });

      const result = await service.update(
        userId,
        promotionId,
        updatePromotionDto as any,
      );

      expect(service.findOne).toHaveBeenCalledWith(userId, promotionId);
      expect(promotionRepository.save).toHaveBeenCalledWith({
        ...existingPromotion,
        ...updatePromotionDto,
      });
      expect(result.name).toEqual('Updated Promotion');
    });
  });

  describe('remove', () => {
    it('should remove a promotion', async () => {
      const promotion = { id: promotionId, name: 'Test Promotion' };
      jest.spyOn(service, 'findOne').mockResolvedValue(promotion as any);
      (promotionRepository.remove as jest.Mock).mockResolvedValue(undefined);

      await service.remove(userId, promotionId);

      expect(service.findOne).toHaveBeenCalledWith(userId, promotionId);
      expect(promotionRepository.remove).toHaveBeenCalledWith(promotion);
    });
  });

  describe('participate', () => {
    it('should allow a user to participate in a promotion', async () => {
      const user = new User();
      const promotion = {
        id: promotionId,
        isActive: true,
        beginDate: new Date('2020-01-01'),
        endDate: new Date('2099-01-01'),
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (promotionRepository.findOne as jest.Mock).mockResolvedValue(promotion);
      (promotionParticipantRepository.findOne as jest.Mock).mockResolvedValue(
        null,
      );
      (promotionParticipantRepository.create as jest.Mock).mockReturnValue(
        new PromotionParticipant(),
      );
      (promotionParticipantRepository.save as jest.Mock).mockResolvedValue(
        new PromotionParticipant(),
      );

      const result = await service.participate(userId, promotionId);
      expect(result).toBeInstanceOf(PromotionParticipant);
    });

    it('should throw NotFoundException if user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.participate(userId, promotionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if promotion not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(new User());
      (promotionRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.participate(userId, promotionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if promotion is not active', async () => {
      const promotion = { id: promotionId, isActive: false };
      (userRepository.findOne as jest.Mock).mockResolvedValue(new User());
      (promotionRepository.findOne as jest.Mock).mockResolvedValue(promotion);
      await expect(service.participate(userId, promotionId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user is already participating', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(new User());
      (promotionRepository.findOne as jest.Mock).mockResolvedValue({
        isActive: true,
      });
      (promotionParticipantRepository.findOne as jest.Mock).mockResolvedValue(
        new PromotionParticipant(),
      );
      await expect(service.participate(userId, promotionId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllParticipantsForOwner', () => {
    it('should return an array of promotion participants', async () => {
      const ownerId = 'owner-id';
      const participants = [new PromotionParticipant()];
      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(participants),
      };
      (
        promotionParticipantRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue(queryBuilder);

      const result = await service.findAllParticipantsForOwner(ownerId);

      expect(result).toEqual(participants);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'business.userId = :ownerId',
        { ownerId },
      );
    });
  });

  describe('check', () => {
    it('should throw BadRequestException if no businessId or productId is provided', async () => {
      await expect(service.check({})).rejects.toThrow(BadRequestException);
    });

    it('should return promotions for a given businessId', async () => {
      const promotions = [{ id: 'promo1' }];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(promotions),
      };
      (promotionRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.check({ businessId: 'business-1' });

      expect(result).toEqual(promotions);
    });

    it('should return promotions for a given productId', async () => {
      const promotions = [{ id: 'promo1' }];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(promotions),
      };
      (promotionRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.check({ productId: 'product-1' });

      expect(result).toEqual(promotions);
    });

    it('should return promotions with ALL_LISTINGS scope', async () => {
      const promotions = [
        { id: 'promo1', promotionScope: PromotionScope.ALL_LISTINGS },
      ];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(promotions),
      };
      (promotionRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.check({ businessId: 'business-1' });

      expect(result).toEqual(promotions);
    });

    it('should return promotions with ALL_PRODUCTS scope', async () => {
      const promotions = [
        { id: 'promo1', promotionScope: PromotionScope.ALL_PRODUCTS },
      ];
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(promotions),
      };
      (promotionRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.check({ productId: 'product-1' });

      expect(result).toEqual(promotions);
    });

    it('should not return inactive promotions', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      (promotionRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.check({ businessId: 'business-1' });

      expect(result).toEqual([]);
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'promotion.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should not return expired promotions', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      (promotionRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        queryBuilder,
      );

      const result = await service.check({ businessId: 'business-1' });

      expect(result).toEqual([]);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('promotion.endDate'),
        expect.any(Object),
      );
    });
  });

  describe('updatePoints', () => {
    const ownerId = 'owner-id';
    const participantId = 'participant-id';
    const amount = 10;
    let participant;

    beforeEach(() => {
      participant = {
        id: participantId,
        pointsEarned: 50,
        promotion: {
          businesses: [{ user: { id: ownerId } }],
        },
        user: new User(),
      };
    });

    it('should update points for a participant and the user balance', async () => {
      participant.user.points = 100;
      const expectedUserPoints = participant.user.points + amount;

      (promotionParticipantRepository.findOne as jest.Mock).mockResolvedValue(
        participant,
      );
      (promotionParticipantRepository.save as jest.Mock).mockResolvedValue({
        ...participant,
        pointsEarned: 60,
      });
      (userRepository.save as jest.Mock).mockResolvedValue(undefined);
      (promotionActivityRepository.create as jest.Mock).mockReturnValue(
        new PromotionActivity(),
      );
      (promotionActivityRepository.save as jest.Mock).mockResolvedValue(
        new PromotionActivity(),
      );

      const result = await service.updatePoints(ownerId, participantId, amount);
      expect(result.pointsEarned).toEqual(60);
      expect(promotionParticipantRepository.save).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ points: expectedUserPoints }),
      );
      expect(promotionActivityRepository.create).toHaveBeenCalled();
      expect(promotionActivityRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if participant not found', async () => {
      (promotionParticipantRepository.findOne as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(
        service.updatePoints(ownerId, participantId, amount),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      participant.promotion.businesses[0].user.id = 'other-owner-id';
      (promotionParticipantRepository.findOne as jest.Mock).mockResolvedValue(
        participant,
      );
      await expect(
        service.updatePoints(ownerId, participantId, amount),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if points go below zero', async () => {
      (promotionParticipantRepository.findOne as jest.Mock).mockResolvedValue(
        participant,
      );
      await expect(
        service.updatePoints(ownerId, participantId, -60),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSummaryStatistics', () => {
    it('should return summary statistics for a promotion', async () => {
      (promotionRepository.findOne as jest.Mock).mockResolvedValue({
        id: promotionId,
      });
      (pointTransactionRepository.createQueryBuilder as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '1000' }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '500' }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: '50' }),
        });

      const result = await service.getSummaryStatistics(promotionId);

      expect(result).toEqual({
        totalPointsEarned: 1000,
        totalPointsRedeemed: 500,
        totalParticipants: 50,
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('should return a paginated transaction history for a promotion', async () => {
      const query = {
        page: 1,
        limit: 10,
        skip: 0,
        take: 10,
        order: 'DESC',
      };
      const transactions = [
        {
          id: '1',
          points: 100,
          type: 'EARNED',
          created_at: new Date(),
          user: { id: 'user1', name: 'John Doe', email: 'john@a.com' },
        },
      ];
      (promotionRepository.findOne as jest.Mock).mockResolvedValue({
        id: promotionId,
      });
      (
        pointTransactionRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([transactions, 1]),
      });

      const result = await service.getTransactionHistory(
        promotionId,
        query as any,
      );

      expect(result.data.length).toBe(1);
      expect(result.meta.itemCount).toBe(1);
    });
  });
});
