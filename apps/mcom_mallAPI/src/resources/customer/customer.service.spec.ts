import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CustomerService } from './customer.service';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { Review } from '../reviews/entities/review.entity';
import { Event } from '../events/entities/event.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { Campaign } from '../campaign/entities/campaign.entity';
import { InterestSignal } from '../interest-signals/entities/interest-signal.entity';
import { PointTransaction } from '../transaction/entities/point-transaction.entity';
import { Reward } from './entities/reward.entity';
import { RewardRedemption } from './entities/reward-redemption.entity';
import { DailySpinLedger } from './entities/daily-spin-ledger.entity';
import { ScratchCardLedger } from './entities/scratch-card-ledger.entity';
import { Challenge } from './entities/challenge.entity';
import { ChallengeProgress } from './entities/challenge-progress.entity';
import { EventRsvp } from './entities/event-rsvp.entity';
import { RewardType } from './reward.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CustomerService', () => {
  let service: CustomerService;
  let rewardRepo: Repository<Reward>;
  let userRepo: Repository<User>;
  let dataSource: DataSource;

  const managerMock = () => {
    const create = jest.fn((entity: any, data: any) => ({
      ...data,
      id: 'new-id',
    }));
    const save = jest.fn((entity: any) => Promise.resolve(entity));
    const userRepoMock = {
      createQueryBuilder: jest.fn(() => ({
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'user-1',
          points: 1000,
        }),
      })),
      save: jest.fn((u: any) => Promise.resolve(u)),
    };
    const redemptionRepoMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create,
      save,
    };
    const spinRepoMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create,
      save,
    };
    const scratchRepoMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create,
      save,
    };
    const rsvpRepoMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create,
      save,
    };
    const progressRepoMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data: any) => data),
      save: jest.fn((p: any) => Promise.resolve(p)),
    };
    return {
      create,
      save,
      createQueryBuilder: jest.fn(() => ({
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'user-1', points: 1000 }),
      })),
      getRepository: jest.fn((entity: any) => {
        if (entity === User) return userRepoMock;
        if (entity === RewardRedemption) return redemptionRepoMock;
        if (entity === DailySpinLedger) return spinRepoMock;
        if (entity === ScratchCardLedger) return scratchRepoMock;
        if (entity === EventRsvp) return rsvpRepoMock;
        if (entity === ChallengeProgress) return progressRepoMock;
        return {
          create,
          save,
          findOne: jest.fn().mockResolvedValue(null),
          find: jest.fn().mockResolvedValue([]),
        };
      }),
    };
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: getRepositoryToken(User), useValue: { findOne: jest.fn() } },
        { provide: getRepositoryToken(Business), useValue: {} },
        { provide: getRepositoryToken(Review), useValue: {} },
        { provide: getRepositoryToken(Event), useValue: {} },
        { provide: getRepositoryToken(Offer), useValue: {} },
        { provide: getRepositoryToken(Promotion), useValue: {} },
        { provide: getRepositoryToken(Campaign), useValue: {} },
        { provide: getRepositoryToken(InterestSignal), useValue: {} },
        { provide: getRepositoryToken(PointTransaction), useValue: {} },
        {
          provide: getRepositoryToken(Reward),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(RewardRedemption),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        { provide: getRepositoryToken(DailySpinLedger), useValue: {} },
        { provide: getRepositoryToken(ScratchCardLedger), useValue: {} },
        { provide: getRepositoryToken(Challenge), useValue: {} },
        { provide: getRepositoryToken(ChallengeProgress), useValue: {} },
        { provide: getRepositoryToken(EventRsvp), useValue: {} },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb(managerMock())),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<CustomerService>(CustomerService);
    rewardRepo = moduleRef.get<Repository<Reward>>(getRepositoryToken(Reward));
    userRepo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    dataSource = moduleRef.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('redeemReward', () => {
    it('throws NotFoundException when reward missing', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue(null);
      await expect(
        service.redeemReward('user-1', { rewardId: 'r1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when reward is a code reward', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue({
        id: 'r1',
        rewardType: RewardType.CODE,
        cost: 0,
      } as Reward);
      await expect(
        service.redeemReward('user-1', { rewardId: 'r1' }),
      ).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when reward already claimed (in-tx check)', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue({
        id: 'r1',
        cost: 500,
        rewardType: RewardType.COUPON,
      } as Reward);
      const manager = managerMock();
      const redemptionRepoMock = manager.getRepository(RewardRedemption) as any;
      (redemptionRepoMock.findOne as jest.Mock).mockResolvedValue({
        id: 'red1',
      });
      (dataSource.transaction as jest.Mock).mockImplementation((cb) =>
        cb(manager),
      );
      await expect(
        service.redeemReward('user-1', { rewardId: 'r1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException with insufficient points (in-tx check)', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue({
        id: 'r1',
        cost: 2000,
        rewardType: RewardType.COUPON,
      } as Reward);
      const manager = managerMock();
      const userRepoMock = manager.getRepository(User) as any;
      (userRepoMock.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(
        {
          id: 'user-1',
          points: 100,
        },
      );
      (dataSource.transaction as jest.Mock).mockImplementation((cb) =>
        cb(manager),
      );
      await expect(
        service.redeemReward('user-1', { rewardId: 'r1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('redeems a reward successfully and returns the issued code', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue({
        id: 'r1',
        title: 'Artisan Coffee Duo',
        rewardType: RewardType.VOUCHER,
        cost: 500,
        code: 'COFFEE500',
      } as Reward);
      const result = await service.redeemReward('user-1', { rewardId: 'r1' });
      expect(result.success).toBe(true);
      expect(result.rewardId).toBe('r1');
      expect(result.cost).toBe(500);
      expect(result.issuedCode).toBe('COFFEE500');
    });
  });

  describe('redeemCode', () => {
    it('throws NotFoundException for an invalid code', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue(null);
      await expect(
        service.redeemCode('user-1', { code: 'BAD' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when code already redeemed (in-tx check)', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue({
        id: 'r1',
        rewardType: RewardType.CODE,
        cost: 0,
        pointsRequired: 500,
      } as Reward);
      const manager = managerMock();
      const redemptionRepoMock = manager.getRepository(RewardRedemption) as any;
      (redemptionRepoMock.findOne as jest.Mock).mockResolvedValue({
        id: 'red1',
      });
      (dataSource.transaction as jest.Mock).mockImplementation((cb) =>
        cb(manager),
      );
      await expect(
        service.redeemCode('user-1', { code: 'MCOM2024' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('redeems a valid code and awards points', async () => {
      jest.spyOn(rewardRepo, 'findOne').mockResolvedValue({
        id: 'r1',
        rewardType: RewardType.CODE,
        cost: 0,
        pointsRequired: 500,
      } as Reward);
      const result = await service.redeemCode('user-1', { code: 'MCOM2024' });
      expect(result.success).toBe(true);
      expect(result.pointsAwarded).toBe(500);
    });
  });

  describe('dailySpin', () => {
    it('returns a spin result and writes the ledger', async () => {
      const manager = managerMock();
      const spinRepoMock = manager.getRepository(DailySpinLedger);
      (dataSource.transaction as jest.Mock).mockImplementation((cb) =>
        cb(manager),
      );
      const result = await service.dailySpin('user-1');
      expect(result.success).toBe(true);
      expect(result.prizeType).toBeDefined();
      expect(spinRepoMock.save).toHaveBeenCalled();
    });
  });

  describe('scratchCard', () => {
    it('returns a scratch result and writes the ledger', async () => {
      const manager = managerMock();
      const scratchRepoMock = manager.getRepository(ScratchCardLedger);
      (dataSource.transaction as jest.Mock).mockImplementation((cb) =>
        cb(manager),
      );
      const result = await service.scratchCard('user-1');
      expect(result.success).toBe(true);
      expect(result.prizeType).toBeDefined();
      expect(scratchRepoMock.save).toHaveBeenCalled();
    });
  });

  describe('getRewards', () => {
    it('throws NotFoundException when user missing', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getRewards('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
