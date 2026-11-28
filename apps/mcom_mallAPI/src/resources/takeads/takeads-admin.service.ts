import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PlanVariant } from '../plans/entities/plan-variant.entity';
import {
  CreateTakeadsOfferDto,
  RejectTakeadsOfferDto,
  ReviewTakeadsCouponDto,
  ReviewTakeadsMerchantDto,
  UpdateTakeadsOfferDto,
} from './dto/takeads-offer.dto';
import {
  TakeadsCouponQueryDto,
  TakeadsMerchantQueryDto,
  TakeadsOfferQueryDto,
  TakeadsReportQueryDto,
} from './dto/takeads-query.dto';
import { TakeadsAction } from './entities/takeads-action.entity';
import { TakeadsClick } from './entities/takeads-click.entity';
import { TakeadsClickReport } from './entities/takeads-click-report.entity';
import { TakeadsCoupon } from './entities/takeads-coupon.entity';
import { TakeadsMerchant } from './entities/takeads-merchant.entity';
import { TakeadsOffer } from './entities/takeads-offer.entity';
import { TakeadsSyncRun } from './entities/takeads-sync-run.entity';
import { TakeadsClient } from './takeads.client';
import {
  TAKEADS_AFFILIATE_DISCLOSURE,
  TAKEADS_VISIBILITIES,
  TakeadsVisibility,
} from './takeads.constants';
import { isSafeHttpUrl } from './takeads.mapper';
import { penceToPounds, poundsToPence } from './takeads.money';
import { TakeadsSyncService } from './takeads-sync.service';

interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TakeadsAdminService {
  constructor(
    private readonly client: TakeadsClient,
    private readonly syncService: TakeadsSyncService,
    @InjectRepository(TakeadsMerchant)
    private readonly merchantRepository: Repository<TakeadsMerchant>,
    @InjectRepository(TakeadsCoupon)
    private readonly couponRepository: Repository<TakeadsCoupon>,
    @InjectRepository(TakeadsOffer)
    private readonly offerRepository: Repository<TakeadsOffer>,
    @InjectRepository(TakeadsClick)
    private readonly clickRepository: Repository<TakeadsClick>,
    @InjectRepository(TakeadsClickReport)
    private readonly clickReportRepository: Repository<TakeadsClickReport>,
    @InjectRepository(TakeadsAction)
    private readonly actionRepository: Repository<TakeadsAction>,
    @InjectRepository(TakeadsSyncRun)
    private readonly syncRunRepository: Repository<TakeadsSyncRun>,
    @InjectRepository(PlanVariant)
    private readonly planVariantRepository: Repository<PlanVariant>,
  ) {}

  /** Admin responses always expose GBP pounds, never stored pence. */
  private toAdminOffer(offer: TakeadsOffer): TakeadsOffer {
    return { ...offer, price: penceToPounds(offer.price) };
  }

  private async findOfferEntity(id: string): Promise<TakeadsOffer> {
    const offer = await this.offerRepository.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('TakeAds offer not found');
    return offer;
  }

  /**
   * Plan-only audiences reference concrete PlanVariant rows from /admin/plans,
   * not loose tier names. Validate both existence and current activation.
   */
  private async resolveAudience(dto: {
    visibility?: TakeadsVisibility;
    allowedPlanVariantIds?: string[];
  }): Promise<{
    visibility: TakeadsVisibility;
    allowedPlanVariantIds: string[];
  }> {
    const visibility = dto.visibility ?? 'public';
    if (!TAKEADS_VISIBILITIES.includes(visibility)) {
      throw new BadRequestException('Invalid offer audience.');
    }

    if (visibility === 'public') {
      return { visibility, allowedPlanVariantIds: [] };
    }

    const ids = Array.from(new Set(dto.allowedPlanVariantIds ?? []));
    if (ids.length === 0) {
      throw new BadRequestException(
        'Select at least one plan variant for a plan-only offer.',
      );
    }

    const activeCount = await this.planVariantRepository
      .createQueryBuilder('variant')
      .innerJoin('variant.plan', 'plan')
      .where('variant.id IN (:...ids)', { ids })
      .andWhere('variant.isActive = true')
      .andWhere('plan.isActive = true')
      .getCount();

    if (activeCount !== ids.length) {
      throw new BadRequestException(
        'One or more selected plan variants are not available in /admin/plans.',
      );
    }

    return { visibility, allowedPlanVariantIds: ids };
  }

  async getOverview() {
    const [
      merchants,
      activeMerchants,
      acceptedMerchants,
      coupons,
      activeCoupons,
      offers,
      pendingOffers,
      approvedOffers,
      publishedOffers,
      mcomClicks,
      takeadsClickRow,
      actionRows,
      lastSuccessful,
      recentRuns,
    ] = await Promise.all([
      this.merchantRepository.count(),
      this.merchantRepository.count({ where: { isActive: true } }),
      this.merchantRepository.count({ where: { mcomStatus: 'accepted' } }),
      this.couponRepository.count(),
      this.couponRepository.count({ where: { isActive: true } }),
      this.offerRepository.count(),
      this.offerRepository.count({ where: { approvalStatus: 'pending' } }),
      this.offerRepository.count({ where: { approvalStatus: 'approved' } }),
      this.offerRepository.count({ where: { publicationStatus: 'published' } }),
      this.clickRepository.count(),
      this.clickReportRepository
        .createQueryBuilder('report')
        .select('COALESCE(SUM(report.count), 0)', 'count')
        .getRawOne<{ count: string }>(),
      this.actionRepository.find(),
      this.syncRunRepository.findOne({
        where: { status: 'success' },
        order: { finishedAt: 'DESC' },
      }),
      this.syncRunRepository.find({ order: { startedAt: 'DESC' }, take: 10 }),
    ]);

    const actionSummary = this.summariseActions(actionRows);

    return {
      connection: {
        platformConfigured: this.client.isPlatformConfigured,
        accountConfigured: this.client.isAccountConfigured,
        dedicatedAccountKey: this.client.hasDedicatedAccountKey,
        baseUrl: this.client.baseUrl,
        syncEnabled: this.syncService.enabled,
      },
      lastSuccessfulSync: lastSuccessful?.finishedAt ?? null,
      recentSyncRuns: recentRuns,
      counts: {
        merchants,
        activeMerchants,
        acceptedMerchants,
        coupons,
        activeCoupons,
        offers,
        pendingOffers,
        approvedOffers,
        publishedOffers,
      },
      mcomClicks,
      takeadsClicks: Number(takeadsClickRow?.count ?? 0),
      actions: actionSummary,
    };
  }

  getSettings() {
    return {
      baseUrl: this.client.baseUrl,
      platformConfigured: this.client.isPlatformConfigured,
      accountConfigured: this.client.isAccountConfigured,
      dedicatedAccountKey: this.client.hasDedicatedAccountKey,
      syncEnabled: this.syncService.enabled,
      defaultCountry: process.env.TAKEADS_DEFAULT_COUNTRY || 'GB',
      defaultLanguage: process.env.TAKEADS_DEFAULT_LANGUAGE || 'en',
    };
  }

  async listMerchants(query: TakeadsMerchantQueryDto): Promise<Page<TakeadsMerchant>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.merchantRepository.createQueryBuilder('merchant');

    if (query.search) {
      qb.andWhere(
        '(merchant.name ILIKE :search OR merchant.defaultDomain ILIKE :search OR merchant.externalMerchantId ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.status) {
      qb.andWhere('merchant.mcomStatus = :status', { status: query.status });
    }
    if (query.country) {
      qb.andWhere('merchant.countryCodes ILIKE :country', {
        country: `%${query.country}%`,
      });
    }
    if (query.active !== undefined) {
      qb.andWhere('merchant.isActive = :active', { active: query.active });
    }

    qb.orderBy('merchant.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async getMerchant(id: string) {
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) throw new NotFoundException('TakeAds merchant not found');

    const [coupons, offers] = await Promise.all([
      this.couponRepository.find({
        where: { merchantId: id },
        order: { created_at: 'DESC' },
        take: 50,
      }),
      this.offerRepository.find({
        where: { externalMerchantId: merchant.externalMerchantId },
        order: { created_at: 'DESC' },
        take: 50,
      }),
    ]);

    return {
      ...merchant,
      coupons,
      offers: offers.map((offer) => this.toAdminOffer(offer)),
    };
  }

  async reviewMerchant(
    id: string,
    dto: ReviewTakeadsMerchantDto,
    userId?: string,
  ) {
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) throw new NotFoundException('TakeAds merchant not found');

    merchant.mcomStatus = dto.status;
    if (dto.mcomSectorId !== undefined) merchant.mcomSectorId = dto.mcomSectorId;
    if (dto.mcomCategoryId !== undefined) {
      merchant.mcomCategoryId = dto.mcomCategoryId;
    }
    if (dto.mcomSubCategoryId !== undefined) {
      merchant.mcomSubCategoryId = dto.mcomSubCategoryId;
    }
    if (dto.reviewNote !== undefined) merchant.reviewNote = dto.reviewNote;
    merchant.reviewedBy = userId ?? null;
    merchant.reviewedAt = new Date();

    return this.merchantRepository.save(merchant);
  }

  async listCoupons(query: TakeadsCouponQueryDto): Promise<Page<TakeadsCoupon>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.couponRepository.createQueryBuilder('coupon');

    if (query.search) {
      qb.andWhere(
        '(coupon.name ILIKE :search OR coupon.code ILIKE :search OR coupon.externalCouponId ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.approvalStatus) {
      qb.andWhere('coupon.approvalStatus = :approvalStatus', {
        approvalStatus: query.approvalStatus,
      });
    }
    if (query.publicationStatus) {
      qb.andWhere('coupon.publicationStatus = :publicationStatus', {
        publicationStatus: query.publicationStatus,
      });
    }
    if (query.merchantId) {
      qb.andWhere('coupon.merchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }
    if (query.active !== undefined) {
      qb.andWhere('coupon.isActive = :active', { active: query.active });
    }

    qb.orderBy('coupon.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async getCoupon(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('TakeAds coupon not found');
    const merchant = coupon.merchantId
      ? await this.merchantRepository.findOne({
          where: { id: coupon.merchantId },
        })
      : null;
    return { ...coupon, merchant };
  }

  async reviewCoupon(
    id: string,
    dto: ReviewTakeadsCouponDto,
    userId?: string,
  ) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('TakeAds coupon not found');

    if (dto.publicationStatus === 'published') {
      if (!coupon.isActive) {
        throw new BadRequestException(
          'This coupon is inactive upstream and cannot be published.',
        );
      }
      if (coupon.endDate && new Date(coupon.endDate).getTime() < Date.now()) {
        throw new BadRequestException(
          'This coupon has expired and cannot be published.',
        );
      }
    }

    if (dto.approvalStatus !== undefined) {
      coupon.approvalStatus = dto.approvalStatus;
    }
    if (dto.publicationStatus !== undefined) {
      coupon.publicationStatus = dto.publicationStatus;
    }
    if (dto.adminDisabled !== undefined) {
      coupon.adminDisabled = dto.adminDisabled;
    }
    if (dto.reviewNote !== undefined) coupon.reviewNote = dto.reviewNote;
    coupon.reviewedBy = userId ?? null;
    coupon.reviewedAt = new Date();

    return this.couponRepository.save(coupon);
  }

  async listOffers(query: TakeadsOfferQueryDto): Promise<Page<TakeadsOffer>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.offerRepository.createQueryBuilder('offer');

    if (query.search) {
      qb.andWhere(
        '(offer.title ILIKE :search OR offer.merchantName ILIKE :search OR offer.campaignLabel ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.approvalStatus) {
      qb.andWhere('offer.approvalStatus = :approvalStatus', {
        approvalStatus: query.approvalStatus,
      });
    }
    if (query.publicationStatus) {
      qb.andWhere('offer.publicationStatus = :publicationStatus', {
        publicationStatus: query.publicationStatus,
      });
    }
    if (query.sourceType) {
      qb.andWhere('offer.sourceType = :sourceType', {
        sourceType: query.sourceType,
      });
    }
    if (query.offerType) {
      qb.andWhere('offer.offerType = :offerType', {
        offerType: query.offerType,
      });
    }
    if (query.visibility) {
      qb.andWhere('offer.visibility = :visibility', {
        visibility: query.visibility,
      });
    }
    if (query.merchantId) {
      qb.andWhere('offer.externalMerchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }

    qb.orderBy('offer.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data: data.map((offer) => this.toAdminOffer(offer)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getOffer(id: string) {
    return this.toAdminOffer(await this.findOfferEntity(id));
  }

  async createOffer(dto: CreateTakeadsOfferDto, userId?: string) {
    if (dto.resolvedTrackingUrl && !isSafeHttpUrl(dto.resolvedTrackingUrl)) {
      throw new BadRequestException(
        'The resolved tracking URL must be a safe http(s) URL.',
      );
    }
    if (dto.subId && !/^[A-Za-z0-9_-]{1,30}$/.test(dto.subId)) {
      throw new BadRequestException('Invalid TakeAds subId.');
    }

    let destinationUrl = dto.destinationUrl;
    let resolvedTrackingUrl = dto.resolvedTrackingUrl;
    let title = dto.title;
    let description = dto.description;
    let shortDescription = dto.shortDescription;
    let images = dto.images;
    let externalMerchantId = dto.externalMerchantId;
    let merchantName = dto.merchantName;
    let offerType = dto.offerType;
    let startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    let endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    let termsAndConditions = dto.termsAndConditions;

    if (dto.sourceType === 'product_url') {
      // Approving a merchant is what unlocks product creation under it. It
      // still does not publish anything: the new offer stays pending.
      if (!dto.externalMerchantId) {
        throw new BadRequestException(
          'Select an approved merchant before adding an affiliate product.',
        );
      }
      const merchant = await this.merchantRepository.findOne({
        where: { externalMerchantId: dto.externalMerchantId },
      });
      if (!merchant || merchant.mcomStatus !== 'accepted') {
        throw new BadRequestException(
          'Only an approved merchant can provide affiliate products.',
        );
      }
      if (!merchant.isActive) {
        throw new BadRequestException(
          'This merchant is inactive upstream and cannot provide products.',
        );
      }
      if (!dto.resolvedTrackingUrl || !dto.subId) {
        throw new BadRequestException(
          'Resolve the affiliate link before creating a product offer.',
        );
      }
      externalMerchantId = merchant.externalMerchantId;
      merchantName = merchantName || merchant.name;
    }

    if (dto.sourceType === 'coupon') {
      if (!dto.externalCouponId) {
        throw new BadRequestException('externalCouponId is required for a coupon offer.');
      }
      const coupon = await this.couponRepository.findOne({
        where: { externalCouponId: dto.externalCouponId },
      });
      if (!coupon) throw new NotFoundException('TakeAds coupon not found');
      if (coupon.approvalStatus !== 'approved') {
        throw new BadRequestException(
          'Approve the TakeAds coupon before creating an offer from it.',
        );
      }
      if (!coupon.isActive || coupon.adminDisabled) {
        throw new BadRequestException(
          'This coupon is inactive upstream and cannot be used.',
        );
      }
      if (coupon.endDate && new Date(coupon.endDate).getTime() < Date.now()) {
        throw new BadRequestException('This coupon has expired.');
      }

      const merchant = coupon.merchantId
        ? await this.merchantRepository.findOne({
            where: { id: coupon.merchantId },
          })
        : null;
      if (merchant && merchant.mcomStatus !== 'accepted') {
        throw new BadRequestException(
          'Approve the merchant before creating offers from its coupons.',
        );
      }

      const couponTrackingLink = isSafeHttpUrl(coupon.trackingLink)
        ? coupon.trackingLink
        : undefined;

      destinationUrl =
        destinationUrl ||
        couponTrackingLink ||
        (merchant?.defaultDomain ? `https://${merchant.defaultDomain}` : undefined);
      resolvedTrackingUrl = resolvedTrackingUrl || couponTrackingLink;
      title = title || coupon.name;
      description = description || coupon.description || undefined;
      images =
        images?.length
          ? images
          : coupon.imageUrl
            ? [coupon.imageUrl]
            : undefined;
      externalMerchantId =
        externalMerchantId || coupon.externalMerchantId || undefined;
      merchantName = merchantName || merchant?.name;
      offerType = offerType || 'coupon';
      startDate = startDate || coupon.startDate || undefined;
      endDate = endDate || coupon.endDate || undefined;
      termsAndConditions = termsAndConditions || coupon.description || undefined;
    }

    if (!destinationUrl || !isSafeHttpUrl(destinationUrl)) {
      throw new BadRequestException('A safe destination URL is required.');
    }
    if (!title) {
      throw new BadRequestException('A display title is required.');
    }

    const subId = dto.subId || (await this.syncService.generateSubId(dto.placement));
    const audience = await this.resolveAudience(dto);
    const pricePence = poundsToPence(dto.price);

    const offer = this.offerRepository.create({
      sourceType: dto.sourceType,
      externalMerchantId: externalMerchantId ?? null,
      externalCouponId: dto.externalCouponId ?? null,
      externalProgramId: dto.externalProgramId ?? null,
      merchantName: merchantName ?? null,
      destinationUrl,
      resolvedTrackingUrl: resolvedTrackingUrl ?? null,
      linkResolvedAt: resolvedTrackingUrl ? new Date() : null,
      subId,
      title,
      shortDescription: shortDescription ?? null,
      description: description ?? null,
      images: images ?? null,
      imageSource: dto.imageSource ?? null,
      mcomSectorId: dto.mcomSectorId ?? null,
      mcomCategoryId: dto.mcomCategoryId ?? null,
      mcomSubCategoryId: dto.mcomSubCategoryId ?? null,
      countryCode: dto.countryCode || process.env.TAKEADS_DEFAULT_COUNTRY || 'GB',
      currency: dto.currency || 'GBP',
      price: pricePence,
      visibility: audience.visibility,
      allowedPlanVariantIds: audience.allowedPlanVariantIds,
      offerType: offerType || 'product',
      campaignLabel: dto.campaignLabel ?? null,
      placement: dto.placement || 'marketplace',
      termsAndConditions: termsAndConditions ?? null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      approvalStatus: 'pending',
      publicationStatus: 'unpublished',
      upstreamActive: true,
      isFeatured: dto.isFeatured ?? false,
      displayOrder: dto.displayOrder ?? 0,
      createdById: userId ?? null,
    });

    // No implicit resolution here. An ineligible URL never becomes an offer;
    // the admin must run the explicit resolve step first.
    const saved = await this.offerRepository.save(offer);
    return this.toAdminOffer(saved);
  }

  async updateOffer(id: string, dto: UpdateTakeadsOfferDto) {
    const offer = await this.findOfferEntity(id);

    const fields: Array<keyof UpdateTakeadsOfferDto> = [
      'title',
      'shortDescription',
      'description',
      'images',
      'imageSource',
      'mcomSectorId',
      'mcomCategoryId',
      'mcomSubCategoryId',
      'countryCode',
      'currency',
      'offerType',
      'campaignLabel',
      'placement',
      'termsAndConditions',
      'isFeatured',
      'displayOrder',
      'adminDisabled',
      'reviewNote',
    ];

    for (const field of fields) {
      if (dto[field] !== undefined) {
        (offer as unknown as Record<string, unknown>)[field] = dto[field];
      }
    }

    if (dto.startDate !== undefined) {
      offer.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.endDate !== undefined) {
      offer.endDate = dto.endDate ? new Date(dto.endDate) : null;
    }
    if (dto.price !== undefined) {
      offer.price = poundsToPence(dto.price);
    }
    if (
      dto.visibility !== undefined ||
      dto.allowedPlanVariantIds !== undefined
    ) {
      const audience = await this.resolveAudience({
        visibility:
          dto.visibility ??
          (dto.allowedPlanVariantIds?.length ? 'plan_only' : 'public'),
        allowedPlanVariantIds:
          dto.allowedPlanVariantIds ?? offer.allowedPlanVariantIds ?? [],
      });
      offer.visibility = audience.visibility;
      offer.allowedPlanVariantIds = audience.allowedPlanVariantIds;
    }

    const saved = await this.offerRepository.save(offer);
    return this.toAdminOffer(saved);
  }

  async approveOffer(id: string, userId?: string) {
    const offer = await this.findOfferEntity(id);
    if (!offer.resolvedTrackingUrl) {
      throw new BadRequestException(
        'Resolve the affiliate tracking link before approving this offer.',
      );
    }
    offer.approvalStatus = 'approved';
    offer.reviewedBy = userId ?? null;
    offer.reviewedAt = new Date();
    return this.toAdminOffer(await this.offerRepository.save(offer));
  }

  async rejectOffer(id: string, dto: RejectTakeadsOfferDto, userId?: string) {
    const offer = await this.findOfferEntity(id);
    offer.approvalStatus = 'rejected';
    offer.publicationStatus = 'unpublished';
    offer.reviewNote = dto.reviewNote ?? offer.reviewNote ?? null;
    offer.reviewedBy = userId ?? null;
    offer.reviewedAt = new Date();
    return this.toAdminOffer(await this.offerRepository.save(offer));
  }

  async publishOffer(id: string, userId?: string) {
    const offer = await this.findOfferEntity(id);

    if (offer.approvalStatus !== 'approved') {
      throw new BadRequestException('Only approved offers can be published.');
    }
    if (!offer.resolvedTrackingUrl) {
      throw new BadRequestException(
        'This offer has no resolved affiliate tracking link.',
      );
    }
    if (!offer.upstreamActive) {
      throw new BadRequestException('The upstream offer is no longer active.');
    }
    if (offer.endDate && new Date(offer.endDate).getTime() < Date.now()) {
      throw new BadRequestException('This offer has expired.');
    }
    if (offer.startDate && new Date(offer.startDate).getTime() > Date.now()) {
      throw new BadRequestException('This offer is not live yet.');
    }

    offer.publicationStatus = 'published';
    offer.reviewedBy = userId ?? offer.reviewedBy ?? null;
    offer.reviewedAt = new Date();
    return this.toAdminOffer(await this.offerRepository.save(offer));
  }

  async pauseOffer(id: string) {
    const offer = await this.findOfferEntity(id);
    offer.publicationStatus = 'paused';
    return this.toAdminOffer(await this.offerRepository.save(offer));
  }

  async withdrawOffer(id: string) {
    const offer = await this.findOfferEntity(id);
    offer.publicationStatus = 'withdrawn';
    return this.toAdminOffer(await this.offerRepository.save(offer));
  }

  async resolveOffer(id: string) {
    return this.toAdminOffer(await this.syncService.resolveOfferLink(id));
  }

  async listSyncRuns() {
    return this.syncRunRepository.find({
      order: { startedAt: 'DESC' },
      take: 50,
    });
  }

  async getReportsSummary(query: TakeadsReportQueryDto) {
    const { from, to } = this.resolveRange(query);

    const mcomClicks = await this.clickRepository
      .createQueryBuilder('click')
      .where('click.created_at >= :from AND click.created_at <= :to', {
        from,
        to,
      })
      .getCount();

    const takeadsClicksRow = await this.clickReportRepository
      .createQueryBuilder('report')
      .select('COALESCE(SUM(report.count), 0)', 'count')
      .where('report.date >= :dateFrom AND report.date <= :dateTo', {
        dateFrom: this.formatDate(from),
        dateTo: this.formatDate(to),
      })
      .getRawOne<{ count: string }>();

    const actionQb = this.actionRepository
      .createQueryBuilder('action')
      .where('action.sourceUpdatedAt >= :from AND action.sourceUpdatedAt <= :to', {
        from,
        to,
      });
    if (query.merchantId) {
      actionQb.andWhere('action.merchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }
    const actions = await actionQb.getMany();

    return {
      period: { from, to },
      mcomClicks,
      takeadsClicks: Number(takeadsClicksRow?.count ?? 0),
      actions: this.summariseActions(actions),
    };
  }

  async listMcomClicks(query: TakeadsReportQueryDto): Promise<Page<TakeadsClick>> {
    const { from, to } = this.resolveRange(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.clickRepository
      .createQueryBuilder('click')
      .where('click.created_at >= :from AND click.created_at <= :to', {
        from,
        to,
      });

    qb.orderBy('click.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async listTakeadsClicks(
    query: TakeadsReportQueryDto,
  ): Promise<Page<TakeadsClickReport>> {
    const { from, to } = this.resolveRange(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.clickReportRepository
      .createQueryBuilder('report')
      .where('report.date >= :dateFrom AND report.date <= :dateTo', {
        dateFrom: this.formatDate(from),
        dateTo: this.formatDate(to),
      });

    if (query.merchantId) {
      qb.andWhere('report.merchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }
    if (query.subId) {
      qb.andWhere('report.subId = :subId', { subId: query.subId });
    }

    qb.orderBy('report.date', 'DESC')
      .addOrderBy('report.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async listActions(query: TakeadsReportQueryDto): Promise<Page<TakeadsAction>> {
    const { from, to } = this.resolveRange(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.actionRepository
      .createQueryBuilder('action')
      .where('action.sourceUpdatedAt >= :from AND action.sourceUpdatedAt <= :to', {
        from,
        to,
      });

    if (query.merchantId) {
      qb.andWhere('action.merchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }
    if (query.subId) {
      qb.andWhere('action.subId = :subId', { subId: query.subId });
    }
    if (query.status) {
      qb.andWhere('action.status = :status', { status: query.status });
    }

    qb.orderBy('action.sourceUpdatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Admin-only preview of any offer, including drafts. It reuses the
   * storefront presentation shape but never exposes the tracking URL or subId.
   */
  async getOfferPreview(id: string) {
    const offer = await this.findOfferEntity(id);
    return {
      id: offer.id,
      title: offer.title,
      shortDescription: offer.shortDescription ?? null,
      description: offer.description ?? null,
      merchantName: offer.merchantName ?? null,
      images: offer.images ?? null,
      imageSource: offer.imageSource ?? null,
      offerType: offer.offerType,
      campaignLabel: offer.campaignLabel ?? null,
      placement: offer.placement,
      mcomCategoryId: offer.mcomCategoryId ?? null,
      countryCode: offer.countryCode,
      currency: offer.currency,
      price: penceToPounds(offer.price),
      visibility: offer.visibility,
      allowedPlanVariantIds: offer.allowedPlanVariantIds ?? [],
      termsAndConditions: offer.termsAndConditions ?? null,
      startDate: offer.startDate ?? null,
      endDate: offer.endDate ?? null,
      isFeatured: offer.isFeatured,
      destinationUrl: offer.destinationUrl,
      approvalStatus: offer.approvalStatus,
      publicationStatus: offer.publicationStatus,
      linkResolved: Boolean(offer.resolvedTrackingUrl),
      sourceLabel: offer.offerType === 'coupon' || offer.offerType === 'deal'
        ? 'Coupon / Deal'
        : 'National Brand',
      affiliateDisclosure: TAKEADS_AFFILIATE_DISCLOSURE,
    };
  }

  /**
   * Reconcile MCOM's own click ledger with TakeAds reports at offer level.
   * The join key is the subId stored on the offer, click, click report and
   * action records. Actions without a subId cannot be safely attributed.
   */
  async getProductPerformance(query: TakeadsReportQueryDto) {
    const { from, to } = this.resolveRange(query);
    const offers = await this.offerRepository.find({ order: { title: 'ASC' } });
    const bySubId = new Map<string, (typeof offers)[number]>();
    const byId = new Map<string, (typeof offers)[number]>();
    for (const offer of offers) {
      byId.set(offer.id, offer);
      if (offer.subId) bySubId.set(offer.subId, offer);
    }

    interface OfferMetrics {
      mcomClicks: number;
      takeadsClicks: number;
      actions: Record<string, number>;
      validatedRevenue: number;
      pendingRevenue: number;
      revenueByCurrency: Map<
        string,
        { currency: string; validatedRevenue: number; pendingRevenue: number }
      >;
    }
    const metrics = new Map<string, OfferMetrics>();
    const keyFor = (offerId?: string | null, subId?: string | null) => {
      const offer = subId ? bySubId.get(subId) : byId.get(offerId ?? '');
      return offer?.id;
    };
    const bucketFor = (offerId: string) => {
      let bucket = metrics.get(offerId);
      if (!bucket) {
        bucket = {
          mcomClicks: 0,
          takeadsClicks: 0,
          actions: { PENDING: 0, CONFIRMED: 0, CANCELED: 0, SETTLED: 0 },
          validatedRevenue: 0,
          pendingRevenue: 0,
          revenueByCurrency: new Map(),
        };
        metrics.set(offerId, bucket);
      }
      return bucket;
    };

    const [clicks, clickReports, actions] = await Promise.all([
      this.clickRepository
        .createQueryBuilder('click')
        .where('click.created_at >= :from AND click.created_at <= :to', {
          from,
          to,
        })
        .getMany(),
      this.clickReportRepository
        .createQueryBuilder('report')
        .where('report.date >= :dateFrom AND report.date <= :dateTo', {
          dateFrom: this.formatDate(from),
          dateTo: this.formatDate(to),
        })
        .getMany(),
      this.actionRepository
        .createQueryBuilder('action')
        .where('action.sourceUpdatedAt >= :from AND action.sourceUpdatedAt <= :to', {
          from,
          to,
        })
        .getMany(),
    ]);

    for (const click of clicks) {
      const key = keyFor(click.offerId, click.subId);
      if (key) bucketFor(key).mcomClicks += 1;
    }
    for (const report of clickReports) {
      const key = keyFor(null, report.subId);
      if (key) bucketFor(key).takeadsClicks += Number(report.count ?? 0);
    }

    let unmappedActions = 0;
    for (const action of actions) {
      const key = keyFor(null, action.subId);
      if (!key) {
        unmappedActions += 1;
        continue;
      }
      const bucket = bucketFor(key);
      bucket.actions[action.status] = (bucket.actions[action.status] ?? 0) + 1;
      const revenue = Number(action.publisherRevenue ?? 0);
      const currency = action.currencyCode || 'UNKNOWN';
      const currencyBucket = bucket.revenueByCurrency.get(currency) ?? {
        currency,
        validatedRevenue: 0,
        pendingRevenue: 0,
      };
      if (action.status === 'CONFIRMED' || action.status === 'SETTLED') {
        bucket.validatedRevenue += revenue;
        currencyBucket.validatedRevenue += revenue;
      } else if (action.status === 'PENDING') {
        bucket.pendingRevenue += revenue;
        currencyBucket.pendingRevenue += revenue;
      }
      bucket.revenueByCurrency.set(currency, currencyBucket);
    }

    const rows = offers.map((offer) => {
      const bucket = metrics.get(offer.id);
      return {
        offerId: offer.id,
        title: offer.title,
        merchantName: offer.merchantName ?? null,
        externalMerchantId: offer.externalMerchantId ?? null,
        subId: offer.subId ?? null,
        approvalStatus: offer.approvalStatus,
        publicationStatus: offer.publicationStatus,
        imageUrl: offer.images?.[0] ?? null,
        mcomClicks: bucket?.mcomClicks ?? 0,
        takeadsClicks: bucket?.takeadsClicks ?? 0,
        actions: bucket?.actions ?? {
          PENDING: 0,
          CONFIRMED: 0,
          CANCELED: 0,
          SETTLED: 0,
        },
        validatedRevenue: Number((bucket?.validatedRevenue ?? 0).toFixed(2)),
        pendingRevenue: Number((bucket?.pendingRevenue ?? 0).toFixed(2)),
        currencies: Array.from(bucket?.revenueByCurrency.keys() ?? []),
        revenueByCurrency: Array.from(
          bucket?.revenueByCurrency.values() ?? [],
        ).map((currencyBucket) => ({
          ...currencyBucket,
          validatedRevenue: Number(currencyBucket.validatedRevenue.toFixed(2)),
          pendingRevenue: Number(currencyBucket.pendingRevenue.toFixed(2)),
        })),
      };
    });

    return {
      period: { from, to },
      totalOffers: rows.length,
      unmappedActions,
      data: rows.sort(
        (a, b) => b.mcomClicks - a.mcomClicks || b.takeadsClicks - a.takeadsClicks,
      ),
    };
  }

  private summariseActions(actions: TakeadsAction[]) {
    const byStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      CANCELED: 0,
      SETTLED: 0,
    };
    let validatedRevenue = 0;
    let pendingRevenue = 0;
    let advertiserPaid = 0;
    const currencies = new Map<
      string,
      { currency: string; validatedRevenue: number; pendingRevenue: number; actions: number }
    >();

    for (const action of actions) {
      byStatus[action.status] = (byStatus[action.status] ?? 0) + 1;
      const revenue = Number(action.publisherRevenue ?? 0);
      const currency = action.currencyCode || 'UNKNOWN';
      const bucket = currencies.get(currency) ?? {
        currency,
        validatedRevenue: 0,
        pendingRevenue: 0,
        actions: 0,
      };
      bucket.actions += 1;
      if (action.status === 'CONFIRMED' || action.status === 'SETTLED') {
        validatedRevenue += revenue;
        bucket.validatedRevenue += revenue;
      } else if (action.status === 'PENDING') {
        pendingRevenue += revenue;
        bucket.pendingRevenue += revenue;
      }
      currencies.set(currency, bucket);
      if (action.advertiserPaid) advertiserPaid += 1;
    }

    return {
      total: actions.length,
      byStatus,
      validatedRevenue: Number(validatedRevenue.toFixed(2)),
      pendingRevenue: Number(pendingRevenue.toFixed(2)),
      advertiserPaid,
      byCurrency: Array.from(currencies.values()).map((bucket) => ({
        ...bucket,
        validatedRevenue: Number(bucket.validatedRevenue.toFixed(2)),
        pendingRevenue: Number(bucket.pendingRevenue.toFixed(2)),
      })),
    };
  }

  private resolveRange(query: TakeadsReportQueryDto): { from: Date; to: Date } {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid report date range.');
    }
    return { from, to };
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
