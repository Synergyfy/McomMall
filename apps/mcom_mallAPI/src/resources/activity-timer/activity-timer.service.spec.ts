import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTimerService } from './activity-timer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityTimer } from './entities/activity-timer.entity';
import { User } from '../users/entities/user.entity';
import { ActivityTimerType } from './enums/activity-task-type.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Define MockRepository type locally
type MockRepository<T = any> = Partial<Record<keyof any, jest.Mock>>;

describe('ActivityTimerService', () => {
  let service: ActivityTimerService;
  let timerRepository: MockRepository;
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
          },
        },
      ],
    }).compile();

    service = module.get<ActivityTimerService>(ActivityTimerService);
    timerRepository = module.get(getRepositoryToken(ActivityTimer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserActiveTasks', () => {
    it('should return trial tasks with dynamic expiry', async () => {
      const user = {
        id: 'user-1',
        created_at: new Date('2026-01-01T00:00:00Z'),
      } as User;
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
        membership: { tier: { configuration: { trialDurationDays: 10 } } },
        trialPauses: [],
      });
      timerRepository.find.mockResolvedValue(tasks);

      const result = await service.getUserActiveTasks(user);

      // Trial Expiry = Jan 1 + 10 days = Jan 11
      expect(result[0].expiresAt).toEqual(new Date('2026-01-11T00:00:00.000Z'));
      expect(result[0].remainingTime).not.toBeNaN();
    });

    it('should return general tasks with fixed expiry', async () => {
      const user = { id: 'user-1', created_at: new Date() } as User;
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
      timerRepository.find.mockResolvedValue(tasks);

      const result = await service.getUserActiveTasks(user);

      expect(result[0].expiresAt).toEqual(fixedExpiry);
    });
  });

  describe('pauseTrial', () => {
    it('should pause trial if not already paused', async () => {
      const user = { id: 'user-1', trialPauses: [] } as User;
      managerMock.findOne.mockResolvedValue(user);
      managerMock.save.mockImplementation((u) => u);

      await service.pauseTrial(user.id);

      expect(user.trialPauses).toHaveLength(1);
      expect(user.trialPauses[0].resumedAt).toBeNull();
      expect(managerMock.save).toHaveBeenCalledWith(user);
    });

    it('should throw BadRequestException if already paused', async () => {
      const user = {
        id: 'user-1',
        trialPauses: [{ pausedAt: new Date(), resumedAt: null }],
      } as User;
      managerMock.findOne.mockResolvedValue(user);

      await expect(service.pauseTrial(user.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resumeTrial', () => {
    it('should resume trial if currently paused', async () => {
      const user = {
        id: 'user-1',
        trialPauses: [{ pausedAt: new Date(), resumedAt: null }],
      } as User;
      managerMock.findOne.mockResolvedValue(user);
      managerMock.save.mockImplementation((u) => u);

      await service.resumeTrial(user.id);

      expect(user.trialPauses[0].resumedAt).toBeInstanceOf(Date);
      expect(managerMock.save).toHaveBeenCalledWith(user);
    });

    it('should throw BadRequestException if not paused', async () => {
      const user = { id: 'user-1', trialPauses: [] } as User;
      managerMock.findOne.mockResolvedValue(user);

      await expect(service.resumeTrial(user.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('isRestricted', () => {
    it('should return true if trial is paused', async () => {
      const user = { id: 'user-1' } as User;
      const fullUser = {
        ...user,
        created_at: new Date(),
        trialPauses: [{ pausedAt: new Date(), resumedAt: null }],
      };

      managerMock.findOne.mockResolvedValue(fullUser);

      const result = await service.isRestricted(user);
      expect(result).toBe(true);
    });

    it('should return false for paid users', async () => {
      const user = {
        id: 'user-1',
        membership: { tierId: 'paid-tier' },
      } as User;

      const result = await service.isRestricted(user);
      expect(result).toBe(false);
    });
  });
});
