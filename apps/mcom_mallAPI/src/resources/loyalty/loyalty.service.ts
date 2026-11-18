import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';
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
import { Product } from '../product/entities/product.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { ApprovalStatus } from '../../common/moderation/catalog-approval';
import { LoyaltyRule } from './entities/loyalty-rule.entity';
import { LoyaltySettings, LoyaltyTier } from './entities/loyalty-settings.entity';
import { LoyaltyEarningConfig } from './entities/loyalty-earning-config.entity';
import { LoyaltyMembership } from './entities/loyalty-membership.entity';
import {
  CreateLoyaltyRuleDto,
  UpdateLoyaltyRuleDto,
  UpsertLoyaltyEarningConfigDto,
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
    @InjectRepository(LoyaltyRule)
    private readonly ruleRepository: Repository<LoyaltyRule>,
    @InjectRepository(LoyaltySettings)
    private readonly settingsRepository: Repository<LoyaltySettings>,
    @InjectRepository(LoyaltyEarningConfig)
    private readonly earningConfigRepository: Repository<LoyaltyEarningConfig>,
    @InjectRepository(LoyaltyMembership)
    private readonly membershipRepository: Repository<LoyaltyMembership>,
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
   * `business_id`; legacy rows are attributed through their offer.
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
    if (!ownerId) {
      return [];
    }

    return this.offerRepository.find({
      where: {
        isActive: true,
        approvalStatus: ApprovalStatus.APPROVED,
        adminDisabled: false,
        user: { id: ownerId },
      },
      order: { created_at: 'DESC' },
    });
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

  // --- Earning configuration -------------------------------------------------

  async getEarningConfig(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyEarningConfig> {
    await this.assertBusinessAccess(businessId, requester);
    let config = await this.earningConfigRepository.findOne({
      where: { businessId },
    });
    if (!config) {
      config = this.earningConfigRepository.create({
        businessId,
        isActive: true,
        earnOnProducts: true,
        earnOnServices: false,
        pointsPerCurrency: 1,
        fixedPointsPerOrder: 0,
        includedProductIds: [],
        excludedProductIds: [],
        includedServiceIds: [],
        excludedServiceIds: [],
        productPointOverrides: {},
        servicePointOverrides: {},
      });
      config = await this.earningConfigRepository.save(config);
    }
    return config;
  }

  async updateEarningConfig(
    businessId: string,
    dto: UpsertLoyaltyEarningConfigDto,
    requester: { id: string; role?: string },
  ): Promise<LoyaltyEarningConfig> {
    await this.assertBusinessAccess(businessId, requester);
    let config = await this.earningConfigRepository.findOne({
      where: { businessId },
    });
    if (!config) {
      config = this.earningConfigRepository.create({ businessId });
    }
    Object.assign(config, dto);
    config.isConfigured = true;
    return this.earningConfigRepository.save(config);
  }

  // --- Public programme + membership ----------------------------------------

  async getPublicProgram(businessId: string, userId?: string) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    const isOwner = !!userId && business.user?.id === userId;

    const [settings, config, membership, memberCount] = await Promise.all([
      this.settingsRepository.findOne({ where: { businessId } }),
      this.earningConfigRepository.findOne({ where: { businessId } }),
      userId
        ? this.membershipRepository.findOne({
            where: { businessId, userId, isActive: true },
          })
        : Promise.resolve(null),
      this.membershipRepository.count({
        where: { businessId, isActive: true },
      }),
    ]);

    const isConfigured = config?.isConfigured === true;

    return {
      businessId,
      programName: settings?.programName || 'Loyalty & Rewards',
      isOwner,
      isConfigured,
      isEnabled:
        isConfigured &&
        (settings?.isEnabled ?? true) &&
        (config?.isActive ?? false),
      pointsPerCurrency: config?.pointsPerCurrency ?? 1,
      fixedPointsPerOrder: config?.fixedPointsPerOrder ?? 0,
      earnOnProducts: config?.earnOnProducts ?? true,
      earnOnServices: config?.earnOnServices ?? false,
      minSpend: config?.minSpend ?? null,
      isJoined: !!membership,
      memberCount,
    };
  }

  async getMembership(businessId: string, userId: string) {
    const membership = await this.membershipRepository.findOne({
      where: { businessId, userId },
    });
    return { isJoined: !!membership?.isActive, membership };
  }

  async joinProgram(businessId: string, userId: string) {
    const [business, user] = await Promise.all([
      this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['user'],
      }),
      this.userRepository.findOne({ where: { id: userId } }),
    ]);
    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (business.user?.id === userId) {
      throw new ForbiddenException(
        'You cannot join your own loyalty campaign.',
      );
    }

    let membership = await this.membershipRepository.findOne({
      where: { businessId, userId },
    });
    if (!membership) {
      membership = this.membershipRepository.create({
        businessId,
        userId,
        isActive: true,
        joinedAt: new Date(),
      });
    } else {
      membership.isActive = true;
    }
    return this.membershipRepository.save(membership);
  }

  // --- Point awarding engine -------------------------------------------------

  private async getActiveMembership(
    businessId: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<LoyaltyMembership | null> {
    const repo = manager
      ? manager.getRepository(LoyaltyMembership)
      : this.membershipRepository;
    return repo.findOne({ where: { businessId, userId, isActive: true } });
  }

  private itemEarnsPoints(
    itemId: string,
    included: string[] | null | undefined,
    excluded: string[] | null | undefined,
  ): boolean {
    if (included && included.length > 0 && !included.includes(itemId)) {
      return false;
    }
    return !(excluded ?? []).includes(itemId);
  }

  /**
   * Awards points for a completed product order. Safe to call more than once
   * for the same order; each business is credited at most once per order.
   */
  async awardOrderPoints(
    orderId: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const itemRepo = manager
      ? manager.getRepository(OrderItem)
      : this.dataSource.getRepository(OrderItem);
    const txRepo = manager
      ? manager.getRepository(PointTransaction)
      : this.pointTransactionRepository;
    const userRepo = manager
      ? manager.getRepository(User)
      : this.userRepository;
    const earningRepo = manager
      ? manager.getRepository(LoyaltyEarningConfig)
      : this.earningConfigRepository;

    const items = await itemRepo.find({
      where: { order: { id: orderId } },
      relations: ['product', 'product.business'],
    });
    if (items.length === 0) {
      return;
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }

    const itemsByBusiness = new Map<string, OrderItem[]>();
    for (const item of items) {
      const businessId = item.product?.business?.id;
      if (!businessId) continue;
      const list = itemsByBusiness.get(businessId) ?? [];
      list.push(item);
      itemsByBusiness.set(businessId, list);
    }

    for (const [businessId, businessItems] of itemsByBusiness.entries()) {
      const config =
        (await earningRepo.findOne({ where: { businessId } })) ??
        ({
          isActive: true,
          earnOnProducts: true,
          earnOnServices: false,
          pointsPerCurrency: 1,
          fixedPointsPerOrder: 0,
          minSpend: null,
          includedProductIds: [],
          excludedProductIds: [],
          includedServiceIds: [],
          excludedServiceIds: [],
          productPointOverrides: {},
          servicePointOverrides: {},
        } as LoyaltyEarningConfig);
      if (!config.isActive || !config.earnOnProducts) continue;

      const membership = await this.getActiveMembership(
        businessId,
        userId,
        manager,
      );
      if (!membership) continue;

      let points = 0;
      for (const item of businessItems) {
        const productId = item.product?.id;
        if (!productId) continue;
        if (
          !this.itemEarnsPoints(
            productId,
            config.includedProductIds,
            config.excludedProductIds,
          )
        ) {
          continue;
        }
        const override = config.productPointOverrides?.[productId];
        points +=
          override !== undefined && override !== null
            ? Number(override)
            : Math.round(
                Number(item.price) *
                  Number(item.quantity) *
                  (config.pointsPerCurrency ?? 0),
              );
      }

      if (points <= 0) continue;
      points += config.fixedPointsPerOrder ?? 0;

      const alreadyAwarded = await txRepo.findOne({
        where: {
          referenceType: 'order',
          referenceId: orderId,
          businessId,
          user: { id: userId },
        },
      });
      if (alreadyAwarded) continue;

      const transaction = txRepo.create({
        user,
        points,
        type: PointTransactionType.EARNED,
        businessId,
        reason: `Points earned on order`,
        source: PointTransactionSource.ORDER,
        referenceType: 'order',
        referenceId: orderId,
      });
      user.points = (user.points ?? 0) + points;
      await userRepo.save(user);
      await txRepo.save(transaction);
    }
  }

  /**
   * Awards points once a service booking is completed. Idempotent per booking.
   */
  async awardBookingPoints(
    bookingId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const bookingRepo = manager
      ? manager.getRepository(ServiceBooking)
      : this.bookingRepository;
    const booking = await bookingRepo.findOne({
      where: { id: bookingId },
      relations: ['user', 'service', 'service.business'],
    });
    if (!booking?.user || !booking.service?.business?.id) {
      return;
    }

    const businessId = booking.service.business.id;
    const earningRepo = manager
      ? manager.getRepository(LoyaltyEarningConfig)
      : this.earningConfigRepository;
    const config =
      (await earningRepo.findOne({ where: { businessId } })) ??
      ({
        isActive: true,
        earnOnProducts: true,
        earnOnServices: false,
        pointsPerCurrency: 1,
        fixedPointsPerOrder: 0,
        minSpend: null,
        includedProductIds: [],
        excludedProductIds: [],
        includedServiceIds: [],
        excludedServiceIds: [],
        productPointOverrides: {},
        servicePointOverrides: {},
      } as LoyaltyEarningConfig);
    if (!config.isActive || !config.earnOnServices) {
      return;
    }

    const membership = await this.getActiveMembership(
      businessId,
      booking.user.id,
      manager,
    );
    if (!membership) {
      return;
    }

    if (
      !this.itemEarnsPoints(
        booking.service.id,
        config.includedServiceIds,
        config.excludedServiceIds,
      )
    ) {
      return;
    }

    if (
      config.minSpend != null &&
      Number(booking.totalAmount ?? 0) < Number(config.minSpend)
    ) {
      return;
    }

    const override = config.servicePointOverrides?.[booking.service.id];
    let points =
      override !== undefined && override !== null
        ? Number(override)
        : Math.round(
            Number(booking.totalAmount ?? 0) * (config.pointsPerCurrency ?? 0),
          );
    if (points <= 0) {
      return;
    }
    points += config.fixedPointsPerOrder ?? 0;

    const txRepo = manager
      ? manager.getRepository(PointTransaction)
      : this.pointTransactionRepository;
    const userRepo = manager
      ? manager.getRepository(User)
      : this.userRepository;

    const alreadyAwarded = await txRepo.findOne({
      where: {
        referenceType: 'booking',
        referenceId: booking.id,
        businessId,
        user: { id: booking.user.id },
      },
    });
    if (alreadyAwarded) {
      return;
    }

    const user = await userRepo.findOne({ where: { id: booking.user.id } });
    if (!user) {
      return;
    }

    const transaction = txRepo.create({
      user,
      points,
      type: PointTransactionType.EARNED,
      businessId,
      reason: 'Points earned on service booking',
      source: PointTransactionSource.BOOKING,
      referenceType: 'booking',
      referenceId: booking.id,
    });
    user.points = (user.points ?? 0) + points;
    await userRepo.save(user);
    await txRepo.save(transaction);
  }

  async getStats(
    businessId: string,
    requester: { id: string; role?: string },
  ): Promise<any> {
    await this.assertBusinessAccess(businessId, requester);

    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['services'],
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
    const membershipCount = await this.membershipRepository.count({
      where: { businessId, isActive: true },
    });

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
    const members = Math.max(Number(membersRaw?.count ?? 0), membershipCount);
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

    baseQb.groupBy('user.id').orderBy('MAX(pt.created_at)', 'DESC');

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

    const memberships = await this.membershipRepository.find({
      where: { businessId, isActive: true },
      relations: ['user'],
    });
    const seen = new Set(members.map((member) => member.id));
    for (const membership of memberships) {
      const member = membership.user;
      if (!member || seen.has(member.id)) continue;
      const balance = Number(member.points ?? 0);
      const tier = this.tierForPoints(balance, tiers);
      members.push({
        id: member.id,
        name:
          member.fullName ||
          `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() ||
          member.email,
        email: member.email,
        avatarUrl: member.profilePictureUrl,
        points: balance,
        pointsEarned: 0,
        pointsRedeemed: 0,
        tier: tier?.name ?? null,
        tierColor: tier?.color ?? null,
        lastActivity: membership.joinedAt,
      });
      seen.add(member.id);
    }

    const search = (options.search ?? '').trim().toLowerCase();
    const filtered = search
      ? members.filter(
          (member) =>
            member.name?.toLowerCase().includes(search) ||
            member.email?.toLowerCase().includes(search),
        )
      : members;

    filtered.sort((a, b) => {
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return bTime - aTime;
    });

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    const tierCounts = tiers.map((tier) => ({
      ...tier,
      count: filtered.filter((member) => member.tier === tier.name).length,
    }));

    return {
      members: paged,
      tierCounts,
      total,
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
}
