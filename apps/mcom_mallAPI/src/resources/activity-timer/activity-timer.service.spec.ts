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

  describe('assignTimerToUser - Trial', () => {
    it('should assign a single expiration for all tasks in a trial', async () => {
      const user = { id: 'u1' } as any;
      const template = {
        id: 'tpl-trial',
        type: ActivityTimerType.TRIAL,
        durationDays: 14,
        isPublished: true,
        tasks: [
          { key: 'TASK1', title: 'T1' },
          { key: 'TASK2', title: 'T2' }
        ]
      };
      templateRepo.findOne.mockResolvedValue(template);

      await service.assignTimerToUser(user, 'tpl-trial');

      const savedTimer = timerRepo.save.mock.calls[0][0];
      expect(savedTimer.type).toBe(ActivityTimerType.TRIAL);
      expect(savedTimer.taskExpirations['TASK1']).toEqual(savedTimer.expiresAt);
      expect(savedTimer.taskExpirations['TASK2']).toEqual(savedTimer.expiresAt);
    });
  });

  describe('assignTimerToUser - General', () => {
    it('should assign individual expirations for tasks in general timer', async () => {
      const user = { id: 'u1' } as any;
      const template = {
        id: 'tpl-gen',
        type: ActivityTimerType.GENERAL,
        durationDays: 30,
        isPublished: true,
        tasks: [
          { key: 'TASK1', title: 'T1', durationDays: 5 },
          { key: 'TASK2', title: 'T2', durationDays: 10 }
        ]
      };
      templateRepo.findOne.mockResolvedValue(template);

      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      await service.assignTimerToUser(user, 'tpl-gen');

      const savedTimer = timerRepo.save.mock.calls[0][0];
      expect(savedTimer.type).toBe(ActivityTimerType.GENERAL);
      
      const expectedExp1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const expectedExp2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      
      expect(savedTimer.taskExpirations['TASK1'].getTime()).toBe(expectedExp1.getTime());
      expect(savedTimer.taskExpirations['TASK2'].getTime()).toBe(expectedExp2.getTime());

      jest.useRealTimers();
    });
  });

  describe('handleAction - Auto Completion', () => {
    it('should NOT auto-complete OTHER tasks', async () => {
      const userId = 'u1';
      const action = ActivityTaskType.OTHER;
      
      const mockTimer = {
        id: 't1',
        template: {
            tasks: [{ key: ActivityTaskType.OTHER, title: 'Other Task' }]
        },
        taskStatus: { [ActivityTaskType.OTHER]: false },
        isActive: true,
      };

      timerRepo.find.mockResolvedValue([mockTimer]);

      await service.handleAction(userId, action);

      expect(mockTimer.taskStatus[action]).toBe(false);
      expect(timerRepo.save).not.toHaveBeenCalled();
    });

    it('should auto-complete regular tasks', async () => {
        const userId = 'u1';
        const action = ActivityTaskType.CREATE_BUSINESS;
        
        const mockTimer = {
          id: 't1',
          template: {
              tasks: [{ key: ActivityTaskType.CREATE_BUSINESS, title: 'Create Biz' }]
          },
          taskStatus: { [ActivityTaskType.CREATE_BUSINESS]: false },
          isActive: true,
        };
  
        timerRepo.find.mockResolvedValue([mockTimer]);
  
        await service.handleAction(userId, action);
  
        expect(mockTimer.taskStatus[action]).toBe(true);
        expect(timerRepo.save).toHaveBeenCalled();
      });
  });

  describe('completeTask - Manual Completion', () => {
    it('should allow manual completion of OTHER tasks even if expired', async () => {
      const userId = 'u1';
      const taskKey = 'OTHER_TASK';
      
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 5);

      const mockTimer = {
        id: 't1',
        type: ActivityTimerType.GENERAL,
        template: {
            name: 'Gen Tpl',
            description: 'Desc',
            tasks: [{ key: 'OTHER_TASK', title: 'Other' }]
        },
        taskStatus: { 'OTHER_TASK': false },
        taskExpirations: { 'OTHER_TASK': expiredDate },
        expiresAt: new Date(Date.now() + 86400000),
        pauses: [],
        isActive: true,
      };

      timerRepo.find.mockResolvedValue([mockTimer]);
      templateRepo.find.mockResolvedValue([]); // For eligibleGeneralTemplates
      timerRepo.manager.findOne.mockResolvedValue({ id: userId }); // user for getUserActiveTimer

      await service.completeTask(userId, 'OTHER_TASK');

      expect(mockTimer.taskStatus['OTHER_TASK']).toBe(true);
      expect(timerRepo.save).toHaveBeenCalled();
    });
  });
});