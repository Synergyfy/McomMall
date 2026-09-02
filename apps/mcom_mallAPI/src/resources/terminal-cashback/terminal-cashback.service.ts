import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TerminalCashbackClaim,
  TerminalCashbackStatus,
} from './entities/terminal-cashback-claim.entity';
import { TerminalConfig } from './entities/terminal-config.entity';
import { TerminalGlobalRule } from './entities/terminal-global-rule.entity';
import { CreateTerminalCashbackClaimDto } from './dto/create-claim.dto';
import {
  CreateTerminalConfigDto,
  UpdateTerminalConfigDto,
} from './dto/config.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { CentralIntegrationService } from '../payments/services/central-integration.service';
import { CashbackEvent } from '../../common/enums/cashback-event.enum';

@Injectable()
export class TerminalCashbackService {
  constructor(
    @InjectRepository(TerminalCashbackClaim)
    private readonly claimRepository: Repository<TerminalCashbackClaim>,
    @InjectRepository(TerminalConfig)
    private readonly configRepository: Repository<TerminalConfig>,
    @InjectRepository(TerminalGlobalRule)
    private readonly ruleRepository: Repository<TerminalGlobalRule>,
    private readonly walletService: WalletService,
    private readonly centralIntegrationService: CentralIntegrationService,
  ) {}

  // --- Claims Logic ---

  async createClaim(
    userId: string,
    dto: CreateTerminalCashbackClaimDto,
  ): Promise<TerminalCashbackClaim> {
    // 1. Verify Owner Config
    const config = await this.configRepository.findOne({
      where: { userId: dto.ownerId },
    });
    if (!config) {
      throw new BadRequestException('Terminal not configured for this owner.');
    }
    if (!config.isEnabled) {
      throw new BadRequestException('This terminal is currently inactive.');
    }

    // 2. Check Daily Limits (Basic check, could be optimized with SUM query)
    // In a real app, perform a SUM query on claims for today

    // 3. Create Claim
    const claim = this.claimRepository.create({
      userId,
      ...dto,
      status: TerminalCashbackStatus.PENDING,
      riskScore: 0, // Default low risk, fraud engine would update this
    });

    return this.claimRepository.save(claim);
  }

  async getClaims(
    query: any,
  ): Promise<{ data: TerminalCashbackClaim[]; count: number }> {
    const { page = 1, limit = 10, ownerId, status, userId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [data, count] = await this.claimRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { submittedAt: 'DESC' },
      relations: ['user'],
    });

    return { data, count };
  }

  async getClaimById(id: string): Promise<TerminalCashbackClaim> {
    const claim = await this.claimRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }

  async updateClaimStatus(
    id: string,
    status: TerminalCashbackStatus,
  ): Promise<TerminalCashbackClaim> {
    const claim = await this.getClaimById(id);

    if (claim.status !== TerminalCashbackStatus.PENDING) {
      throw new BadRequestException(`Claim is already ${claim.status}`);
    }

    claim.status = status;
    claim.reviewedAt = new Date();

    const savedClaim = await this.claimRepository.save(claim);

    if (
      status === TerminalCashbackStatus.APPROVED ||
      status === TerminalCashbackStatus.AUTO_APPROVED
    ) {
      await this.walletService.creditEarning({
        userId: claim.userId,
        amount: Number(claim.amount),
        type: WalletTransactionType.EARNING_TERMINAL_CASHBACK,
        description: `Terminal Cashback from ${claim.ownerId}`,
      });

      // Sync with Mcom Central
      try {
        await this.centralIntegrationService.processCashback(
          claim.user.email,
          Number(claim.amount),
          CashbackEvent.TERMINAL_CASHBACK_CLAIM,
          `Terminal Cashback: ${claim.ownerId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync terminal cashback with Central: ${error.message}`,
        );
      }
    }

    return savedClaim;
  }

  async getStats(query: { userId?: string; ownerId?: string }) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.ownerId) where.ownerId = query.ownerId;

    const claims = await this.claimRepository.find({ where });
    const pending = claims.filter(
      (c) => c.status === TerminalCashbackStatus.PENDING,
    ).length;
    const approved = claims.filter(
      (c) =>
        c.status === TerminalCashbackStatus.APPROVED ||
        c.status === TerminalCashbackStatus.AUTO_APPROVED,
    );
    const totalEarned = approved.reduce((sum, c) => sum + Number(c.amount), 0);

    return {
      pendingCount: pending,
      approvedCount: approved.length,
      totalEarned,
    };
  }

  // --- Configuration Logic (Admin/Merchant) ---

  async createConfig(dto: CreateTerminalConfigDto): Promise<TerminalConfig> {
    const existing = await this.configRepository.findOne({
      where: { userId: dto.userId },
    });
    if (existing)
      throw new BadRequestException(
        'Configuration already exists for this owner.',
      );

    const config = this.configRepository.create(dto);
    return this.configRepository.save(config);
  }

  async getConfig(userId: string): Promise<TerminalConfig> {
    const config = await this.configRepository.findOne({ where: { userId } });
    if (!config) throw new NotFoundException('Configuration not found.');
    return config;
  }

  async getAllConfigs(
    page = 1,
    limit = 10,
  ): Promise<{ data: TerminalConfig[]; count: number }> {
    const skip = (page - 1) * limit;
    const [data, count] = await this.configRepository.findAndCount({
      skip,
      take: limit,
    });
    return { data, count };
  }

  async updateConfig(
    userId: string,
    dto: UpdateTerminalConfigDto,
  ): Promise<TerminalConfig> {
    const config = await this.getConfig(userId);
    Object.assign(config, dto);
    return this.configRepository.save(config);
  }

  // --- Global Rules Logic ---

  async updateGlobalRule(
    key: string,
    value: string,
  ): Promise<TerminalGlobalRule> {
    let rule = await this.ruleRepository.findOne({ where: { ruleKey: key } });
    if (!rule) {
      rule = this.ruleRepository.create({ ruleKey: key, value });
    } else {
      rule.value = value;
    }
    return this.ruleRepository.save(rule);
  }

  async getGlobalRules(): Promise<TerminalGlobalRule[]> {
    return this.ruleRepository.find();
  }
}
