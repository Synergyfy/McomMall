import { Test, TestingModule } from '@nestjs/testing';
import { DigitalValueService } from './digital-value.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DigitalValueMaster } from './entities/digital-value-master.entity';
import { DigitalValueTransaction } from './entities/digital-value-transaction.entity';
import { RewardLinkage } from './entities/reward-linkage.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { DigitalValueType, DigitalValueStatus, DigitalValueTransactionType } from './digital-value.enums';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('DigitalValueService', () => {
  let service: DigitalValueService;
  let digitalValueRepository: Repository<DigitalValueMaster>;
  let transactionRepository: Repository<DigitalValueTransaction>;
  let userRepository: Repository<User>;
  let businessRepository: Repository<Business>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn().mockImplementation((entityOrTarget, entity) => Promise.resolve({ id: '1', ...(entity || entityOrTarget) })),
        findOne: jest.fn(),
        create: jest.fn().mockImplementation((target, data) => data),
      },
    } as any;

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalValueService,
        {
          provide: getRepositoryToken(DigitalValueMaster),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DigitalValueTransaction),
          useValue: {
             create: jest.fn(),
             save: jest.fn(),
             find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RewardLinkage),
          useValue: {
             create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
             findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Business),
          useValue: {
             findOneBy: jest.fn(),
             findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DigitalValueService>(DigitalValueService);
    digitalValueRepository = module.get(getRepositoryToken(DigitalValueMaster));
    transactionRepository = module.get(getRepositoryToken(DigitalValueTransaction));
    userRepository = module.get(getRepositoryToken(User));
    businessRepository = module.get(getRepositoryToken(Business));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a digital value instrument', async () => {
      const createDto = {
        type: DigitalValueType.GIFT_CARD,
        initialValue: 100,
      };
      const ownerId = 'user-1';

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({ id: ownerId } as User);

      const result = await service.create(createDto, ownerId);

      expect(result).toBeDefined();
      expect(queryRunner.manager.save).toHaveBeenCalled(); // Saves master
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2); // master + transaction
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw if owner not found', async () => {
       jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
       await expect(service.create({ type: DigitalValueType.GIFT_CARD, initialValue: 100 }, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('redeem', () => {
      it('should redeem successfully', async () => {
          const id = 'dv-1';
          const dto = { amount: 50, merchantId: 'm-1' };
          const dv = {
              id,
              currentBalance: 100,
              status: DigitalValueStatus.ACTIVE,
              merchantId: 'm-1'
          };

          (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(dv);

          await service.redeem(id, dto);

          expect(dv.currentBalance).toBe(50);
          expect(dv.status).toBe(DigitalValueStatus.PARTIALLY_REDEEMED);
          // Check that save was called with the entity type and the entity
          expect(queryRunner.manager.save).toHaveBeenCalledWith(DigitalValueMaster, dv);
          expect(queryRunner.commitTransaction).toHaveBeenCalled();
      });

      it('should fail if insufficient balance', async () => {
          const id = 'dv-1';
          const dto = { amount: 150, merchantId: 'm-1' };
          const dv = {
              id,
              currentBalance: 100,
              status: DigitalValueStatus.ACTIVE
          };

          (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(dv);

          await expect(service.redeem(id, dto)).rejects.toThrow(BadRequestException);
          expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      });

      it('should fail if merchant mismatch', async () => {
          const id = 'dv-1';
          const dto = { amount: 50, merchantId: 'm-2' };
          const dv = {
              id,
              currentBalance: 100,
              status: DigitalValueStatus.ACTIVE,
              merchantId: 'm-1'
          };

          (queryRunner.manager.findOne as jest.Mock).mockResolvedValue(dv);

          await expect(service.redeem(id, dto)).rejects.toThrow(BadRequestException);
      });
  });
});
