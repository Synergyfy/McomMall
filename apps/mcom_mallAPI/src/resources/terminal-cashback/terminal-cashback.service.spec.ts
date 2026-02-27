import { Test, TestingModule } from '@nestjs/testing';
import { TerminalCashbackService } from './terminal-cashback.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  TerminalCashbackClaim,
  TerminalCashbackStatus,
} from './entities/terminal-cashback-claim.entity';
import { TerminalConfig } from './entities/terminal-config.entity';
import { TerminalGlobalRule } from './entities/terminal-global-rule.entity';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
});

const mockWalletService = () => ({
  creditEarning: jest.fn(),
});

const mockCentralService = () => ({
  processCashback: jest.fn().mockResolvedValue({}),
});

describe('TerminalCashbackService', () => {
  let service: TerminalCashbackService;
  let claimRepository: Repository<TerminalCashbackClaim>;
  let configRepository: Repository<TerminalConfig>;
  let walletService: WalletService;
  let centralService: CentralIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerminalCashbackService,
        {
          provide: getRepositoryToken(TerminalCashbackClaim),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(TerminalConfig),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(TerminalGlobalRule),
          useFactory: mockRepository,
        },
        { provide: WalletService, useFactory: mockWalletService },
        { provide: CentralIntegrationService, useFactory: mockCentralService },
      ],
    }).compile();

    service = module.get<TerminalCashbackService>(TerminalCashbackService);
    claimRepository = module.get(getRepositoryToken(TerminalCashbackClaim));
    configRepository = module.get(getRepositoryToken(TerminalConfig));
    walletService = module.get<WalletService>(WalletService);
    centralService = module.get<CentralIntegrationService>(
      CentralIntegrationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createClaim', () => {
    it('should create and save a new claim if terminal enabled', async () => {
      const dto = {
        ownerId: 'OWNER1',
        amount: 10,
        proofUrl: 'http://url',
        spendAmount: 100,
      };
      const userId = 'user1';
      const expectedClaim = {
        ...dto,
        userId,
        status: TerminalCashbackStatus.PENDING,
        riskScore: 0,
      };

      // Mock Config Check
      jest
        .spyOn(configRepository, 'findOne')
        .mockResolvedValue({ isEnabled: true } as any);

      jest
        .spyOn(claimRepository, 'create')
        .mockReturnValue(expectedClaim as any);
      jest
        .spyOn(claimRepository, 'save')
        .mockResolvedValue(expectedClaim as any);

      const result = await service.createClaim(userId, dto);
      expect(result).toEqual(expectedClaim);
      expect(claimRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          ...dto,
          status: TerminalCashbackStatus.PENDING,
        }),
      );
    });

    it('should throw error if terminal not found or disabled', async () => {
      jest.spyOn(configRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.createClaim('u1', { ownerId: 'x', amount: 10 }),
      ).rejects.toThrow();
    });
  });

  describe('updateClaimStatus', () => {
    it('should approve claim and credit wallet and sync with central', async () => {
      const claim = {
        id: 'c1',
        userId: 'u1',
        amount: 10,
        ownerId: 'o1',
        status: TerminalCashbackStatus.PENDING,
        user: { email: 'test@test.com' },
      };
      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(claim as any);
      jest.spyOn(claimRepository, 'save').mockResolvedValue({
        ...claim,
        status: TerminalCashbackStatus.APPROVED,
      } as any);

      await service.updateClaimStatus('c1', TerminalCashbackStatus.APPROVED);

      expect(walletService.creditEarning).toHaveBeenCalledWith({
        userId: 'u1',
        amount: 10,
        type: WalletTransactionType.EARNING_TERMINAL_CASHBACK,
        description: 'Terminal Cashback from o1',
      });

      expect(centralService.processCashback).toHaveBeenCalledWith(
        'test@test.com',
        10,
        expect.any(String),
        expect.stringContaining('o1'),
      );
    });

    it('should not credit wallet if rejected', async () => {
      const claim = {
        id: 'c1',
        userId: 'u1',
        amount: 10,
        ownerId: 'o1',
        status: TerminalCashbackStatus.PENDING,
      };
      jest.spyOn(claimRepository, 'findOne').mockResolvedValue(claim as any);
      jest.spyOn(claimRepository, 'save').mockResolvedValue({
        ...claim,
        status: TerminalCashbackStatus.REJECTED,
      } as any);

      await service.updateClaimStatus('c1', TerminalCashbackStatus.REJECTED);

      expect(walletService.creditEarning).not.toHaveBeenCalled();
    });
  });
});
