import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { MembershipService } from '../membership/membership.service';
import { PublicTakeadsOfferQueryDto } from './dto/takeads-query.dto';
import { TakeadsClick } from './entities/takeads-click.entity';
import { TakeadsCoupon } from './entities/takeads-coupon.entity';
import { TakeadsOffer } from './entities/takeads-offer.entity';
import {
  TAKEADS_AFFILIATE_DISCLOSURE,
  TAKEADS_PLAN_ONLY_PUBLISHABLE_SQL,
  TAKEADS_PUBLISHABLE_SQL,
} from './takeads.constants';
import { isSafeHttpUrl } from './takeads.mapper';
import { penceToPounds } from './takeads.money';

export interface TakeadsClickContext {
  source?: string;
  placement?: string;
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class TakeadsPublicService {
  constructor(
    private readonly membershipService: MembershipService,
    @InjectRepository(TakeadsOffer)
    private readonly offerRepository: Repository<TakeadsOffer>,
    @InjectRepository(TakeadsCoupon)
    private readonly couponRepository: Repository<TakeadsCoupon>,
    @InjectRepository(TakeadsClick)
    private readonly clickRepository: Repository<TakeadsClick>,
  ) {}

  async listOffers(query: PublicTakeadsOfferQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const qb = this.offerRepository
      .createQueryBuilder('offer')
      .where(TAKEADS_PUBLISHABLE_SQL);

    if (query.q) {
      qb.andWhere(
        '(offer.title ILIKE :q OR offer.description ILIKE :q OR offer.shortDescription ILIKE :q OR offer.merchantName ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }
    if (query.categoryId) {
      qb.andWhere('offer.mcomCategoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.sectorId) {
      qb.andWhere('offer.mcomSectorId = :sectorId', { sectorId: query.sectorId });
    }
    if (query.merchantId) {
      qb.andWhere('offer.externalMerchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }
    if (query.offerType) {
      qb.andWhere('offer.offerType = :offerType', {
        offerType: query.offerType,
      });
    }
    if (query.placement) {
      qb.andWhere('offer.placement = :placement', {
        placement: query.placement,
      });
    }
    if (query.country) {
      qb.andWhere('offer.countryCode = :country', { country: query.country });
    }

    qb.orderBy('offer.isFeatured', 'DESC')
      .addOrderBy('offer.displayOrder', 'ASC')
      .addOrderBy('offer.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [offers, total] = await qb.getManyAndCount();
    const couponCodes = await this.loadCouponCodes(offers);

    return {
      data: offers.map((offer) =>
        this.toPublicOffer(offer, couponCodes.get(offer.externalCouponId ?? '')),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async listDeals(query: PublicTakeadsOfferQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    // /deals is the single public marketplace for every published public
    // offer. Only plan-only offers are withheld for the business dashboard.
    const qb = this.offerRepository
      .createQueryBuilder('offer')
      .where(TAKEADS_PUBLISHABLE_SQL);

    if (query.q) {
      qb.andWhere(
        '(offer.title ILIKE :q OR offer.description ILIKE :q OR offer.merchantName ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }
    if (query.merchantId) {
      qb.andWhere('offer.externalMerchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }

    qb.orderBy('offer.isFeatured', 'DESC')
      .addOrderBy('offer.displayOrder', 'ASC')
      .addOrderBy('offer.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [offers, total] = await qb.getManyAndCount();
    const couponCodes = await this.loadCouponCodes(offers);

    return {
      data: offers.map((offer) =>
        this.toPublicOffer(offer, couponCodes.get(offer.externalCouponId ?? '')),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Authenticated business-only feed. The user's effective plan variant is
   * resolved server-side; the client never chooses which plans it can see.
   */
  async listBusinessDeals(query: PublicTakeadsOfferQueryDto, user: User) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const access = await this.resolvePlanAccess(user);

    if (!access.planVariantId) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
        planVariantId: null,
        planLabel: null,
      };
    }

    const qb = this.offerRepository
      .createQueryBuilder('offer')
      .where(TAKEADS_PLAN_ONLY_PUBLISHABLE_SQL)
      .andWhere('jsonb_exists(offer."allowedPlanVariantIds", :planVariantId)', {
        planVariantId: access.planVariantId,
      });

    if (query.q) {
      qb.andWhere(
        '(offer.title ILIKE :q OR offer.description ILIKE :q OR offer.shortDescription ILIKE :q OR offer.merchantName ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }
    if (query.merchantId) {
      qb.andWhere('offer.externalMerchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }

    qb.orderBy('offer.isFeatured', 'DESC')
      .addOrderBy('offer.displayOrder', 'ASC')
      .addOrderBy('offer.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [offers, total] = await qb.getManyAndCount();
    const couponCodes = await this.loadCouponCodes(offers);

    return {
      data: offers.map((offer) =>
        this.toPublicOffer(offer, couponCodes.get(offer.externalCouponId ?? '')),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      planVariantId: access.planVariantId,
      planLabel: access.planLabel,
    };
  }

  /** Same eligibility check for a single plan-only offer. */
  async getBusinessOffer(id: string, user: User) {
    const access = await this.resolvePlanAccess(user);
    if (!access.planVariantId) {
      throw new ForbiddenException(
        'Your current plan does not include partner-only deals.',
      );
    }

    const offer = await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.id = :id', { id })
      .andWhere(TAKEADS_PLAN_ONLY_PUBLISHABLE_SQL)
      .andWhere('jsonb_exists(offer."allowedPlanVariantIds", :planVariantId)', {
        planVariantId: access.planVariantId,
      })
      .getOne();

    if (!offer) {
      throw new NotFoundException('This deal is not available to your plan.');
    }

    const couponCodes = await this.loadCouponCodes([offer]);
    return this.toPublicOffer(
      offer,
      couponCodes.get(offer.externalCouponId ?? ''),
    );
  }

  async getOffer(id: string) {
    const offer = await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.id = :id', { id })
      .andWhere(TAKEADS_PUBLISHABLE_SQL)
      .getOne();

    if (!offer) {
      throw new NotFoundException('This offer is no longer available.');
    }

    const couponCodes = await this.loadCouponCodes([offer]);
    return this.toPublicOffer(
      offer,
      couponCodes.get(offer.externalCouponId ?? ''),
    );
  }

  async recordClick(offerId: string, context: TakeadsClickContext) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer || !this.isPublishable(offer)) {
      throw new NotFoundException('This offer is no longer available.');
    }

    await this.assertCouponStillAvailable(offer);

    return this.saveClick(offer, context);
  }

  /**
   * Authenticated click-through for plan-only deals. Returns the destination
   * rather than redirecting so the storefront can authenticate with its bearer
   * token before opening the external merchant in a new tab.
   */
  async recordBusinessClick(
    offerId: string,
    context: TakeadsClickContext,
    user: User,
  ) {
    const access = await this.resolvePlanAccess(user);
    if (!access.planVariantId) {
      throw new ForbiddenException(
        'Your current plan does not include partner-only deals.',
      );
    }

    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });
    if (
      !offer ||
      !this.isPlanOnlyPublishable(offer) ||
      !(offer.allowedPlanVariantIds ?? []).includes(access.planVariantId)
    ) {
      throw new ForbiddenException(
        'This deal is not available to your current plan.',
      );
    }

    await this.assertCouponStillAvailable(offer);

    return this.saveClick(offer, context);
  }

  private async assertCouponStillAvailable(offer: TakeadsOffer): Promise<void> {
    if (offer.sourceType !== 'coupon' || !offer.externalCouponId) return;

    const coupon = await this.couponRepository.findOne({
      where: { externalCouponId: offer.externalCouponId },
    });
    if (!coupon || !coupon.isActive || coupon.adminDisabled) {
      throw new ForbiddenException('This deal is no longer available.');
    }
    if (coupon.endDate && new Date(coupon.endDate).getTime() < Date.now()) {
      throw new ForbiddenException('This deal has expired.');
    }
  }

  private async saveClick(offer: TakeadsOffer, context: TakeadsClickContext) {
    const clickRef = `mcom-takeads-${randomBytes(8).toString('hex')}`;
    await this.clickRepository.save(
      this.clickRepository.create({
        offerId: offer.id,
        merchantId: offer.externalMerchantId ?? null,
        couponId: offer.externalCouponId ?? null,
        clickRef,
        subId: offer.subId ?? null,
        source: context.source?.slice(0, 40) ?? 'marketplace',
        placement: context.placement?.slice(0, 40) ?? offer.placement,
        destinationUrl: offer.destinationUrl,
        trackingUrl: offer.resolvedTrackingUrl,
        referrer: context.referrer?.slice(0, 2048) ?? null,
        userAgent: context.userAgent?.slice(0, 512) ?? null,
        ipHash: this.hashIp(context.ip),
      }),
    );

    return {
      url: offer.resolvedTrackingUrl as string,
      clickRef,
    };
  }

  private isBasePublishable(offer: TakeadsOffer): boolean {
    const now = Date.now();
    return (
      offer.approvalStatus === 'approved' &&
      offer.publicationStatus === 'published' &&
      !offer.adminDisabled &&
      offer.upstreamActive &&
      isSafeHttpUrl(offer.resolvedTrackingUrl) &&
      (!offer.startDate || new Date(offer.startDate).getTime() <= now) &&
      (!offer.endDate || new Date(offer.endDate).getTime() >= now)
    );
  }

  /** Public clicks must never reach a business-only deal. */
  private isPublishable(offer: TakeadsOffer): boolean {
    return this.isBasePublishable(offer) && offer.visibility === 'public';
  }

  private isPlanOnlyPublishable(offer: TakeadsOffer): boolean {
    return (
      this.isBasePublishable(offer) &&
      offer.visibility === 'plan_only' &&
      (offer.allowedPlanVariantIds ?? []).length > 0
    );
  }

  /**
   * Resolve the plan variant that currently entitles this business. The
   * client never supplies a variant ID: plan-only deals are matched against
   * the effective Mall/CHS membership server-side.
   */
  private async resolvePlanAccess(
    user: User,
  ): Promise<{ planVariantId: string | null; planLabel: string | null }> {
    const effective = await this.membershipService.resolveEffectiveMembership(
      user.id || (user as any).userId,
    );
    const membership = effective?.membership;
    const variant = membership?.planVariant;

    if (!membership?.planVariantId || !variant) {
      return { planVariantId: null, planLabel: null };
    }

    const planName = variant.plan?.name ?? 'Plan';
    const tierName = variant.tierLevel?.name ?? 'STANDARD';
    const tierLabels: Record<string, string> = {
      STANDARD: 'Standard',
      PRO: 'Pro',
      PRO_PLUS: 'Pro+',
    };
    const tierLabel = tierLabels[tierName] ?? tierName;

    return {
      planVariantId: membership.planVariantId,
      planLabel: `${planName} · ${tierLabel}`,
    };
  }

  /**
   * Coupon codes are source data, never generated by MCOM. Only approved,
   * enabled coupons can contribute a code to a published offer.
   */
  private async loadCouponCodes(
    offers: TakeadsOffer[],
  ): Promise<Map<string, string>> {
    const ids = Array.from(
      new Set(
        offers
          .filter(
            (offer) => offer.sourceType === 'coupon' && offer.externalCouponId,
          )
          .map((offer) => offer.externalCouponId as string),
      ),
    );
    if (ids.length === 0) return new Map();

    const coupons = await this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.externalCouponId IN (:...ids)', { ids })
      .andWhere('coupon.approvalStatus = :approved', { approved: 'approved' })
      .andWhere('coupon.adminDisabled = false')
      .andWhere('coupon.code IS NOT NULL')
      .getMany();

    return new Map(
      coupons.map((coupon) => [coupon.externalCouponId, coupon.code as string]),
    );
  }

  /**
   * Public responses are explicitly whitelisted. Internal fields (tracking
   * URL, subId, raw upstream payload, reviewer IDs, source IDs) must never
   * reach the storefront.
   */
  private toPublicOffer(offer: TakeadsOffer, couponCode?: string) {
    return {
      id: offer.id,
      title: offer.title,
      shortDescription: offer.shortDescription ?? null,
      description: offer.description ?? null,
      merchantName: offer.merchantName ?? null,
      images: offer.images ?? null,
      offerType: offer.offerType,
      campaignLabel: offer.campaignLabel ?? null,
      placement: offer.placement,
      countryCode: offer.countryCode,
      currency: offer.currency,
      // Stored as integer pence, returned as GBP pounds to the storefront.
      price: penceToPounds(offer.price),
      visibility: offer.visibility,
      termsAndConditions: offer.termsAndConditions ?? null,
      startDate: offer.startDate ?? null,
      endDate: offer.endDate ?? null,
      isFeatured: offer.isFeatured,
      couponCode: couponCode ?? null,
      sourceLabel:
        offer.offerType === 'coupon' || offer.offerType === 'deal'
          ? 'Coupon / Deal'
          : 'National Brand',
      affiliateDisclosure: TAKEADS_AFFILIATE_DISCLOSURE,
      external: true,
      created_at: offer.created_at,
    };
  }

  private hashIp(ip?: string): string | undefined {
    if (!ip) return undefined;
    const salt = process.env.TAKEADS_IP_HASH_SALT || 'mcom-mall';
    return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
  }
}
