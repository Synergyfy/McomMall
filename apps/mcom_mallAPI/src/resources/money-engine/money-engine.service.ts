import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, LessThanOrEqual } from 'typeorm';
import {
  RewardDefinition,
  ScopeType,
} from './entities/reward-definition.entity';
import { UserVoucher, VoucherState } from './entities/user-voucher.entity';
import {
  TransactionSourceType,
  VoucherTransaction,
} from './entities/voucher-transaction.entity';
import {
  CashbackInjectionDto,
  CreateRewardDefinitionDto,
  PurchaseVoucherDto,
  SpendDto,
  UpdateRewardDefinitionDto,
} from './dto/dtos';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { customAlphabet } from 'nanoid';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { PaymentGateway } from '../payments/enums/payment-gateway.enum';
import { PaymentHistory } from '../payments/entities/payment-history.entity';
import { PaymentPurpose } from '../payments/enums/payment-purpose.enum';

const generateVoucherCode = customAlphabet(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  12,
);

@Injectable()
export class MoneyEngineService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly paymentProviderService: PaymentProviderService,
  ) {}

  // --- Admin: Create Definition ---
  async createRewardDefinition(
    dto: CreateRewardDefinitionDto,
  ): Promise<RewardDefinition> {
    const { validShopIds, ...rest } = dto;
    const definition = new RewardDefinition();
    Object.assign(definition, rest);

    if (validShopIds) {
      definition.validShops = validShopIds.map((id) => ({ id }) as Business);
    }

    return await this.dataSource.manager.save(definition);
  }

  // --- Admin: Update Definition ---
  async updateRewardDefinition(
    id: string,
    dto: UpdateRewardDefinitionDto,
  ): Promise<RewardDefinition> {
    const definition = await this.dataSource.manager.findOne(RewardDefinition, {
      where: { id },
      relations: ['validShops'],
    });

    if (!definition) {
      throw new NotFoundException('Reward Definition not found');
    }

    const { validShopIds, ...rest } = dto;
    Object.assign(definition, rest);

    if (validShopIds) {
      definition.validShops = validShopIds.map((id) => ({ id }) as Business);
    }

    return await this.dataSource.manager.save(definition);
  }

  // --- Logic 1: The "Split" Injection (Creation) ---
  async purchaseVoucher(
    userId: string,
    dto: PurchaseVoucherDto,
  ): Promise<UserVoucher> {
    // 1. Verify Payment with Provider
    const currency = 'gbp'; // Default currency for now
    let verification: { ok: boolean; reason?: string };

    if (dto.paymentGateway === PaymentGateway.STRIPE) {
      verification =
        await this.paymentProviderService.verifyStripePaymentIntent(
          dto.transactionId,
          dto.paymentAmount,
          currency,
        );
    } else if (dto.paymentGateway === PaymentGateway.PAYPAL) {
      verification =
        await this.paymentProviderService.captureAndVerifyPaypalOrder(
          dto.transactionId,
          dto.paymentAmount,
          currency,
        );
    } else {
      throw new BadRequestException('Unsupported payment gateway');
    }

    if (!verification.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verification.reason}`,
      );
    }

    // 2. Proceed with Voucher Creation
    return await this.dataSource.transaction(async (manager) => {
      // Idempotency check: if payment with transactionId already processed, return existing voucher
      const existingHistory = await manager.findOne(PaymentHistory, {
        where: { transactionId: dto.transactionId },
      });
      if (existingHistory) {
        const existingVoucher = await manager.findOne(UserVoucher, {
          where: { owner: { id: userId } },
          order: { created_at: 'DESC' },
        });
        if (existingVoucher) return existingVoucher;
      }

      const definition = await manager.findOne(RewardDefinition, {
        where: { id: dto.rewardDefinitionId },
      });

      if (!definition) {
        throw new NotFoundException('Reward Definition not found');
      }

      if (!definition.isActive) {
        throw new BadRequestException(
          'This reward definition is currently inactive',
        );
      }

      // Calculate Split
      const realRatio = definition.splitRatio.real;
      if (realRatio <= 0 || realRatio > 1) {
        throw new BadRequestException('Invalid Real Ratio configuration');
      }

      const totalValue = parseFloat((dto.paymentAmount / realRatio).toFixed(2));
      const rewardAmount = parseFloat(
        (totalValue - dto.paymentAmount).toFixed(2),
      );

      // Create Voucher
      const voucher = new UserVoucher();
      voucher.owner = { id: userId } as User;
      voucher.definition = definition;
      voucher.code = generateVoucherCode();
      voucher.realBalance = dto.paymentAmount;
      voucher.rewardBalance = rewardAmount;
      voucher.state = VoucherState.ACTIVE;

      const savedVoucher = await manager.save(voucher);

      // Record Transactions
      // 1. Audit Table (General Payment History)
      const paymentHistory = new PaymentHistory();
      paymentHistory.user = { id: userId } as User;
      paymentHistory.amountPaid = dto.paymentAmount;
      paymentHistory.transactionId = dto.transactionId;
      paymentHistory.paymentGateway = dto.paymentGateway;
      paymentHistory.purpose = PaymentPurpose.VOUCHER_PURCHASE;
      paymentHistory.currency = currency;
      await manager.save(paymentHistory);

      // 2. Voucher Internal Transactions (Wallet)
      const txDeposit = new VoucherTransaction();
      txDeposit.voucher = savedVoucher;
      txDeposit.sourceType = TransactionSourceType.USER_DEPOSIT;
      txDeposit.contributorId = userId;
      txDeposit.amount = dto.paymentAmount;
      txDeposit.realAmountDelta = dto.paymentAmount;
      txDeposit.rewardAmountDelta = 0;
      await manager.save(txDeposit);

      const txReward = new VoucherTransaction();
      txReward.voucher = savedVoucher;
      txReward.sourceType = TransactionSourceType.SYSTEM_REWARD;
      txReward.contributorId = 'SYSTEM';
      txReward.amount = rewardAmount;
      txReward.realAmountDelta = 0;
      txReward.rewardAmountDelta = rewardAmount;
      await manager.save(txReward);

      return savedVoucher;
    });
  }

  // --- Logic 2: The "Cashback" Loop (The Trigger) ---
  async injectCashback(dto: CashbackInjectionDto): Promise<UserVoucher> {
    return await this.dataSource.transaction(async (manager) => {
      const voucher = await manager.findOne(UserVoucher, {
        where: { id: dto.userVoucherId },
        relations: ['definition', 'definition.validShops'],
      });

      if (!voucher) {
        throw new NotFoundException('User Voucher not found');
      }

      if (voucher.state !== VoucherState.ACTIVE) {
        throw new BadRequestException('Voucher is not active');
      }

      // Verify if shop is allowed to give cashback (reuse scope logic or allow all?)
      // Usually, any shop can give cashback if they are part of the ecosystem,
      // but strictly, maybe only valid shops for that voucher?
      // For now, we assume the shop must be valid for the voucher to interact with it.
      await this.validateScope(manager, voucher.definition, dto.shopId);

      const amount = Number(dto.amount);
      voucher.rewardBalance = Number(voucher.rewardBalance) + amount;

      await manager.save(voucher);

      const tx = new VoucherTransaction();
      tx.voucher = voucher;
      tx.sourceType = TransactionSourceType.BUSINESS_CASHBACK;
      tx.contributorId = dto.shopId;
      tx.amount = amount;
      tx.realAmountDelta = 0;
      tx.rewardAmountDelta = amount;

      await manager.save(tx);

      return voucher;
    });
  }

  // --- Logic 3: The Spending Guard (The Lock) ---
  async spend(dto: SpendDto): Promise<UserVoucher> {
    return await this.dataSource.transaction(async (manager) => {
      const voucher = await manager.findOne(UserVoucher, {
        where: { id: dto.userVoucherId },
        relations: ['definition', 'definition.validShops'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!voucher) {
        throw new NotFoundException('User Voucher not found');
      }

      if (voucher.state !== VoucherState.ACTIVE) {
        throw new BadRequestException('Voucher is not active');
      }

      if (!voucher.definition) {
        throw new BadRequestException('Voucher definition missing');
      }

      await this.validateScope(manager, voucher.definition, dto.shopId);

      const totalBalance =
        Number(voucher.realBalance) + Number(voucher.rewardBalance);
      const spendAmount = Number(dto.amount);

      if (totalBalance < spendAmount) {
        throw new BadRequestException('Insufficient funds');
      }

      let realDeduction = 0;
      let rewardDeduction = 0;

      const realBal = Number(voucher.realBalance);
      const rewardBal = Number(voucher.rewardBalance);
      const strategy = voucher.definition.burnStrategy;

      if (strategy === 'reward_first') {
        if (rewardBal >= spendAmount) {
          rewardDeduction = spendAmount;
        } else {
          rewardDeduction = rewardBal;
          realDeduction = spendAmount - rewardBal;
        }
      } else {
        if (realBal >= spendAmount) {
          realDeduction = spendAmount;
        } else {
          realDeduction = realBal;
          rewardDeduction = spendAmount - realBal;
        }
      }

      const salesImpactBefore = 0;

      voucher.realBalance = realBal - realDeduction;
      voucher.rewardBalance = rewardBal - rewardDeduction;

      if (voucher.realBalance + voucher.rewardBalance <= 0) {
        voucher.state = VoucherState.DEPLETED;
      }

      await manager.save(voucher);

      const tx = new VoucherTransaction();
      tx.voucher = voucher;
      tx.sourceType = TransactionSourceType.SPEND;
      tx.contributorId = dto.shopId;
      tx.amount = -spendAmount;
      tx.realAmountDelta = -realDeduction;
      tx.rewardAmountDelta = -rewardDeduction;
      tx.salesImpactBefore = salesImpactBefore;
      tx.salesImpactAfter = salesImpactBefore + spendAmount;

      await manager.save(tx);

      return voucher;
    });
  }

  async transfer(
    fromVoucherId: string,
    toVoucherId: string,
    amount: number,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const from = await manager.findOne(UserVoucher, {
        where: { id: fromVoucherId },
        lock: { mode: 'pessimistic_write' },
      });
      const to = await manager.findOne(UserVoucher, {
        where: { id: toVoucherId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!from || !to) throw new NotFoundException('Voucher not found');
      if (from.totalBalance < amount)
        throw new BadRequestException('Insufficient funds');

      const total = from.totalBalance;
      const realRatio = Number(from.realBalance) / total;
      const realToMove = parseFloat((amount * realRatio).toFixed(2));
      const rewardToMove = parseFloat((amount - realToMove).toFixed(2));

      from.realBalance = Number(from.realBalance) - realToMove;
      from.rewardBalance = Number(from.rewardBalance) - rewardToMove;
      to.realBalance = Number(to.realBalance) + realToMove;
      to.rewardBalance = Number(to.rewardBalance) + rewardToMove;

      await manager.save([from, to]);

      const txFrom = new VoucherTransaction();
      txFrom.voucher = from;
      txFrom.sourceType = TransactionSourceType.PEER_TRANSFER;
      txFrom.amount = -amount;
      txFrom.realAmountDelta = -realToMove;
      txFrom.rewardAmountDelta = -rewardToMove;

      const txTo = new VoucherTransaction();
      txTo.voucher = to;
      txTo.sourceType = TransactionSourceType.PEER_TRANSFER;
      txTo.amount = amount;
      txTo.realAmountDelta = realToMove;
      txTo.rewardAmountDelta = rewardToMove;

      await manager.save([txFrom, txTo]);
    });
  }

  async getUserVouchers(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: UserVoucher[]; count: number }> {
    const [data, count] = await this.dataSource.manager.findAndCount(
      UserVoucher,
      {
        where: { owner: { id: userId } },
        relations: ['definition'],
        order: { created_at: 'DESC' } as any,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
    );
    return { data, count };
  }

  // --- ADMIN METHODS ---

  async getAllVouchers(
    pagination: PaginationQueryDto,
  ): Promise<{ data: UserVoucher[]; count: number }> {
    const [data, count] = await this.dataSource.manager.findAndCount(
      UserVoucher,
      {
        relations: ['definition', 'owner'],
        order: { created_at: 'DESC' } as any,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
    );
    return { data, count };
  }

  // --- DISCOVERY METHODS ---

  /**
   * For Customers: List all active voucher types they can purchase.
   */
  async getPublicDefinitions(
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    const [data, count] = await this.dataSource.manager.findAndCount(
      RewardDefinition,
      {
        where: { isActive: true },
        order: { created_at: 'DESC' } as any,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
    );
    return { data, count };
  }

  /**
   * For Businesses: List all voucher types that are accepted at their shop.
   * Logic:
   * 1. Include ALL definitions where scopeType = ANY_SHOP
   * 2. Include definitions where scopeType = SPECIFIC_SHOPS AND shopId is in validShops
   */
  async getDefinitionsForShop(
    shopId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    const qb = this.dataSource.manager
      .createQueryBuilder(RewardDefinition, 'rd')
      .leftJoin('rd.validShops', 'shop')
      .where('rd.isActive = :isActive', { isActive: true })
      .andWhere(
        '(rd.scopeType = :anyScope OR (rd.scopeType IN (:...specificScopes) AND shop.id = :shopId))',
        {
          isActive: true,
          anyScope: ScopeType.ANY_SHOP,
          specificScopes: [
            ScopeType.SPECIFIC_SHOPS,
            ScopeType.EXPO_ONLY,
            ScopeType.CAMPAIGN_ONLY,
          ],
          shopId,
        },
      )
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('rd.created_at', 'DESC');

    const [data, count] = await qb.getManyAndCount();
    return { data, count };
  }

  /**
   * For Business Owners: List all voucher types that are accepted at ANY of their shops.
   */
  async getDefinitionsForOwner(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    // 1. Get all shops owned by this user
    const shops = await this.dataSource.manager.find(Business, {
      where: { user: { id: userId } },
      select: ['id'],
    });

    const shopIds = shops.map((s) => s.id);

    if (shopIds.length === 0) {
      // If they own no shops, they still see global vouchers
      return this.getPublicDefinitions(pagination);
    }

    const qb = this.dataSource.manager
      .createQueryBuilder(RewardDefinition, 'rd')
      .leftJoin('rd.validShops', 'shop')
      .where('rd.isActive = :isActive', { isActive: true })
      .andWhere(
        '(rd.scopeType = :anyScope OR (rd.scopeType IN (:...specificScopes) AND shop.id IN (:...shopIds)))',
        {
          isActive: true,
          anyScope: ScopeType.ANY_SHOP,
          specificScopes: [
            ScopeType.SPECIFIC_SHOPS,
            ScopeType.EXPO_ONLY,
            ScopeType.CAMPAIGN_ONLY,
          ],
          shopIds,
        },
      )
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('rd.created_at', 'DESC');

    const [data, count] = await qb.getManyAndCount();
    return { data, count };
  }

  async getAllDefinitions(
    pagination: PaginationQueryDto,
  ): Promise<{ data: RewardDefinition[]; count: number }> {
    const [data, count] = await this.dataSource.manager.findAndCount(
      RewardDefinition,
      {
        order: { created_at: 'DESC' } as any,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      },
    );
    return { data, count };
  }

  // --- CUSTOMER ANALYTICS ---

  async getCustomerStats(userId: string): Promise<any> {
    // 1. Current Snapshot (Active Vouchers)
    const { sumReal, sumReward, countActive } = await this.dataSource.manager
      .createQueryBuilder(UserVoucher, 'uv')
      .select('SUM(uv.realBalance)', 'sumReal')
      .addSelect('SUM(uv.rewardBalance)', 'sumReward')
      .addSelect('COUNT(uv.id)', 'countActive')
      .where('uv.ownerId = :userId', { userId })
      .andWhere('uv.state = :state', { state: VoucherState.ACTIVE })
      .getRawOne();

    const currentRealBalance = parseFloat(sumReal || 0);
    const currentRewardBalance = parseFloat(sumReward || 0);
    const activeVouchersCount = parseInt(countActive || 0, 10);

    // 2. Lifetime Business Rewards (Cashback received from shops)
    const businessRewards = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .innerJoin('tx.voucher', 'voucher')
      .select('SUM(tx.rewardAmountDelta)', 'sum')
      .where('voucher.ownerId = :userId', { userId })
      .andWhere('tx.sourceType = :type', {
        type: TransactionSourceType.BUSINESS_CASHBACK,
      })
      .getRawOne();

    const totalBusinessRewardsReceived = parseFloat(businessRewards?.sum || 0);

    // 3. Lifetime Spend
    const totalSpentResult = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .innerJoin('tx.voucher', 'voucher')
      .select('SUM(ABS(tx.amount))', 'sum') // Use ABS because spend is negative
      .where('voucher.ownerId = :userId', { userId })
      .andWhere('tx.sourceType = :type', { type: TransactionSourceType.SPEND })
      .getRawOne();

    const totalSpent = parseFloat(totalSpentResult?.sum || 0);

    return {
      activeVouchersCount,
      totalCurrentBalance: currentRealBalance + currentRewardBalance,
      currentRealBalance,
      currentRewardBalance,
      totalBusinessRewardsReceived,
      totalSpent,
    };
  }

  // --- BUSINESS ANALYTICS ---

  async getBusinessStatsForUser(userId: string): Promise<any> {
    const business = await this.dataSource.manager.findOne(Business, {
      where: { user: { id: userId } },
    });

    if (!business) {
      throw new NotFoundException('No business found for this user.');
    }

    return this.getBusinessStats(business.id);
  }

  async getBusinessStats(shopId: string): Promise<any> {
    // 1. Total spent in this shop via vouchers
    const spentResult = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .select('SUM(ABS(tx.amount))', 'sum')
      .where('tx.sourceType = :type', { type: TransactionSourceType.SPEND })
      .andWhere('tx.contributorId = :shopId', { shopId })
      .getRawOne();

    const totalSpent = parseFloat(spentResult?.sum || 0);

    // 2. Count of distinct vouchers used (Customers)
    const customersResult = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .select('COUNT(DISTINCT tx.voucherId)', 'count')
      .where('tx.contributorId = :shopId', { shopId })
      .getRawOne();

    const customersCount = parseInt(customersResult?.count || 0, 10);

    // 3. Count of cashback given
    const cashbackResult = await this.dataSource.manager
      .createQueryBuilder(VoucherTransaction, 'tx')
      .select('COUNT(*)', 'count')
      .where('tx.sourceType = :type', {
        type: TransactionSourceType.BUSINESS_CASHBACK,
      })
      .andWhere('tx.contributorId = :shopId', { shopId })
      .getRawOne();

    return {
      totalSpentInShop: totalSpent,
      customersCount: customersCount,
      cashbackGivenCount: parseInt(cashbackResult?.count || 0, 10),
    };
  }

  async getAdminAnalytics(): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const activeVouchersCount = await this.dataSource.manager.count(
      UserVoucher,
      {
        where: { state: VoucherState.ACTIVE },
      },
    );

    const activeVouchersPrev = await this.dataSource.manager.count(
      UserVoucher,
      {
        where: {
          state: VoucherState.ACTIVE,
          created_at: LessThanOrEqual(thirtyDaysAgo) as any,
        },
      },
    );

    const getDepositSum = async (startDate: Date, endDate: Date) => {
      const result = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(tx.amount)', 'sum')
        .where('tx.sourceType = :type', {
          type: TransactionSourceType.USER_DEPOSIT,
        })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();
      return parseFloat(result?.sum || 0);
    };

    const realMoneyCurrent = await getDepositSum(thirtyDaysAgo, now);
    const realMoneyPrev = await getDepositSum(sixtyDaysAgo, thirtyDaysAgo);

    const getRewardSum = async (startDate: Date, endDate: Date) => {
      const result = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(tx.rewardAmountDelta)', 'sum')
        .where('tx.sourceType IN (:...types)', {
          types: [
            TransactionSourceType.SYSTEM_REWARD,
            TransactionSourceType.BUSINESS_CASHBACK,
          ],
        })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();
      return parseFloat(result?.sum || 0);
    };

    const rewardsCurrent = await getRewardSum(thirtyDaysAgo, now);
    const rewardsPrev = await getRewardSum(sixtyDaysAgo, thirtyDaysAgo);

    const getUtilizationMetrics = async (startDate: Date, endDate: Date) => {
      const spent = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(ABS(tx.amount))', 'sum')
        .where('tx.sourceType = :type', { type: TransactionSourceType.SPEND })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();

      const issued = await this.dataSource.manager
        .createQueryBuilder(VoucherTransaction, 'tx')
        .select('SUM(tx.amount)', 'sum')
        .where('tx.sourceType IN (:...types)', {
          types: [
            TransactionSourceType.USER_DEPOSIT,
            TransactionSourceType.SYSTEM_REWARD,
            TransactionSourceType.BUSINESS_CASHBACK,
          ],
        })
        .andWhere('tx.created_at BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        })
        .getRawOne();

      const spentVal = parseFloat(spent?.sum || 0);
      const issuedVal = parseFloat(issued?.sum || 0);

      return issuedVal > 0 ? (spentVal / issuedVal) * 100 : 0;
    };

    const utilCurrent = await getUtilizationMetrics(thirtyDaysAgo, now);
    const utilPrev = await getUtilizationMetrics(sixtyDaysAgo, thirtyDaysAgo);

    const calculateChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - prev) / prev) * 100).toFixed(2));
    };

    return {
      activeVouchers: {
        value: activeVouchersCount,
        percentageChange: calculateChange(
          activeVouchersCount,
          activeVouchersPrev,
        ),
      },
      realMoneyInput: {
        value: realMoneyCurrent,
        percentageChange: calculateChange(realMoneyCurrent, realMoneyPrev),
      },
      rewardValueGiven: {
        value: rewardsCurrent,
        percentageChange: calculateChange(rewardsCurrent, rewardsPrev),
      },
      networkUtilization: {
        value: parseFloat(utilCurrent.toFixed(2)),
        percentageChange: calculateChange(utilCurrent, utilPrev),
      },
    };
  }

  private async validateScope(
    manager: EntityManager,
    definition: RewardDefinition,
    shopId: string,
  ): Promise<void> {
    if (definition.scopeType === ScopeType.ANY_SHOP) {
      return;
    }

    if (
      definition.scopeType === ScopeType.SPECIFIC_SHOPS ||
      definition.scopeType === ScopeType.EXPO_ONLY
    ) {
      const validShops = await manager
        .createQueryBuilder()
        .relation(RewardDefinition, 'validShops')
        .of(definition)
        .loadMany();

      const isAuthorized = validShops.some((shop) => shop.id === shopId);

      if (!isAuthorized) {
        throw new BadRequestException(
          'Shop is not authorized for this voucher',
        );
      }
    }
  }
}
