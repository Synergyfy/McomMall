import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  DataSource,
  EntityManager,
  In,
} from 'typeorm';
import { CampaignCashback } from './entities/campaign-cashback.entity';
import { UserCampaignCashback } from './entities/user-campaign-cashback.entity';
import { UserCampaignWallet } from './entities/user-campaign-wallet.entity';
import { CreateCampaignCashbackDto } from './dto/create-campaign-cashback.dto';
import { User } from '../users/entities/user.entity';
import {
  CampaignStatus,
  SpendingChannel,
  CampaignTargetType,
  CampaignCategory,
  CampaignUnlockMode,
  CampaignUsageType,
} from './campaign-cashback.enum';
import {
  ContributeDto,
  ContributionPaymentProvider,
} from './dto/contribute.dto';
import { Season } from '../seasons/entities/season.entity';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionType } from '../wallet/entities/wallet-transaction.entity';
import { PaymentProviderService } from '../payments/services/payment-provider.service';
import { PaymentOrchestratorService } from '../payments/services/payment-orchestrator.service';
import type { PaymentRail } from '../payments/services/payment-orchestrator.service';
import {
  OrderPayment,
  PaymentMethod,
} from '../order/entities/order-payment.entity';
import { UserRole } from '../../common/role.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PageDto } from '../../common/dto/page.dto';

@Injectable()
export class CampaignCashbackService {
  constructor(
    @InjectRepository(CampaignCashback)
    private campaignRepository: Repository<CampaignCashback>,
    @InjectRepository(UserCampaignCashback)
    private userCampaignRepository: Repository<UserCampaignCashback>,
    @InjectRepository(UserCampaignWallet)
    private walletRepository: Repository<UserCampaignWallet>,
    @InjectRepository(Season)
    private seasonRepository: Repository<Season>,
    @InjectRepository(OrderPayment)
    private orderPaymentRepository: Repository<OrderPayment>,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    private paymentProviderService: PaymentProviderService,
    private paymentOrchestrator: PaymentOrchestratorService,
    private dataSource: DataSource,
  ) {}

  async create(
    createDto: CreateCampaignCashbackDto,
  ): Promise<CampaignCashback> {
    const levelValue = createDto.totalValue / 3;

    let startDate: Date;
    let endDate: Date;
    let season: Season = null;

    if (createDto.type === CampaignCategory.SEASONAL) {
      if (!createDto.seasonId) {
        throw new BadRequestException(
          'Season ID is required for seasonal campaigns',
        );
      }
      season = await this.seasonRepository.findOne({
        where: { id: createDto.seasonId },
      });
      if (!season) {
        throw new NotFoundException('Season not found');
      }
      startDate = season.startDate;
      endDate = season.endDate;
    } else {
      if (!createDto.startDate || !createDto.endDate) {
        throw new BadRequestException(
          'Start and end dates are required for regular campaigns',
        );
      }
      startDate = new Date(createDto.startDate);
      endDate = new Date(createDto.endDate);
    }

    const campaign = this.campaignRepository.create({
      ...createDto,
      levelValue,
      startDate,
      endDate,
      season,
    });
    return this.campaignRepository.save(campaign);
  }

  async findAllForUser(user: User, targetType?: CampaignTargetType) {
    const now = new Date();

    // 1. Fetch active campaigns based on date
    const allCampaigns = await this.campaignRepository.find({
      where: {
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });

    // 2. Logic for audience targeting
    const eligibleCampaigns = allCampaigns.filter((c) => {
      // If user is filtering by a specific type (e.g. B2B tab), check it
      if (targetType && c.targetType !== targetType) return false;

      // Check logic based on CampaignTargetType
      switch (c.targetType) {
        case CampaignTargetType.ALL:
          return true;
        case CampaignTargetType.CUSTOMER:
          return user.role === UserRole.CUSTOMER;
        case CampaignTargetType.BUSINESS:
          return user.role === UserRole.OWNER;
        case CampaignTargetType.SPECIFIC_USERS:
          return c.targetIds && c.targetIds.includes(user.id);
        default:
          return false;
      }
    });

    const userCampaigns: UserCampaignCashback[] = [];

    // Batch-load existing user campaigns to avoid N+1
    const campaignIds = eligibleCampaigns.map((c) => c.id);
    const existingUserCampaigns = await this.userCampaignRepository.find({
      where: { user: { id: user.id }, campaign: { id: In(campaignIds) } },
      relations: ['campaign', 'wallets'],
    });
    const userCampaignMap = new Map(
      existingUserCampaigns.map((uc) => [uc.campaign.id, uc]),
    );

    for (const campaign of eligibleCampaigns) {
      // Load userCampaign instance with wallets
      let userCampaign = userCampaignMap.get(campaign.id);

      if (!userCampaign) {
        // Automatically activate campaign if user is eligible but hasn't accessed it yet
        userCampaign = await this.createUserCampaign(user, campaign);
      }
      userCampaigns.push(userCampaign);
    }

    return userCampaigns;
  }

  private async createUserCampaign(
    user: User,
    campaign: CampaignCashback,
  ): Promise<UserCampaignCashback> {
    const userCampaign = this.userCampaignRepository.create({
      user,
      campaign,
      status: CampaignStatus.ACTIVE,
      contributionPaid: false,
      activationTimerDate: campaign.activationTimerDays
        ? new Date(
            Date.now() + campaign.activationTimerDays * 24 * 60 * 60 * 1000,
          )
        : null,
    });

    const savedUserCampaign =
      await this.userCampaignRepository.save(userCampaign);

    // Initialize multi-bucket wallets based on campaign channel configuration
    const allChannels = new Set<SpendingChannel>();
    if (campaign.value1Channels)
      campaign.value1Channels.forEach((c) => allChannels.add(c));
    if (campaign.value2Channels)
      campaign.value2Channels.forEach((c) => allChannels.add(c));
    if (campaign.value3Channels)
      campaign.value3Channels.forEach((c) => allChannels.add(c));

    const wallets: UserCampaignWallet[] = [];
    for (const channel of Array.from(allChannels)) {
      const wallet = this.walletRepository.create({
        userCampaign: savedUserCampaign,
        channelType: channel,
        value1Balance: this.calculateChannelBalance(
          channel,
          campaign.value1Channels,
          campaign.levelValue,
        ),
        value2Balance: this.calculateChannelBalance(
          channel,
          campaign.value2Channels,
          campaign.levelValue,
        ),
        value3Balance: this.calculateChannelBalance(
          channel,
          campaign.value3Channels,
          campaign.levelValue,
        ),
      });
      wallets.push(wallet);
    }

    await this.walletRepository.save(wallets);
    savedUserCampaign.wallets = wallets;
    return savedUserCampaign;
  }

  private calculateChannelBalance(
    channel: SpendingChannel,
    allowedChannels: SpendingChannel[],
    totalLevelValue: number,
  ): number {
    // Safety check to prevent division by zero or errors on empty channel lists
    if (
      !allowedChannels ||
      allowedChannels.length === 0 ||
      !allowedChannels.includes(channel)
    )
      return 0;
    return totalLevelValue / allowedChannels.length;
  }

  async findOne(id: string, user: User): Promise<UserCampaignCashback> {
    const userCampaign = await this.userCampaignRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['campaign', 'wallets'],
    });

    if (!userCampaign) {
      throw new NotFoundException('Campaign cashback not found');
    }

    return userCampaign;
  }

  async initiateContribution(
    id: string,
    user: User,
    paymentMethod: ContributionPaymentProvider,
  ): Promise<{
    clientSecret?: string;
    orderId?: string;
    approvalUrl?: string | null;
    transactionId?: string;
    holdId?: string;
    expiresAt?: string;
    provider: ContributionPaymentProvider;
    amount: number;
  }> {
    const userCampaign = await this.findOne(id, user);
    if (userCampaign.contributionPaid) {
      throw new BadRequestException('Contribution already paid');
    }
    const amount = Number(userCampaign.campaign.levelValue);
    const reference = `campaign-contribution-${id}`;
    const idempotencyKey = `campaign-${id}-${user.id}-${amount.toFixed(2)}`;

    const rail: PaymentRail =
      paymentMethod === ContributionPaymentProvider.WALLET
        ? 'mcom_wallet'
        : paymentMethod === ContributionPaymentProvider.PAYPAL
          ? 'paypal'
          : 'stripe';

    if (rail === 'mcom_wallet') {
      if (!user.centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }
      const initiated = await this.paymentOrchestrator.initiate({
        rail,
        amount,
        currency: 'GBP',
        payer: { mallUserId: user.id, centralUserId: user.centralUserId },
        reference,
        idempotencyKey,
        walletIdempotencyKey: this.paymentProviderService.buildWalletKey(
          'campaign-hold',
          id,
          user.id,
          amount.toFixed(2),
        ),
        walletHoldMetadata: {
          purpose: 'CAMPAIGN',
          campaignId: id,
          userId: user.id,
        },
        description: 'Campaign contribution',
        walletMode: 'hold',
      });
      if (initiated.rail !== 'mcom_wallet') {
        throw new BadRequestException('Invalid payment rail.');
      }
      return {
        transactionId: initiated.holdId,
        holdId: initiated.holdId,
        expiresAt: initiated.expiresAt,
        provider: ContributionPaymentProvider.WALLET,
        amount,
      };
    }

    const initiated = await this.paymentOrchestrator.initiate({
      rail,
      amount,
      currency: 'GBP',
      payer: { mallUserId: user.id, centralUserId: user.centralUserId },
      reference,
      idempotencyKey,
      description: 'Campaign contribution',
    });
    if (initiated.rail === 'stripe') {
      return {
        clientSecret: initiated.clientSecret ?? undefined,
        provider: ContributionPaymentProvider.STRIPE,
        amount,
      };
    }
    if (initiated.rail === 'paypal') {
      return {
        orderId: initiated.orderId,
        approvalUrl: initiated.approvalUrl,
        provider: ContributionPaymentProvider.PAYPAL,
        amount,
      };
    }
    throw new BadRequestException('Invalid payment provider specified.');
  }

  async contribute(
    id: string,
    user: User,
    contributeDto: ContributeDto,
  ): Promise<UserCampaignCashback> {
    const currency = 'GBP';

    // 1. Initial basic validation (pre-lock)
    const userCampaignCheck = await this.findOne(id, user);
    if (userCampaignCheck.contributionPaid) {
      throw new BadRequestException('Contribution already paid');
    }

    const campaign = userCampaignCheck.campaign;
    if (Math.abs(Number(contributeDto.amount) - Number(campaign.levelValue)) > 0.01) {
      throw new BadRequestException(
        `Contribution amount must be exactly £${campaign.levelValue}`,
      );
    }

    // 2. EXTERNAL VERIFICATION (outside the DB transaction)
    if (!contributeDto.transactionId) {
      throw new BadRequestException('A payment reference is required');
    }

    const existingPayment = await this.orderPaymentRepository.findOne({
      where: { transactionId: contributeDto.transactionId },
    });
    if (existingPayment)
      throw new BadRequestException('Transaction already processed');

    const rail: PaymentRail =
      contributeDto.paymentMethod === ContributionPaymentProvider.WALLET
        ? 'mcom_wallet'
        : contributeDto.paymentMethod === ContributionPaymentProvider.PAYPAL
          ? 'paypal'
          : 'stripe';

    const verification = await this.paymentOrchestrator.confirm({
      rail,
      reference: contributeDto.transactionId,
      amount: contributeDto.amount,
      currency,
      payer: { mallUserId: user.id, centralUserId: user.centralUserId },
      holdId:
        rail === 'mcom_wallet' ? contributeDto.transactionId : undefined,
      contextReference: `campaign-contribution-${id}`,
      idempotencyKey:
        rail === 'mcom_wallet'
          ? this.paymentProviderService.buildWalletKey(
              'campaign-capture',
              contributeDto.transactionId,
            )
          : undefined,
    });

    if (!verification.ok) {
      throw new BadRequestException(
        `Payment verification failed: ${verification.reason}`,
      );
    }

    const paidChargeId = verification.chargeId;
    const paidProviderRef = verification.providerRef;
    const paidFeeMinor = verification.feeMinor;
    const paidNetMinor = verification.netMinor;
    const paymentReference =
      verification.transactionId || contributeDto.transactionId;

    // 3. SECURE UPDATE (Inside Transaction with Pessimistic Lock)
    return this.dataSource.transaction(async (manager) => {
      // Fix: Lock the entity by ID directly to avoid "FOR UPDATE on outer join" error
      const lockedCampaign = await manager.findOne(UserCampaignCashback, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedCampaign)
        throw new NotFoundException('Campaign not found during processing');

      // Basic security check: ensure it belongs to the user
      // (This should have been caught by the pre-lock findOne, but double check)
      const userCampaign = await manager.findOne(UserCampaignCashback, {
        where: { id, user: { id: user.id } },
        relations: ['campaign', 'wallets'],
      });

      if (!userCampaign)
        throw new NotFoundException('Campaign not found for this user');
      if (userCampaign.contributionPaid) return userCampaign; // Concurrent request already succeeded

      // Final idempotency check inside the lock.
      const doubleCheckPayment = await manager.findOne(OrderPayment, {
        where: [
          { transactionId: paymentReference },
          ...(paidChargeId ? [{ mcomChargeId: paidChargeId }] : []),
        ],
      });
      if (doubleCheckPayment)
        throw new BadRequestException(
          'Transaction was processed by a concurrent request',
        );

      const paymentMethod =
        contributeDto.paymentMethod === ContributionPaymentProvider.STRIPE
          ? PaymentMethod.STRIPE
          : contributeDto.paymentMethod === ContributionPaymentProvider.PAYPAL
            ? PaymentMethod.PAYPAL
            : PaymentMethod.MCOM_WALLET;
      const payment = manager.create(OrderPayment, {
        user: { id: user.id } as User,
        amount: contributeDto.amount,
        currency,
        transactionId: paymentReference,
        paymentMethod,
        mcomChargeId: paidChargeId,
        providerRef: paidProviderRef,
        feeMinor: paidFeeMinor,
        netMinor: paidNetMinor,
        status: 'paid',
      });
      const savedPayment = await manager.save(payment);

      await this.paymentProviderService.allocateCharge(
        {
          mcomChargeId: paidChargeId || `wallet:${paymentReference}`,
          purpose: 'CAMPAIGN',
          entityType: 'user_campaign_cashback',
          entityId: id,
          userId: user.id,
          amountMinor: String(Math.round(Number(contributeDto.amount) * 100)),
          currency: 'GBP',
        },
        manager,
      );

      userCampaign.contributionPaid = true;
      return manager.save(userCampaign);
    });
  }

  async spend(
    id: string,
    user: User,
    amount: number,
    channel: SpendingChannel,
    usageType: CampaignUsageType,
    manager?: EntityManager,
  ): Promise<UserCampaignCashback> {
    const finalManager = manager || this.dataSource.manager;

    // 1. Fetch user campaign with wallets and lock if in transaction
    // Fix: Lock by ID first if manager is provided (meaning we are in a transaction)
    if (manager) {
      await manager.findOne(UserCampaignCashback, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
    }

    const userCampaign = await finalManager.findOne(UserCampaignCashback, {
      where: { id, user: { id: user.id } },
      relations: ['campaign', 'wallets'],
    });

    if (!userCampaign) throw new NotFoundException('Campaign card not found');

    const campaign = userCampaign.campaign;

    // 2. Validate Campaign Status & Dates
    const now = new Date();
    if (now < campaign.startDate || now > campaign.endDate) {
      throw new BadRequestException('Campaign is not currently active');
    }

    if (
      campaign.unlockMode === CampaignUnlockMode.REQUIRE_FULL_UNLOCK &&
      !userCampaign.contributionPaid
    ) {
      throw new BadRequestException(
        'Campaign card must be unlocked with a contribution before usage',
      );
    }

    // 3. Find correct channel wallet
    const wallet = userCampaign.wallets.find((w) => w.channelType === channel);
    if (!wallet)
      throw new BadRequestException(
        `This campaign card is not valid for ${channel} spending`,
      );

    // 4. Calculate total available based on Usage Type permissions
    let remainingToDeduct = amount;

    // Value 1 Check
    if (
      campaign.value1UsageTypes.includes(usageType) ||
      campaign.value1UsageTypes.includes(CampaignUsageType.ANYWHERE)
    ) {
      const canDeduct = Math.min(
        remainingToDeduct,
        Number(wallet.value1Balance),
      );
      wallet.value1Balance = Number(wallet.value1Balance) - canDeduct;
      remainingToDeduct -= canDeduct;
    }

    // Value 2 Check
    if (
      remainingToDeduct > 0 &&
      (campaign.value2UsageTypes.includes(usageType) ||
        campaign.value2UsageTypes.includes(CampaignUsageType.ANYWHERE))
    ) {
      const canDeduct = Math.min(
        remainingToDeduct,
        Number(wallet.value2Balance),
      );
      wallet.value2Balance = Number(wallet.value2Balance) - canDeduct;
      remainingToDeduct -= canDeduct;
    }

    // Value 3 Check (Requires contribution paid if allowed only after unlock)
    if (
      remainingToDeduct > 0 &&
      userCampaign.contributionPaid &&
      (campaign.value3UsageTypes.includes(usageType) ||
        campaign.value3UsageTypes.includes(CampaignUsageType.ANYWHERE))
    ) {
      const canDeduct = Math.min(
        remainingToDeduct,
        Number(wallet.value3Balance),
      );
      wallet.value3Balance = Number(wallet.value3Balance) - canDeduct;
      remainingToDeduct -= canDeduct;
    }

    if (remainingToDeduct > 0) {
      throw new BadRequestException(
        'Insufficient campaign cashback balance for this usage type/channel',
      );
    }

    // 5. Update Status based on usage
    const totalRemaining =
      Number(wallet.value1Balance) +
      Number(wallet.value2Balance) +
      Number(wallet.value3Balance);
    if (totalRemaining === 0) {
      userCampaign.status = CampaignStatus.FULLY_USED;
    } else {
      userCampaign.status = CampaignStatus.PARTIALLY_USED;
    }

    await finalManager.save(wallet);
    return finalManager.save(userCampaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.campaignRepository.remove(campaign);
  }

  async findAllTemplates(
    pagination: PaginationQueryDto,
  ): Promise<PageDto<CampaignCashback>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.campaignRepository.findAndCount({
      relations: ['season'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination,
    });

    return new PageDto(items, pageMetaDto);
  }
}
