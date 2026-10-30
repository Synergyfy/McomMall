import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import * as crypto from 'crypto';

import { Coupon } from './entities/coupon.entity';
import { CouponStatus, CouponSourceType, DiscountType, TransactionType } from './coupon.enum';
import { UserRole } from '../../common/role.enum';
import {
  RedemptionLog,
  RedemptionStatus,
} from './entities/redemption-log.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { BrandingAssociation } from './entities/branding-association.entity';
import { computeCouponDiscount } from '../partner-instruments/pricing';
import { User } from '../users/entities/user.entity';
import {
  MarketingCampaignStatus,
  MarketingCampaignType,
} from '../campaign/marketing-campaign.enum';
import { Order } from '../order/entities/order.entity';
import {
  CapabilityService,
  ActionType,
} from '../capability/capability.service';
import { ShippingAddress } from '../shipping-address/entities/shipping-address.entity';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PageDto } from '../../common/dto/page.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';

import { SavedCoupon } from './entities/saved-coupon.entity';
import { CouponStatsDto } from './dto/coupon-stats.dto';
import { CouponChartDataDto } from './dto/coupon-chart-data.dto';
import { CouponTransactionHistoryDto } from './dto/coupon-transaction-history.dto';
import { InstrumentScopeService } from '../partner-instruments/instrument-scope.service';
import {
  InstrumentType,
  PARTNER_INSTRUMENT_CONSUMED_EVENT,
} from '../partner-instruments/enums';
import { InstrumentScopeDto } from '../partner-instruments/dto/instrument-scope.dto';
import { PartnerRequestContext } from '../partner-instruments/instrument-scope.service';
import { markReplayed } from '../partner-instruments/replay';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(MarketingCampaign)
    private readonly campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BrandingAssociation)
    private readonly brandingRepository: Repository<BrandingAssociation>,
    @InjectRepository(RedemptionLog)
    private readonly redemptionLogRepository: Repository<RedemptionLog>,
    @InjectRepository(ShippingAddress)
    private readonly addressRepository: Repository<ShippingAddress>,
    @InjectRepository(SavedCoupon)
    private readonly savedCouponRepository: Repository<SavedCoupon>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
    @Optional()
    private readonly eventEmitter?: EventEmitter2,
    @Optional()
    private readonly instrumentScopeService?: InstrumentScopeService,
  ) {}

  async create(dto: CreateCouponDto, creator?: User): Promise<Coupon> {
    const {
      title,
      description,
      code,
      sourceType,
      discountValue,
      discountType,
      usageLimit,
      perUserLimit,
      startDate,
      expiresAt,
      campaignId,
      businessId,
      brandingBusinessId,
    } = dto;

    if (
      sourceType === CouponSourceType.PLATFORM &&
      creator &&
      creator.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only platform admins can create platform coupons.',
      );
    }

    // Validate Business and Capability
    let business: Business | null = null;
    if (businessId) {
      business = await this.businessRepository.findOne({
        where: { id: businessId },
        relations: ['user'],
      });
      if (!business) throw new NotFoundException('Business not found');

      if (
        sourceType === CouponSourceType.BUSINESS &&
        creator &&
        creator.role !== UserRole.ADMIN &&
        business.user.id !== creator.id
      ) {
        throw new ForbiddenException(
          'You can only create coupons for a business that you own.',
        );
      }

      if (sourceType === CouponSourceType.BUSINESS) {
        await this.capabilityService.checkPermission(
          business.user.id,
          ActionType.CREATE_COUPON_TEMPLATE,
        );
      }
    }

    // Validate Campaign
    let campaign: MarketingCampaign | null = null;
    if (campaignId) {
      campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });
      if (!campaign) throw new NotFoundException('Campaign not found');
    }

    const coupon = this.couponRepository.create({
      title,
      description,
      code,
      sourceType,
      discountValue,
      discountType,
      usageLimit: usageLimit || 0,
      perUserLimit: perUserLimit || 1,
      startDate: startDate || campaign?.startDate || null,
      expiresAt: expiresAt || campaign?.endDate || null,
      status: CouponStatus.DRAFT,
      campaign,
      business,
    });

    const savedCoupon = await this.couponRepository.save(coupon);

    if (brandingBusinessId) {
      const brandingBusiness = await this.businessRepository.findOne({
        where: { id: brandingBusinessId },
      });
      if (brandingBusiness) {
        const branding = this.brandingRepository.create({
          coupon: savedCoupon,
          business: brandingBusiness,
        });
        await this.brandingRepository.save(branding);
      }
    }

    return savedCoupon;
  }

  async findAll(pagination: PaginationQueryDto): Promise<PageDto<Coupon>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.couponRepository.findAndCount({
      skip,
      take: limit,
      relations: ['campaign', 'business', 'branding', 'branding.business'],
      order: { created_at: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  // Pre-check only (no row lock): final usageLimit/perUserLimit enforcement
  // happens atomically inside redeem()/redeemForOrder() under
  // SELECT ... FOR UPDATE. Never treat this as a reservation.
  async validateCoupon(
    code: string,
    user: User,
    existingCouponCode?: string,
    subtotal?: number,
  ): Promise<Coupon & { discountAmount: number | null }> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: [
        'campaign',
        'business',
        'business.user',
        'branding',
        'branding.business',
      ],
    });

    if (!coupon) throw new NotFoundException('Coupon not found');

    if (existingCouponCode && existingCouponCode !== code) {
      throw new BadRequestException('Stacking coupons is not allowed.');
    }

    if (
      coupon.status === CouponStatus.DISABLED ||
      coupon.status === CouponStatus.ARCHIVED ||
      coupon.status === CouponStatus.EXPIRED
    ) {
      throw new BadRequestException('Coupon is not active.');
    }
    if (coupon.status === CouponStatus.DRAFT) {
      throw new BadRequestException('Coupon is not yet active.');
    }

    const now = new Date();
    if (coupon.expiresAt && now > coupon.expiresAt)
      throw new BadRequestException('Coupon has expired.');
    if (coupon.campaign) {
      if (coupon.campaign.endDate && now > coupon.campaign.endDate)
        throw new BadRequestException('Campaign has ended.');
      if (coupon.campaign.startDate && now < coupon.campaign.startDate)
        throw new BadRequestException('Campaign has not started yet.');
      if (coupon.campaign.status !== MarketingCampaignStatus.ACTIVE)
        throw new BadRequestException('Campaign is not active.');

      if (
        coupon.campaign.type === MarketingCampaignType.HYPERLOCAL &&
        coupon.campaign.targetPostalCodes?.length > 0
      ) {
        const userAddress = await this.addressRepository.findOne({
          where: { user: { id: user.id }, isMain: true },
        });
        if (!userAddress || !userAddress.postalCode) {
          throw new BadRequestException(
            'A valid shipping address with postal code is required for this hyperlocal offer.',
          );
        }

        const normalizedUserCode = userAddress.postalCode
          .toUpperCase()
          .replace(/\s/g, '');
        const isMatch = coupon.campaign.targetPostalCodes.some((target) => {
          const normalizedTarget = target.toUpperCase().replace(/\s/g, '');
          return normalizedUserCode.startsWith(normalizedTarget);
        });

        if (!isMatch)
          throw new BadRequestException(
            'This coupon is not available in your area.',
          );
      }
    }

    if (coupon.usageLimit > 0) {
      const totalRedemptions = await this.redemptionLogRepository.count({
        where: { coupon: { id: coupon.id }, status: RedemptionStatus.REDEEMED },
      });
      if (totalRedemptions >= coupon.usageLimit)
        throw new BadRequestException('Coupon usage limit reached.');
    }

    const userRedemptions = await this.redemptionLogRepository.count({
      where: {
        coupon: { id: coupon.id },
        user: { id: user.id },
        status: RedemptionStatus.REDEEMED,
      },
    });
    if (userRedemptions >= coupon.perUserLimit) {
      throw new BadRequestException(
        'You have already used this coupon the maximum number of times.',
      );
    }

    if (coupon.sourceType === CouponSourceType.BUSINESS && coupon.business) {
      if (coupon.business.status !== BusinessStatus.PUBLISHED) {
        throw new BadRequestException(
          `Business "${coupon.business.businessName}" is not currently active. Coupon cannot be used.`,
        );
      }
      if (!coupon.business.user || !coupon.business.user.isActive) {
        throw new BadRequestException(
          `The owner of business "${coupon.business.businessName}" is not currently active. Coupon cannot be used.`,
        );
      }

      try {
        await this.capabilityService.checkPermission(
          coupon.business.user.id,
          ActionType.CREATE_COUPON_TEMPLATE,
        );
      } catch (_e) {
        throw new BadRequestException(
          'The business providing this coupon does not have an active tier allowing coupon distribution.',
        );
      }
    }

    // The storefront uses this response to render the discount line before
    // checkout. Compute the amount server-side so the client never has to
    // re-implement coupon maths (and can pass the cart subtotal, if known).
    const validated = coupon as Coupon & { discountAmount: number | null };
    const cartSubtotal = Number(subtotal);
    validated.discountAmount =
      Number.isFinite(cartSubtotal) && cartSubtotal > 0
        ? computeCouponDiscount({
            base: cartSubtotal,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue) || 0,
            maxDiscount: (coupon as any).maxDiscount,
          })
        : null;

    return validated;
  }

  /**
   * Lock the coupon row without joins, then load its (nullable) relations in a
   * separate read. Postgres cannot apply `FOR UPDATE` to the nullable side of
   * an outer join, which `relations: [...]` + `pessimistic_write` produces.
   */
  private async lockAndLoadCoupon(
    couponRepo: Repository<Coupon>,
    code: string,
  ): Promise<Coupon | null> {
    const locked = await couponRepo.findOne({
      where: { code },
      lock: { mode: 'pessimistic_write' },
    });
    if (!locked) return null;
    return (
      (await couponRepo.findOne({
        where: { id: locked.id },
        relations: ['campaign', 'business', 'business.user'],
      })) ?? locked
    );
  }

  private async assertCouponEligibleForRedemption(
    coupon: Coupon,
    user: User,
    logRepo: Repository<RedemptionLog>,
  ): Promise<void> {
    if (coupon.sourceType === CouponSourceType.BUSINESS && coupon.business) {
      if (coupon.business.status !== BusinessStatus.PUBLISHED) {
        throw new BadRequestException(
          `Business "${coupon.business.businessName}" is not currently active. Coupon cannot be redeemed.`,
        );
      }
      if (!coupon.business.user || !coupon.business.user.isActive) {
        throw new BadRequestException(
          `The owner of business "${coupon.business.businessName}" is not currently active. Coupon cannot be redeemed.`,
        );
      }
    }

    const now = new Date();
    if (
      coupon.status !== CouponStatus.ACTIVE &&
      coupon.status !== CouponStatus.SCHEDULED
    ) {
      throw new BadRequestException('Coupon is not active.');
    }
    if (coupon.expiresAt && now > coupon.expiresAt)
      throw new BadRequestException('Coupon has expired.');
    if (coupon.campaign) {
      if (coupon.campaign.status !== MarketingCampaignStatus.ACTIVE)
        throw new BadRequestException('Campaign is not active.');
      if (coupon.campaign.endDate && now > coupon.campaign.endDate)
        throw new BadRequestException('Campaign has ended.');
    }

    if (coupon.usageLimit > 0) {
      const totalRedemptions = await logRepo.count({
        where: {
          coupon: { id: coupon.id },
          status: RedemptionStatus.REDEEMED,
        },
      });
      if (totalRedemptions >= coupon.usageLimit)
        throw new BadRequestException('Coupon usage limit reached.');
    }

    const userRedemptions = await logRepo.count({
      where: {
        coupon: { id: coupon.id },
        user: { id: user.id },
        status: RedemptionStatus.REDEEMED,
      },
    });
    if (userRedemptions >= coupon.perUserLimit) {
      throw new BadRequestException(
        'You have already used this coupon the maximum number of times.',
      );
    }
  }

  async redeem(
    code: string,
    user: User,
    order?: Order,
  ): Promise<RedemptionLog> {
    let consumedCoupon: Coupon | null = null;
    const log = await this.dataSource.transaction(async (manager) => {
      const couponRepo = manager.getRepository(Coupon);
      const logRepo = manager.getRepository(RedemptionLog);

      if (order?.id) {
        const existingLog = await logRepo.findOne({
          where: {
            coupon: { code },
            orderId: order.id,
            status: RedemptionStatus.REDEEMED,
          },
        });
        if (existingLog) return existingLog;
      }

      const coupon = await this.lockAndLoadCoupon(couponRepo, code);

      if (!coupon) throw new NotFoundException('Coupon not found');

      await this.assertCouponEligibleForRedemption(coupon, user, logRepo);
      consumedCoupon = coupon;

      const redemptionLog = logRepo.create({
        coupon,
        user,
        orderId: order?.id || null,
        status: RedemptionStatus.REDEEMED,
      });
      return await logRepo.save(redemptionLog);
    });

    if (consumedCoupon?.issuanceId) {
      this.eventEmitter?.emit(PARTNER_INSTRUMENT_CONSUMED_EVENT, {
        issuanceId: consumedCoupon.issuanceId,
        code: consumedCoupon.code,
        instrumentType: InstrumentType.COUPON,
        instrumentId: consumedCoupon.id,
        amount: Number(consumedCoupon.discountValue),
        note: 'coupon_redeemed',
      });
    }

    return log;
  }

  async findCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['campaign', 'business', 'business.user'],
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async redeemForOrder(
    payload: {
      code: string;
      amount?: number;
      eligibleSubtotal?: number;
      appliedAmount?: number;
      issuanceId?: string | null;
      metadata?: Record<string, any>;
    },
    order: Order,
    manager?: any,
  ): Promise<void> {
    const user = order.user;
    if (manager) {
      const couponRepo = manager.getRepository(Coupon);
      const logRepo = manager.getRepository(RedemptionLog);

      if (order?.id) {
        const existingLog = await logRepo.findOne({
          where: {
            coupon: { code: payload.code },
            orderId: order.id,
            status: RedemptionStatus.REDEEMED,
          },
        });
        if (existingLog) return;
      }

      const coupon = await this.lockAndLoadCoupon(couponRepo, payload.code);
      if (!coupon) throw new NotFoundException('Coupon not found');

      await this.assertCouponEligibleForRedemption(coupon, user, logRepo);

      const log = logRepo.create({
        coupon,
        user,
        orderId: order?.id || null,
        status: RedemptionStatus.REDEEMED,
        issuanceId: payload.issuanceId ?? coupon.issuanceId ?? null,
        eligibleSubtotal:
          payload.eligibleSubtotal !== undefined
            ? roundMoney(payload.eligibleSubtotal)
            : null,
        appliedAmount:
          payload.appliedAmount !== undefined
            ? roundMoney(payload.appliedAmount)
            : null,
        metadata: payload.metadata ?? null,
      });
      await logRepo.save(log);
    } else {
      await this.redeem(payload.code, user, order);
    }
  }

  private async getOwnerBusinessIds(userId: string): Promise<string[]> {
    const businesses = await this.businessRepository.find({
      where: { user: { id: userId } },
    });
    return businesses.map((b) => b.id);
  }

  async getSummaryStatistics(ownerId: string): Promise<{
    totalSold: number;
    totalRedeemed: number;
    outstandingLiability: number;
  }> {
    const stats = await this.getOwnerStats(ownerId);
    return {
      totalSold: stats.totalSold,
      totalRedeemed: stats.totalRedeemed,
      outstandingLiability: stats.outstandingLiability,
    };
  }

  async getOwnerStats(userId: string): Promise<CouponStatsDto> {
    const businessIds = await this.getOwnerBusinessIds(userId);
    if (businessIds.length === 0) {
      return {
        totalSold: 0,
        totalRedeemed: 0,
        outstandingLiability: 0,
        activeCoupons: 0,
      };
    }

    const activeCoupons = await this.couponRepository.count({
      where: {
        business: { id: In(businessIds) },
        status: CouponStatus.ACTIVE,
      },
    });

    const { rawTotalRedeemed } = await this.redemptionLogRepository
      .createQueryBuilder('log')
      .innerJoin('log.coupon', 'coupon')
      .where('coupon.businessId IN (:...businessIds)', { businessIds })
      .andWhere('log.status = :status', { status: RedemptionStatus.REDEEMED })
      .select('SUM(coupon.discountValue)', 'rawTotalRedeemed')
      .getRawOne();

    const totalRedeemed = Number(rawTotalRedeemed || 0);

    const { rawTotalSold } = await this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.businessId IN (:...businessIds)', { businessIds })
      .select(
        'SUM(coupon.discountValue * CASE WHEN coupon.usageLimit > 0 THEN coupon.usageLimit ELSE 1 END)',
        'rawTotalSold',
      )
      .getRawOne();

    const totalSold = Number(rawTotalSold || 0);
    const outstandingLiability = Math.max(0, totalSold - totalRedeemed);

    return {
      totalSold,
      totalRedeemed,
      outstandingLiability,
      activeCoupons,
    };
  }

  async getSalesVsRedemptionsChartData(
    userId: string,
  ): Promise<CouponChartDataDto> {
    const businessIds = await this.getOwnerBusinessIds(userId);
    if (businessIds.length === 0) {
      return { data: [] };
    }

    const rawResults = await this.redemptionLogRepository
      .createQueryBuilder('log')
      .innerJoin('log.coupon', 'coupon')
      .where('coupon.businessId IN (:...businessIds)', { businessIds })
      .andWhere('log.status = :status', { status: RedemptionStatus.REDEEMED })
      .select('SUBSTRING(CAST(log.timestamp AS VARCHAR), 1, 7)', 'month')
      .addSelect('COUNT(log.id)', 'redemptions')
      .groupBy('SUBSTRING(CAST(log.timestamp AS VARCHAR), 1, 7)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const data = rawResults.map((r) => ({
      month: r.month,
      sales: 0,
      redemptions: Number(r.redemptions || 0),
    }));

    return { data };
  }

  async getTransactionHistoryForOwner(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CouponTransactionHistoryDto[]> {
    const businessIds = await this.getOwnerBusinessIds(userId);
    if (businessIds.length === 0) {
      return [];
    }

    const query = this.redemptionLogRepository
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.coupon', 'coupon')
      .leftJoinAndSelect('log.user', 'user')
      .where('coupon.businessId IN (:...businessIds)', { businessIds })
      .orderBy('log.timestamp', 'DESC');

    if (startDate) {
      query.andWhere('log.timestamp >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      query.andWhere('log.timestamp <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    const logs = await query.getMany();

    return logs.map((log) => ({
      id: log.id,
      type: TransactionType.REDEMPTION,
      amount: Number(log.coupon?.discountValue || 0),
      createdAt: log.timestamp,
      customerName: log.user
        ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() ||
          log.user.fullName ||
          'N/A'
        : 'N/A',
      customerEmail: log.user?.email || 'N/A',
      couponCode: log.coupon?.code || '',
    }));
  }

  async countForUser(userId: string): Promise<number> {
    return this.couponRepository.count({
      where: { business: { user: { id: userId } } },
      relations: ['business', 'business.user'],
    });
  }

  // ==== Consumer endpoints for saved coupons ====

  async saveCoupon(code: string, user: User): Promise<SavedCoupon> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const existing = await this.savedCouponRepository.findOne({
      where: { user: { id: user.id }, coupon: { id: coupon.id } },
    });

    if (existing) {
      throw new BadRequestException('Coupon is already saved');
    }

    const savedCoupon = this.savedCouponRepository.create({
      user,
      coupon,
    });

    return await this.savedCouponRepository.save(savedCoupon);
  }

  async removeSavedCoupon(code: string, user: User): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const savedCoupon = await this.savedCouponRepository.findOne({
      where: { user: { id: user.id }, coupon: { id: coupon.id } },
    });

    if (!savedCoupon) {
      throw new NotFoundException('Coupon was not saved');
    }

    await this.savedCouponRepository.remove(savedCoupon);
  }

  async getSavedCoupons(user: User): Promise<SavedCoupon[]> {
    return this.savedCouponRepository.find({
      where: { user: { id: user.id } },
      relations: ['coupon', 'coupon.campaign', 'coupon.business'],
      order: { savedAt: 'DESC' },
    });
  }

  async findProductById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['business', 'campaign'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found.');
    }

    return coupon;
  }

  async findAllForUser(
    user: User,
    pagination: PaginationQueryDto,
  ): Promise<PageDto<Coupon>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.couponRepository.findAndCount({
      where: { business: { user: { id: user.id } } },
      skip,
      take: limit,
      relations: ['campaign', 'business', 'branding', 'branding.business'],
      order: { created_at: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: items.length,
      totalItems: total,
      pageOptionsDto: pagination as any,
    });

    return new PageDto(items, pageMetaDto);
  }

  async redeemManual(
    code: string,
    requester: { id: string; role?: string },
  ): Promise<{ success: boolean; message: string; coupon: Coupon }> {
    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['business', 'business.user'],
    });
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found.`);
    }

    // Authorization: only the issuing merchant or a platform admin may
    // manually redeem a coupon. Coupons are otherwise bearer tokens usable
    // by shoppers, but merchants must not be able to burn others' coupons.
    const isAdmin = requester.role === UserRole.ADMIN;
    const ownerId = (coupon.business as any)?.user?.id;
    const isOwner = !!ownerId && ownerId === requester.id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You are not authorized to redeem this coupon.',
      );
    }

    // Route through the locked transactional path so usageLimit/perUserLimit
    // are enforced atomically under SELECT ... FOR UPDATE (see redeem()).
    const user = { id: requester.id } as User;
    const log = await this.redeem(code, user);
    void log;
    return {
      success: true,
      message: `Coupon ${code} redeemed successfully.`,
      coupon,
    };
  }

  // --- System Integration Methods ---

  /**
   * Create a single-use coupon on behalf of an ecosystem partner (e.g. MCOM
   * Rewards issuing a coupon-type reward). Mirrors the gift card / voucher
   * partner integration: the caller supplies a value and an optional shared
   * `code`. Platform-sourced, so no business capability check is required.
   * Called over the zero-hop service mesh — the caller is authenticated by an
   * RS256 service token, never a shared secret.
   *
   * Idempotent on `code`: re-delivering the same code returns the existing
   * coupon instead of failing on the unique constraint.
   */
  async createPartnerCoupon(payload: {
    amount: number;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
    businessName?: string;
    code?: string;
    expiresAt?: string | Date;
    usageLimit?: number;
    perUserLimit?: number;
    issuanceId?: string;
    templateId?: string;
    businessId?: string;
    scope?: InstrumentScopeDto;
    metadata?: Record<string, any>;
    context?: PartnerRequestContext;
  }): Promise<Coupon> {
    const amount = roundMoney(Number(payload.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Coupon amount must be a positive number.');
    }
    const sourceApp = 'mcom-rewards';
    const issuanceId = payload.issuanceId ?? null;

    if (issuanceId) {
      const existing = await this.couponRepository.findOne({
        where: { sourceApp, issuanceId },
      });
      if (existing) return markReplayed(existing);
    }

    const providedCode = (payload.code || '').trim();
    if (providedCode) {
      const existing = await this.couponRepository.findOne({
        where: { code: providedCode },
      });
      if (existing) {
        if (issuanceId && existing.issuanceId !== issuanceId) {
          throw new ConflictException(
            'CODE_ALREADY_USED: this code belongs to a different issuance.',
          );
        }
        return markReplayed(existing);
      }
    }

    let template: Coupon | null = null;
    if (payload.templateId) {
      template = await this.couponRepository.findOne({
        where: { id: payload.templateId },
        relations: ['business', 'business.user'],
      });
      if (!template) throw new NotFoundException('Coupon template not found.');
      if (template.status === CouponStatus.ARCHIVED) {
        throw new UnprocessableEntityException('TEMPLATE_INACTIVE');
      }
    }

    let business: Business | null = template?.business ?? null;
    if (payload.businessId) {
      business = await this.businessRepository.findOne({
        where: { id: payload.businessId },
        relations: ['user'],
      });
      if (!business) throw new NotFoundException('Business not found.');
    }

    if (
      template?.business?.id &&
      business?.id &&
      template.business.id !== business.id
    ) {
      throw new ForbiddenException(
        'TEMPLATE_NOT_OWNED: the coupon template is not owned by the bound business.',
      );
    }

    const code = (
      providedCode || `MC${crypto.randomBytes(6).toString('hex').toUpperCase()}`
    ).slice(0, 20);

    const expiresAt = payload.expiresAt
      ? new Date(payload.expiresAt)
      : (template?.expiresAt ?? null) ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    const coupon = this.couponRepository.create({
      code,
      title:
        payload.message ||
        template?.title ||
        `Reward from ${payload.businessName || business?.businessName || 'MCOM Rewards'}`,
      description:
        payload.message ||
        template?.description ||
        `Reward coupon from ${payload.businessName || business?.businessName || 'MCOM Rewards'}`,
      sourceType:
        template?.sourceType ??
        (business ? CouponSourceType.BUSINESS : CouponSourceType.PLATFORM),
      discountType: template?.discountType ?? DiscountType.FIXED,
      discountValue: amount,
      usageLimit: payload.usageLimit ?? template?.usageLimit ?? 1,
      perUserLimit: payload.perUserLimit ?? template?.perUserLimit ?? 1,
      startDate: template?.startDate ?? new Date(),
      expiresAt,
      status: template?.status ?? CouponStatus.ACTIVE,
      business: business ?? undefined,
      issuanceId,
      sourceApp: issuanceId ? sourceApp : null,
      metadata: {
        ...(payload.metadata ?? {}),
        recipientEmail: payload.recipientEmail ?? null,
        recipientName: payload.recipientName ?? null,
        businessName: payload.businessName ?? business?.businessName ?? null,
        templateId: template?.id ?? null,
      },
    });

    let savedCoupon: Coupon;
    try {
      savedCoupon = await this.couponRepository.save(coupon);
    } catch (err: any) {
      if (err?.code === '23505') {
        const existing = issuanceId
          ? await this.couponRepository.findOne({
              where: { sourceApp, issuanceId },
            })
          : await this.couponRepository.findOne({ where: { code } });
        if (existing) {
          if (
            issuanceId &&
            existing.issuanceId &&
            existing.issuanceId !== issuanceId
          ) {
            throw new ConflictException(
              'CODE_ALREADY_USED: this code belongs to a different issuance.',
            );
          }
          return markReplayed(existing);
        }
      }
      throw err;
    }

    if (
      this.instrumentScopeService &&
      payload.context?.scopeEnabled !== false &&
      (payload.scope || business || template?.scopeConfig)
    ) {
      await this.instrumentScopeService.saveScope({
        instrumentType: InstrumentType.COUPON,
        instrumentId: savedCoupon.id,
        businessId: business?.id ?? null,
        scope: payload.scope,
        context: payload.context,
        templateScope: (template?.scopeConfig as any) ?? null,
        tenantBusinessId: business?.id ?? null,
      });
    }

    return savedCoupon;
  }
}

function roundMoney(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
