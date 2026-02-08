import { Test, TestingModule } from '@nestjs/testing';
import { ListingsService } from './listing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Business } from './entities/listing.entity';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ActivitiesService } from '../activities/activities.service';
import { TrialService } from '../trial/trial.service';
import { PromotionService } from '../promotion/promotion.service';
import { Trial } from '../payments/entities/trial.entity';

describe('ListingsService', () => {
  let service: ListingsService;
  let trialRepository: Repository<Trial>;
  let trialService: TrialService;
  let userRepository: Repository<User>;
  let businessRepository: Repository<Business>;
  let dataSource: DataSource;

  const mockTrialRepository = {
    findOne: jest.fn(),
  };

  const mockTrialService = {
    markTaskAsCompleted: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockBusinessRepository = {
    create: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      find: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Trial),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                save: jest.fn(),
              },
            })),
          },
        },
        {
          provide: ActivitiesService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: TrialService,
          useValue: {
            markTaskAsCompleted: jest.fn(),
          },
        },
        {
          provide: PromotionService,
          useValue: {
            findUserPromotions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
