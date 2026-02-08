import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrialService } from './trial.service';
import { Trial } from '../payments/entities/trial.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/common/role.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TrialService', () => {
  let service: TrialService;
  let trialRepository: Repository<Trial>;

  const mockTrialRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrialService,
        {
          provide: getRepositoryToken(Trial),
          useValue: mockTrialRepository,
        },
      ],
    }).compile();

    service = module.get<TrialService>(TrialService);
    trialRepository = module.get<Repository<Trial>>(getRepositoryToken(Trial));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTrial', () => {
    it('should create a new trial for a user', async () => {
      const user = new User();
      user.id = 'test-user-id';
      user.role = UserRole.OWNER;

      const trial = new Trial();
      trial.user = user;
      trial.startedAt = new Date();
      trial.expiresAt = new Date(trial.startedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

      mockTrialRepository.save.mockResolvedValue(trial);

      const result = await service.createTrial(user);

      expect(result).toEqual(trial);
      expect(mockTrialRepository.save).toHaveBeenCalledWith(expect.any(Trial));
    });
  });

  describe('getTrialStatus', () => {
    it('should return the trial status', async () => {
      const trial = new Trial();
      trial.isActive = true;
      trial.expiresAt = new Date(Date.now() + 100000);
      trial.tasks = { createdBusiness: false, createdProductOrService: false, createdPromotion: false, createdOffer: false, createdCoupon: false };
      trial.pauses = [];

      mockTrialRepository.findOne.mockResolvedValue(trial);

      const result = await service.getTrialStatus('user-id');

      expect(result.isActive).toBe(true);
      expect(result.remainingTime).toBeGreaterThan(0);
    });

    it('should throw NotFoundException if trial not found', async () => {
      mockTrialRepository.findOne.mockResolvedValue(null);
      await expect(service.getTrialStatus('user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('pauseTrial', () => {
    it('should pause the trial', async () => {
      const trial = new Trial();
      trial.pauses = [];
      mockTrialRepository.findOne.mockResolvedValue(trial);
      mockTrialRepository.save.mockResolvedValue(trial);

      const result = await service.pauseTrial('user-id');
      expect(result.pauses.length).toBe(1);
    });

    it('should throw BadRequestException if trial is already paused', async () => {
      const trial = new Trial();
      trial.pauses = [{ pausedAt: new Date(), resumedAt: null }];
      mockTrialRepository.findOne.mockResolvedValue(trial);

      await expect(service.pauseTrial('user-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if all pauses are used', async () => {
      const trial = new Trial();
      trial.pauses = [
        { pausedAt: new Date(), resumedAt: new Date() },
        { pausedAt: new Date(), resumedAt: new Date() },
      ];
      mockTrialRepository.findOne.mockResolvedValue(trial);

      await expect(service.pauseTrial('user-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resumeTrial', () => {
    it('should resume the trial', async () => {
      const trial = new Trial();
      trial.expiresAt = new Date();
      trial.pauses = [{ pausedAt: new Date(), resumedAt: null }];
      mockTrialRepository.findOne.mockResolvedValue(trial);
      mockTrialRepository.save.mockResolvedValue(trial);

      const result = await service.resumeTrial('user-id');
      expect(result.pauses[0].resumedAt).not.toBeNull();
    });

    it('should throw BadRequestException if trial is not paused', async () => {
      const trial = new Trial();
      trial.pauses = [];
      mockTrialRepository.findOne.mockResolvedValue(trial);

      await expect(service.resumeTrial('user-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkAndResumeTrial', () => {
    it('should auto-resume trial after 48 hours', async () => {
      const trial = new Trial();
      trial.expiresAt = new Date();
      trial.pauses = [{ pausedAt: new Date(Date.now() - 49 * 60 * 60 * 1000), resumedAt: null }];
      mockTrialRepository.findOne.mockResolvedValue(trial);
      mockTrialRepository.save.mockResolvedValue(trial);

      await service.checkAndResumeTrial('user-id');
      expect(mockTrialRepository.save).toHaveBeenCalled();
    });
  });

  describe('markTaskAsCompleted', () => {
    it('should mark a task as completed', async () => {
      const trial = new Trial();
      trial.isActive = true;
      trial.tasks = { createdBusiness: false, createdProductOrService: false, createdPromotion: false, createdOffer: false, createdCoupon: false };
      mockTrialRepository.findOne.mockResolvedValue(trial);
      mockTrialRepository.save.mockResolvedValue(trial);

      const result = await service.markTaskAsCompleted('user-id', 'createdBusiness');
      expect(result.tasks.createdBusiness).toBe(true);
    });

    it('should not mark a task as completed if the trial is inactive', async () => {
      const trial = new Trial();
      trial.isActive = false;
      trial.tasks = { createdBusiness: false, createdProductOrService: false, createdPromotion: false, createdOffer: false, createdCoupon: false };
      mockTrialRepository.findOne.mockResolvedValue(trial);

      const result = await service.markTaskAsCompleted('user-id', 'createdBusiness');
      expect(result.tasks.createdBusiness).toBe(false);
      expect(mockTrialRepository.save).not.toHaveBeenCalled();
    });

    it('should not mark a task as completed if it is already completed', async () => {
      const trial = new Trial();
      trial.isActive = true;
      trial.tasks = { createdBusiness: true, createdProductOrService: false, createdPromotion: false, createdOffer: false, createdCoupon: false };
      mockTrialRepository.findOne.mockResolvedValue(trial);

      const result = await service.markTaskAsCompleted('user-id', 'createdBusiness');
      expect(result.tasks.createdBusiness).toBe(true);
      expect(mockTrialRepository.save).not.toHaveBeenCalled();
    });
  });
});
