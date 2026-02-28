import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTimerService } from './activity-timer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityTimer } from './entities/activity-timer.entity';
import { UserActivity } from './entities/user-activity.entity';
import { User } from '../users/entities/user.entity';
import { ActivityTimerType } from './enums/activity-task-type.enum';
import { BadRequestException } from '@nestjs/common';

// Define MockRepository type locally
type MockRepository = Partial<Record<keyof any, jest.Mock>>;

describe('ActivityTimerService', () => {
  let service: ActivityTimerService;
  let timerRepository: MockRepository;
  let userActivityRepository: MockRepository;
  let managerMock: any;

  beforeEach(async () => {
    managerMock = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityTimerService,
        {
          provide: getRepositoryToken(ActivityTimer),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            manager: managerMock,
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(UserActivity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<ActivityTimerService>(ActivityTimerService);
    timerRepository = module.get(getRepositoryToken(ActivityTimer));
    userActivityRepository = module.get(getRepositoryToken(UserActivity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserActiveTasks', () => {
    it('should return trial tasks with dynamic expiry', async () => {
      const user = {
        id: 'user-1',
        created_at: new Date('2026-01-01T00:00:00Z'),
      } as unknown as User;
      const tasks = [
        {
          id: 'task-1',
          type: ActivityTimerType.TRIAL,
          isActive: true,
          expiresAt: null,
        },
      ] as ActivityTimer[];

      managerMock.findOne.mockResolvedValue({
        ...user,
        membership: { isTrial: true, isActive: true, expiresAt: new Date('2026-01-11T00:00:00Z'), tier: { configuration: { trialDurationDays: 10 } } },
      });
      timerRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tasks),
      });

      userActivityRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getUserActiveTasks(user);

      // Trial Expiry = Jan 1 + 10 days = Jan 11
      expect(result[0].expiresAt).toEqual(new Date('2026-01-11T00:00:00.000Z'));
      expect(result[0].remainingTime).not.toBeNaN();
    });

    it('should return general tasks with fixed expiry', async () => {
      const user = { id: 'user-1', created_at: new Date() } as unknown as User;
      const fixedExpiry = new Date(Date.now() + 100000);
      const tasks = [
        {
          id: 'task-2',
          type: ActivityTimerType.GENERAL,
          isActive: true,
          expiresAt: fixedExpiry,
        },
      ] as ActivityTimer[];

      managerMock.findOne.mockResolvedValue(user);
      timerRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tasks),
      });

      userActivityRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getUserActiveTasks(user);

      expect(result[0].expiresAt).toEqual(fixedExpiry);
    });
  });



  describe('isRestricted', () => {
    it('should return true if trial has expired', async () => {
      const user = { id: 'user-1' } as unknown as User;
      const fullUser = {
        ...user,
        created_at: new Date(),
        membership: {
          isActive: true,
          isTrial: true,
          expiresAt: new Date(Date.now() - 100000), // Expired in the past
        },
      };

      managerMock.findOne.mockResolvedValue(fullUser);

      const result = await service.isRestricted(user);
      expect(result).toBe(true);
    });

    it('should return false for paid users', async () => {
      const user = {
        id: 'user-1',
        membership: {
          isActive: true,
          isTrial: false,
          tierId: 'paid-tier'
        },
      } as unknown as User;

      managerMock.findOne.mockResolvedValue({
        ...user,
      });

      const result = await service.isRestricted(user);
      expect(result).toBe(false);
    });
  });
});
