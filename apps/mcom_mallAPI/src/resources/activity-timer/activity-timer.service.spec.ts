import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityTimerService } from './activity-timer.service';
import { ActivityTimerTemplate } from './entities/activity-timer-template.entity';
import { ActivityTimer } from './entities/activity-timer.entity';
import { ActivityTimerType, ActivityTaskType } from './enums/activity-task-type.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ActivityTimerService', () => {
  let service: ActivityTimerService;
  let templateRepo: any;
  let timerRepo: any;

  const mockTemplateRepo = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(template => Promise.resolve({ id: 'template-id', ...template })),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTimerRepo = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(timer => Promise.resolve({ id: 'timer-id', ...timer })),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    manager: {
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityTimerService,
        {
          provide: getRepositoryToken(ActivityTimerTemplate),
          useValue: mockTemplateRepo,
        },
        {
          provide: getRepositoryToken(ActivityTimer),
          useValue: mockTimerRepo,
        },
      ],
    }).compile();

    service = module.get<ActivityTimerService>(ActivityTimerService);
    templateRepo = module.get(getRepositoryToken(ActivityTimerTemplate));
    timerRepo = module.get(getRepositoryToken(ActivityTimer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isRestricted', () => {
    it('should NOT restrict users with a paid tier', async () => {
      const user = { id: 'u1', membership: { tierId: 'pro' } } as any;
      const result = await service.isRestricted(user);
      expect(result).toBe(false);
    });

    it('should restrict user if trial is expired and tasks incomplete', async () => {
      const user = { id: 'u1', membership: { tierId: null } } as any;
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);
      
      timerRepo.findOne.mockResolvedValue({
        expiresAt: expiredDate,
        taskStatus: { [ActivityTaskType.CREATE_BUSINESS]: false },
        isActive: true
      });

      const result = await service.isRestricted(user);
      expect(result).toBe(true);
    });

    it('should NOT restrict user if trial is expired but tasks ARE complete', async () => {
      const user = { id: 'u1', membership: null } as any;
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);
      
      timerRepo.findOne.mockResolvedValue({
        expiresAt: expiredDate,
        taskStatus: { [ActivityTaskType.CREATE_BUSINESS]: true },
        isActive: true
      });

      const result = await service.isRestricted(user);
      expect(result).toBe(false);
    });
  });

  describe('handleAction', () => {
    it('should mark task as complete for all active timers', async () => {
      const userId = 'u1';
      const action = ActivityTaskType.CREATE_BUSINESS;
      
      const mockTimer = {
        id: 't1',
        taskStatus: { [action]: false, [ActivityTaskType.IMPORT_CONTACTS]: false },
        isActive: true,
        save: jest.fn()
      };

      timerRepo.find.mockResolvedValue([mockTimer]);

      await service.handleAction(userId, action);

      expect(mockTimer.taskStatus[action]).toBe(true);
      expect(timerRepo.save).toHaveBeenCalledWith(mockTimer);
    });

    it('should mark completedAt if all tasks are done', async () => {
        const userId = 'u1';
        const action = ActivityTaskType.CREATE_BUSINESS;
        
        const mockTimer = {
          id: 't1',
          taskStatus: { [action]: false },
          isActive: true,
        };
  
        timerRepo.find.mockResolvedValue([mockTimer]);
  
        await service.handleAction(userId, action);
  
        expect(mockTimer['completedAt']).toBeDefined();
        expect(timerRepo.save).toHaveBeenCalled();
      });
  });

    describe('getUserActiveTimer', () => {
      it('should auto-assign trial template if new user has no tier and no active trial', async () => {
        const user = { id: 'u1', membership: null } as any;
        
        const trialTemplate = { 
          id: 'trial-tpl', 
          type: ActivityTimerType.TRIAL,
          isPublished: true,
          durationDays: 14,
          tasks: [{ key: ActivityTaskType.CREATE_BUSINESS }]
        };
  
        // 1. check active trial (none)
        timerRepo.findOne.mockResolvedValueOnce(null); 
        // 2. find latest published trial template
        templateRepo.findOne.mockResolvedValueOnce(trialTemplate);
        // 3. assignTimerToUser calls findOne with ID
        templateRepo.findOne.mockResolvedValueOnce(trialTemplate);
        
        // Mock re-fetch and find
        timerRepo.findOne.mockResolvedValue({ id: 'new-timer', template: trialTemplate, taskStatus: {}, pauses: [], expiresAt: new Date() });
        timerRepo.find.mockResolvedValue([]);
        templateRepo.find.mockResolvedValue([]);
  
        await service.getUserActiveTimer(user);
  
        expect(templateRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { type: ActivityTimerType.TRIAL, isPublished: true } }));
        expect(timerRepo.save).toHaveBeenCalled();
      });
    });});
