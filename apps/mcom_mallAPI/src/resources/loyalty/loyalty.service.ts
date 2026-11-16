import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../listings/entities/listing.entity';
import { UserRole } from '../../common/role.enum';
import {
  PointTransaction,
  PointTransactionSource,
  PointTransactionType,
} from '../transaction/entities/point-transaction.entity';
import { ServiceBooking } from '../booking/entities/service-booking.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Promotion } from '../promotion/entities/promotion.entity';
import { LoyaltyRule } from './entities/loyalty-rule.entity';
import { LoyaltySettings, LoyaltyTier } from './entities/loyalty-settings.entity';
import {
  CreateLoyaltyRuleDto,
  UpdateLoyaltyRuleDto,
  UpdateLoyaltySettingsDto,
} from './dto/loyalty.dto';
import { AllocatePointsDto } from './dto/allocate-points.dto';
import { AllocatePointsBulkDto } from './dto/allocate-points-bulk.dto';

export const DEFAULT_LOYALTY_TIERS: LoyaltyTier[] = [
  { name: 'Bronze', minPoints: 0, color: '#b45309' },
  { name: 'Silver', minPoints: 500, color: '#64748b' },
  { name: 'Gold', minPoints: 2000, color: '#d97706' },
  { name: 'Platinum', minPoints: 5000, color: '#334155' },
];

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(PointTransaction)
    private readonly pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(ServiceBooking)
    private readonly bookingRepository: Repository<ServiceBooking>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(LoyaltyRule)
    private readonly ruleRepository: Repository<LoyaltyRule>,
    @InjectRepository(LoyaltySettings)
    private readonly settingsRepository: Repository<LoyaltySettings>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Authorization ---

  /**
   * Ensures the caller owns the business (or is a platform admin) before any
   * loyalty read/write. Prevents cross-tenant loyalty management by businessId.
   */
  private async assertBusinessAccess(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<void> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    if (
      requester.role !== UserRole.ADMIN &&
      business.user?.id !== requester.id
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage this loyalty program.',
      );
    }
  }

  /**
   * Restricts a point_transactions query to a business. New rows carry
   * `business_id`; legacy rows are attributed through their promotion/offer.
   */
  private applyBusinessScope(
    qb: ReturnType<Repository<PointTransaction>['createQueryBuilder']>,
    alias: string,
    businessId: string,
  ) {
    return qb.andWhere(
      new Brackets((where) => {
        where
          .where(`${alias}.business_id = :businessId`, { businessId })
          .orWhere(
            `${alias}.promotionId IN (SELECT pb.promotion_id FROM promotion_businesses pb WHERE pb.business_id = :businessId)`,
            { businessId },
          )
          .orWhere(
            `${alias}.offerId IN (SELECT ob.offer_id FROM offer_businesses ob WHERE ob.business_id = :businessId)`,
            { businessId },
          )
          .orWhere(
            `${alias}.offerId IN (
              SELECT o.id FROM offers o
              WHERE o."userId" = (SELECT b."userId" FROM businesses b WHERE b.id = :businessId)
            )`,
            { businessId },
          );
      }),
    );
  }

  private async resolveTiers(businessId: string): Promise<LoyaltyTier[]> {
    const settings = await this.settingsRepository.findOne({
      where: { businessId },
    });
    if (settings?.tierConfig && settings.tierConfig.length > 0) {
      return settings.tierConfig;
    }
    return DEFAULT_LOYALTY_TIERS;
  }

  private async findActiveOffersForBusiness(
    businessId: string,
  ): Promise<Offer[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    const ownerId = business?.user?.id;

    const qb = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.businesses', 'business')
      .where('offer.isActive = :isActive', { isActive: true });

    if (ownerId) {
      qb.andWhere(
        '(business.id = :businessId OR offer.userId = :ownerId)',
        { businessId, ownerId },
      );
    } else {
      qb.andWhere('business.id = :businessId', { businessId });
    }

    return qb.orderBy('offer.created_at', 'DESC').getMany();
  }

  private tierForPoints(
    points: number,
    tiers: LoyaltyTier[],
  ): LoyaltyTier | null {
    const sorted = [...tiers].sort((a, b) => b.minPoints - a.minPoints);
    return sorted.find((tier) => points >= tier.minPoints) ?? null;
  }

  async allocatePoints(
    dto: AllocatePointsDto,
    requester: { id: string; role?: string },
  ): Promise<PointTransaction> {
    return this.allocatePointsInternal(
      dto.businessId,
      [dto.customerId],
      dto.points,
      dto.reason,
      requester,
    ).then((rows) => rows[0]);
  }

  async allocatePointsBulk(
    dto: AllocatePointsBulkDto,
    requester: { id: string; role?: string },
  ): Promise<PointTransaction[]> {
    return this.allocatePointsInternal(
      dto.businessId,
      dto.customerIds,
      dto.points,
      dto.reason,
      requester,
    );
  }

  private async allocatePointsInternal(
    businessId: string,
    customerIds: string[],
    points: number,
    reason: string | undefined,
    requester: { id: string; role?: string },
  ): Promise<PointTransaction[]> {
    await this.assertBusinessAccess(businessId, requester);

    if (points <= 0) {
      throw new BadRequestException('Points must be greater than zero.');
    }

    const uniqueCustomerIds = [...new Set(customerIds)];
    const customers = await this.userRepository.findByIds(uniqueCustomerIds);
    if (customers.length !== uniqueCustomerIds.length) {
      throw new NotFoundException('One or more customers could not be found.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    return this.dataSource.transaction(async (manager) => {
      const saved: PointTransaction[] = [];

      for (const customerId of uniqueCustomerIds) {
        const lockedUser = await manager
          .getRepository(User)
          .createQueryBuilder('user')
          .setLock('pessimistic_write')
          .where('user.id = :customerId', { customerId })
          .getOne();

        if (!lockedUser) {
          throw new NotFoundException(
            `Customer with ID ${customerId} not found`,
          );
        }

        lockedUser.points = (lockedUser.points ?? 0) + points;
        await manager.save(lockedUser);

        const transaction = manager.create(PointTransaction, {
          user: lockedUser,
          points,
          type: PointTransactionType.EARNED,
          businessId,
          reason: reason ?? 'Manual allocation',
          source: PointTransactionSource.MANUAL,
          expiresAt,
        });
        saved.push(await manager.save(transaction));
      }

      return saved;
    });
  }

  async getStats(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<any> {
    await this.assertBusinessAccess(businessId, requester);

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['services', 'offers', 'promotions'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    const serviceIds = (business.services ?? []).map((service) => service.id);

    const issuedQb = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('COALESCE(SUM(pt.points), 0)', 'sum')
      .where('pt.type = :type', { type: PointTransactionType.EARNED });
    this.applyBusinessScope(issuedQb, 'pt', businessId);

    const redeemedQb = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('COALESCE(SUM(ABS(pt.points)), 0)', 'sum')
      .where('pt.type = :type', { type: PointTransactionType.REDEMPTION });
    this.applyBusinessScope(redeemedQb, 'pt', businessId);

    const membersQb = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('COUNT(DISTINCT pt.userId)', 'count');
    this.applyBusinessScope(membersQb, 'pt', businessId);

    const activeOffers = await this.findActiveOffersForBusiness(businessId);

    const completedBookings =
      serviceIds.length > 0
        ? await this.bookingRepository
            .createQueryBuilder('booking')
            .leftJoin('booking.service', 'service')
            .where('service.id IN (:...serviceIds)', { serviceIds })
            .andWhere('booking.status = :status', { status: 'completed' })
            .getMany()
        : [];

    const [issuedRaw, redeemedRaw, membersRaw] = await Promise.all([
      issuedQb.getRawOne(),
      redeemedQb.getRawOne(),
      membersQb.getRawOne(),
    ]);

    const pointsIssued = Number(issuedRaw?.sum ?? 0);
    const pointsRedeemed = Number(redeemedRaw?.sum ?? 0);
    const members = Number(membersRaw?.count ?? 0);
    const redemptionRate =
      pointsIssued > 0
        ? Math.min(100, Math.round((pointsRedeemed / pointsIssued) * 1000) / 10)
        : 0;

    return {
      activeRewards: activeOffers.length,
      pointsIssued,
      pointsRedeemed,
      redemptionRate,
      programGrowth: members,
      memberCount: members,
      completedBookings: completedBookings.length,
      offers: activeOffers.map((offer) => ({
        id: offer.id,
        title: offer.name ?? 'Reward',
        points: offer.points ?? 0,
        isActive: offer.isActive,
      })),
    };
  }

  async getMembers(
    businessId: string,
    requester: { id: string; role?: string },
    options: { search?: string; limit?: number; offset?: number } = {},
  ): Promise<any> {
    await this.assertBusinessAccess(businessId, requester);
    const tiers = await this.resolveTiers(businessId);
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
    const offset = Math.max(options.offset ?? 0, 0);

    const baseQb = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .innerJoin('pt.user', 'user')
      .select('user.id', 'id')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.fullName', 'fullName')
      .addSelect('user.email', 'email')
      .addSelect('user.profilePictureUrl', 'profilePictureUrl')
      .addSelect('user.points', 'balance')
      .addSelect(
        `COALESCE(SUM(CASE WHEN pt.type = '${PointTransactionType.EARNED}' THEN pt.points ELSE 0 END), 0)`,
        'issued',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN pt.type = '${PointTransactionType.REDEMPTION}' THEN ABS(pt.points) ELSE 0 END), 0)`,
        'redeemed',
      )
      .addSelect('MAX(pt.created_at)', 'lastActivity');
    this.applyBusinessScope(baseQb, 'pt', businessId);

    if (options.search) {
      baseQb.andWhere(
        new Brackets((where) => {
          where
            .where('user.firstName ILIKE :search', {
              search: `%${options.search}%`,
            })
            .orWhere('user.lastName ILIKE :search', {
              search: `%${options.search}%`,
            })
            .orWhere('user.email ILIKE :search', {
              search: `%${options.search}%`,
            });
        }),
      );
    }

    const countQb = baseQb.clone();
    const totalRow = await countQb
      .select('COUNT(DISTINCT user.id)', 'count')
      .getRawOne();

    baseQb
      .groupBy('user.id')
      .orderBy('MAX(pt.created_at)', 'DESC')
      .limit(limit)
      .offset(offset);

    const rows = await baseQb.getRawMany();

    const now = new Date();
    const inThirtyDays = new Date();
    inThirtyDays.setDate(now.getDate() + 30);

    const expiringQb = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .select('COALESCE(SUM(pt.points), 0)', 'sum')
      .where('pt.type = :type', { type: PointTransactionType.EARNED })
      .andWhere('pt.expires_at IS NOT NULL')
      .andWhere('pt.expires_at <= :inThirtyDays', { inThirtyDays })
      .andWhere('pt.expires_at >= :now', { now });
    this.applyBusinessScope(expiringQb, 'pt', businessId);
    const expiringRaw = await expiringQb.getRawOne();

    const members = rows.map((row) => {
      const balance = Number(row.balance ?? 0);
      const tier = this.tierForPoints(balance, tiers);
      return {
        id: row.id,
        name:
          row.fullName ||
          `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() ||
          row.email,
        email: row.email,
        avatarUrl: row.profilePictureUrl,
        points: balance,
        pointsEarned: Number(row.issued ?? 0),
        pointsRedeemed: Number(row.redeemed ?? 0),
        tier: tier?.name ?? null,
        tierColor: tier?.color ?? null,
        lastActivity: row.lastActivity,
      };
    });

    const tierCounts = tiers.map((tier) => ({
      ...tier,
      count: members.filter((member) => member.tier === tier.name).length,
    }));

    return {
      members,
      tierCounts,
      total: Number(totalRow?.count ?? members.length),
      expiringPoints: Number(expiringRaw?.sum ?? 0),
    };
  }

  async getTransactions(
    businessId: string,
    requester: { id: string; role?: string },
    options: {
      type?: PointTransactionType;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<any> {
    await this.assertBusinessAccess(businessId, requester);
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);

    const qb = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.user', 'user')
      .leftJoinAndSelect('pt.promotion', 'promotion')
      .leftJoinAndSelect('pt.offer', 'offer')
      .orderBy('pt.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    this.applyBusinessScope(qb, 'pt', businessId);

    if (options.type) {
      qb.andWhere('pt.type = :type', { type: options.type });
    }

    const [transactions, total] = await qb.getManyAndCount();

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async getCustomerLoyalty(
    businessId: string,
    customerId: string,
    requester: { id: string; role?: string },
  ): Promise<any> {
    await this.assertBusinessAccess(businessId, requester);

    const user = await this.userRepository.findOne({
      where: { id: customerId },
    });
    if (!user) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const tierList = await this.resolveTiers(businessId);
    const tier = this.tierForPoints(user.points ?? 0, tierList);

    const txQb = this.pointTransactionRepository
      .createQueryBuilder('pt')
      .where('pt.userId = :customerId', { customerId })
      .orderBy('pt.created_at', 'DESC')
      .take(100);
    this.applyBusinessScope(txQb, 'pt', businessId);

    const [pointTransactions, offers, earnRules] = await Promise.all([
      txQb.getMany(),
      this.findActiveOffersForBusiness(businessId),
      this.ruleRepository.find({
        where: { businessId, isActive: true },
        order: { created_at: 'DESC' },
      }),
    ]);

    return {
      userId: user.id,
      name: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      avatarUrl: user.profilePictureUrl,
      points: user.points,
      tier: tier?.name ?? null,
      tierColor: tier?.color ?? null,
      pointTransactions,
      claimableRewards: offers.map((offer) => ({
        id: offer.id,
        title: offer.name ?? 'Reward',
        description: offer.description ?? '',
        points: offer.points ?? 0,
      })),
      redeemedRewards: pointTransactions
        .filter((tx) => tx.type === PointTransactionType.REDEMPTION)
        .map((tx) => ({
          id: tx.id,
          points: Math.abs(tx.points),
          createdAt: tx.created_at,
        })),
      earnOffers: earnRules.map((rule) => ({
        id: rule.id,
        title: rule.name,
        description: rule.description ?? '',
        ruleType: rule.ruleType,
        trigger: rule.trigger,
        pointsPerCurrency: rule.pointsPerCurrency,
        fixedPoints: rule.fixedPoints,
        multiplier: rule.multiplier,
      })),
    };
  }

  async findAllRules(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyRule[]> {
    await this.assertBusinessAccess(businessId, requester);
    return this.ruleRepository.find({
      where: { businessId },
      order: { created_at: 'DESC' },
    });
  }

  async createRule(
    dto: CreateLoyaltyRuleDto,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyRule> {
    await this.assertBusinessAccess(dto.businessId, requester);
    this.validateRule(dto);
    const rule = this.ruleRepository.create(dto);
    return this.ruleRepository.save(rule);
  }

  private validateRule(dto: CreateLoyaltyRuleDto | UpdateLoyaltyRuleDto) {
    if (
      dto.pointsPerCurrency === undefined &&
      dto.fixedPoints === undefined &&
      dto.multiplier === undefined
    ) {
      throw new BadRequestException(
        'A rule must define pointsPerCurrency, fixedPoints or multiplier.',
      );
    }
  }

  async updateRule(
    id: string,
    dto: UpdateLoyaltyRuleDto,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyRule> {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Loyalty rule with ID ${id} not found`);
    }
    await this.assertBusinessAccess(rule.businessId, requester);
    Object.assign(rule, dto);
    return this.ruleRepository.save(rule);
  }

  async removeRule(
    id: string,
    requester: { id: string; role?: string },
  ): Promise<void> {
    const rule = await this.ruleRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Loyalty rule with ID ${id} not found`);
    }
    await this.assertBusinessAccess(rule.businessId, requester);
    await this.ruleRepository.remove(rule);
  }

  async getSettings(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<LoyaltySettings> {
    await this.assertBusinessAccess(businessId, requester);
    let settings = await this.settingsRepository.findOne({
      where: { businessId },
    });
    if (!settings) {
      settings = this.settingsRepository.create({
        businessId,
        isEnabled: true,
        redemptionApproval: 'auto',
        programName: 'Loyalty & Rewards',
        brandColor: '#ea580c',
        accentColor: '#fff1eb',
        tierConfig: DEFAULT_LOYALTY_TIERS,
        redemptionMode: 'both',
      });
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async updateSettings(
    businessId: string,
    dto: UpdateLoyaltySettingsDto,
    requester: { id: string; role?: string },
  ): Promise<LoyaltySettings> {
    const settings = await this.getSettings(businessId, requester);
    Object.assign(settings, dto);
    return this.settingsRepository.save(settings);
  }
}
