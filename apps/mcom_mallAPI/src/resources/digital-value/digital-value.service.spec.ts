import { Test, TestingModule } from '@nestjs/testing';
import { DigitalValueService } from './digital-value.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DigitalValue, DigitalValueStatus, DigitalValueType } from './entities/digital-value.entity';
import { DigitalValueTransaction, DigitalValueTransactionType, DigitalValueTransactionStatus } from './entities/digital-value-transaction.entity';
import { Business } from '../listings/entities/listing.entity';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DigitalValueService', () => {
  let service: DigitalValueService;
  let digitalValueRepository: Repository<DigitalValue>;
  let transactionRepository: Repository<DigitalValueTransaction>;
  let businessRepository: Repository<Business>;
  let dataSource: DataSource;

  const mockDigitalValueRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockBusinessRepository = {
    findOne: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigitalValueService,
        {
          provide: getRepositoryToken(DigitalValue),
          useValue: mockDigitalValueRepository,
        },
        {
          provide: getRepositoryToken(DigitalValueTransaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Business),
          useValue: mockBusinessRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DigitalValueService>(DigitalValueService);
    digitalValueRepository = module.get<Repository<DigitalValue>>(getRepositoryToken(DigitalValue));
    transactionRepository = module.get<Repository<DigitalValueTransaction>>(getRepositoryToken(DigitalValueTransaction));
    businessRepository = module.get<Repository<Business>>(getRepositoryToken(Business));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new digital value', async () => {
      const dto = { initialBalance: 100, type: DigitalValueType.GIFT_CARD };
      const createdValue = { ...dto, id: '1', status: DigitalValueStatus.DRAFT, currentBalance: 0 };

      mockDigitalValueRepository.create.mockReturnValue(createdValue);
      mockDigitalValueRepository.save.mockResolvedValue(createdValue);

      const result = await service.create(dto);

      expect(result).toEqual(createdValue);
      expect(mockDigitalValueRepository.create).toHaveBeenCalled();
      expect(mockDigitalValueRepository.save).toHaveBeenCalled();
    });
  });

  describe('fund', () => {
    it('should fund a digital value', async () => {
      const id = '1';
      const amount = 100;
      const digitalValue = {
          id,
          currentBalance: 0,
          initialBalance: 100,
          status: DigitalValueStatus.DRAFT
      };

      mockDigitalValueRepository.findOne.mockResolvedValue(digitalValue);
      mockDigitalValueRepository.save.mockResolvedValue({ ...digitalValue, currentBalance: 100, status: DigitalValueStatus.ACTIVE });
      mockTransactionRepository.create.mockReturnValue({});
      mockTransactionRepository.save.mockResolvedValue({});

      const result = await service.fund(id, amount);

      expect(mockDigitalValueRepository.findOne).toHaveBeenCalledWith({ where: { id }, relations: ['merchant', 'owner', 'purchaser'] });
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
          amount,
          type: DigitalValueTransactionType.FUND
      }));
      expect(mockDigitalValueRepository.save).toHaveBeenCalled();
    });
  });

  describe('redeem', () => {
    it('should redeem successfully', async () => {
      const id = '1';
      const amount = 50;
      const digitalValue = {
          id,
          currentBalance: 100,
          status: DigitalValueStatus.ACTIVE
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(digitalValue);
      mockQueryRunner.manager.save.mockImplementation((entity) => Promise.resolve(entity));
      mockTransactionRepository.create.mockReturnValue({});

      const result = await service.redeem(id, amount);

      expect(mockQueryRunner.manager.findOne).toHaveBeenCalled();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith(expect.objectContaining({
          amount,
          type: DigitalValueTransactionType.REDEEM
      }));
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should fail if insufficient balance', async () => {
      const id = '1';
      const amount = 150;
      const digitalValue = {
          id,
          currentBalance: 100,
          status: DigitalValueStatus.ACTIVE
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(digitalValue);

      await expect(service.redeem(id, amount)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should fail if expired', async () => {
        const id = '1';
        const digitalValue = {
            id,
            currentBalance: 100,
            status: DigitalValueStatus.ACTIVE,
            expiryDate: new Date(Date.now() - 10000) // Expired
        };

        mockQueryRunner.manager.findOne.mockResolvedValue(digitalValue);

        await expect(service.redeem(id, 50)).rejects.toThrow(BadRequestException);
        expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should fail if merchant mismatch', async () => {
        const id = '1';
        const digitalValue = {
            id,
            currentBalance: 100,
            status: DigitalValueStatus.ACTIVE,
            merchantId: 'merchantA'
        };

        mockQueryRunner.manager.findOne.mockResolvedValue(digitalValue);

        await expect(service.redeem(id, 50, 'merchantB')).rejects.toThrow(BadRequestException);
        expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('linkMerchant', () => {
      it('should link a merchant', async () => {
          const id = '1';
          const merchantId = 'm1';
          const digitalValue = { id };
          const merchant = { id: merchantId };

          mockDigitalValueRepository.findOne.mockResolvedValue(digitalValue);
          mockBusinessRepository.findOne.mockResolvedValue(merchant);
          mockDigitalValueRepository.save.mockResolvedValue({ ...digitalValue, merchant });

          const result = await service.linkMerchant(id, merchantId);

          expect(result.merchant).toEqual(merchant);
      });
  });
});
