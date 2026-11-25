import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Coupon } from '../coupon/entities/coupon.entity';
import { CouponStatus } from '../coupon/coupon.enum';
import { SavedCoupon } from '../coupon/entities/saved-coupon.entity';
import { UserVoucher } from '../money-engine/entities/user-voucher.entity';
import {
  FunctionalType,
  RewardDefinition,
  ScopeType,
} from '../money-engine/entities/reward-definition.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { GiftCardTemplate } from '../gift-card/entities/gift-card-template.entity';
import { MarketingCampaign } from '../campaign/entities/marketing-campaign.entity';
import { MarketingCampaignStatus } from '../campaign/marketing-campaign.enum';
import { BusinessStatus } from '../listings/listing.enum';
import { FeatureFlagsService } from '../../common/feature-flags/feature-flags.service';
import { InstrumentsService } from '../instruments/instruments.service';
import { DealDto, DealPageDto, DealScopeDto } from './dto/deal.dto';
import { GetDealsQueryDto } from './dto/get-deals-query.dto';

/**
 * Read-only aggregation over every coupon/voucher/gift-card ledger.
 *
 * This is the Phase 4a "Deals" facade: it does not write anywhere and does not
 * move money. Writes stay in the domain services; this service only presents a
 * single shape so the UI and checkout can stop caring which table a code lives
 * in.
 */
@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(SavedCoupon)
    private readonly savedCouponRepository: Repository<SavedCoupon>,
    @InjectRepository(UserVoucher)
    private readonly userVoucherRepository: Repository<UserVoucher>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(GiftCard)
    private readonly giftCardRepository: Repository<GiftCard>,
    @InjectRepository(GiftCardTemplate)
    private readonly giftCardTemplateRepository: Repository<GiftCardTemplate>,
    @InjectRepository(MarketingCampaign)
    private readonly campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(RewardDefinition)
    private readonly definitionRepository: Repository<RewardDefinition>,
    private readonly featureFlags: FeatureFlagsService,
    private readonly instrumentsService: InstrumentsService,
  ) {}

  private assertEnabled(): void {
    if (!this.featureFlags.isDealsHubEnabled()) {
      throw new NotFoundException('Deals hub is not enabled.');
    }
  }

  /** Personal wallet: everything the authenticated user can spend or use. */
  async getMine(userId: string, query: GetDealsQueryDto): Promise<DealPageDto> {
    this.assertEnabled();

    const [saved, purchased, moneyVouchers, vouchers, giftCards] =
      await Promise.all([
        this.savedCouponRepository.find({
          where: { user: { id: userId } },
          relations: ['coupon', 'coupon.business', 'coupon.campaign'],
        }),
        this.couponRepository
          .createQueryBuilder('c')
          .leftJoinAndSelect('c.business', 'business')
          .leftJoinAndSelect('c.campaign', 'campaign')
          .where("c.metadata ->> 'buyerId' = :userId", { userId })
          .getMany(),
        this.userVoucherRepository.find({
          where: { owner: { id: userId } },
          relations: ['definition', 'definition.validShops'],
        }),
        this.voucherRepository.find({
          where: [
            { owner: { id: userId } },
            { buyer: { id: userId } },
            { recipient: { id: userId } },
          ],
          relations: ['voucherProduct', 'business'],
        }),
        this.giftCardRepository.find({
          where: [{ ownerId: userId }, { purchaserId: userId }],
          relations: ['template', 'purchaseBusiness'],
        }),
      ]);

    const deals: DealDto[] = [
      ...saved.map((row) => this.couponToDeal(row.coupon, row.savedAt)),
      ...purchased.map((coupon) => this.couponToDeal(coupon)),
      ...moneyVouchers.map((voucher) => this.moneyVoucherToDeal(voucher)),
      ...vouchers.map((voucher) => this.voucherToDeal(voucher)),
      ...giftCards.map((card) => this.giftCardToDeal(card)),
    ];

    return this.paginate(this.filter(this.dedupe(deals), query), query);
  }

  /** Discovery: active coupons, reward definitions, campaigns and gift-card templates. */
  async getAll(query: GetDealsQueryDto): Promise<DealPageDto> {
    this.assertEnabled();

    const take = Math.max((query.limit ?? 10) * 3, 50);
    const [coupons, definitions, campaigns, giftCardTemplates] =
      await Promise.all([
        this.couponRepository.find({
          where: { status: CouponStatus.ACTIVE },
          relations: ['business', 'business.user', 'campaign'],
          take,
          order: { created_at: 'DESC' } as any,
        }),
        this.definitionRepository.find({
          where: { isActive: true },
          relations: ['validShops'],
          take,
          order: { created_at: 'DESC' } as any,
        }),
        this.campaignRepository.find({
          where: { status: MarketingCampaignStatus.ACTIVE },
          take,
          order: { created_at: 'DESC' } as any,
        }),
        this.giftCardTemplateRepository.find({
          where: { isActive: true },
          relations: ['owner', 'owner.businesses'],
          take,
          order: { created_at: 'DESC' } as any,
        }),
      ]);

    const now = Date.now();
    const visibleCoupons = coupons.filter(
      (coupon) =>
        !coupon.business ||
        (coupon.business.status === BusinessStatus.PUBLISHED &&
          coupon.business.user?.isActive !== false &&
          !coupon.business.user?.centralDeletedAt &&
          !coupon.business.centralDeletedAt),
    );
    const visibleGiftCardTemplates = giftCardTemplates.filter((template) => {
      const owner = template.owner;
      return (
        owner?.isActive !== false &&
        !owner?.centralDeletedAt &&
        (owner?.businesses ?? []).some(
          (business) =>
            business.status === BusinessStatus.PUBLISHED &&
            !business.centralDeletedAt,
        )
      );
    });

    const deals: DealDto[] = [
      ...visibleCoupons.map((coupon) => this.couponToDeal(coupon)),
      ...definitions
        .filter(
          (definition) =>
            !definition.expiresAt ||
            new Date(definition.expiresAt).getTime() > now,
        )
        .map((definition) => this.definitionToDeal(definition)),
      ...campaigns.map((campaign) => this.campaignToDeal(campaign)),
      ...visibleGiftCardTemplates.map((template) =>
        this.giftCardTemplateToDeal(template),
      ),
    ];

    return this.paginate(this.filter(this.dedupe(deals), query), query);
  }

  /** Resolve any instrument code through the canonical resolver. */
  async resolve(code: string): Promise<DealDto> {
    this.assertEnabled();
    const resolved = await this.instrumentsService.resolve(code);
    return {
      id: resolved.id,
      kind: resolved.kind,
      visualType: resolved.visualType,
      functionalType: resolved.behavior,
      title: code,
      description: null,
      code: resolved.code,
      faceValue: resolved.faceValue,
      discountType: null,
      remainingValue: resolved.balance,
      contributionRemaining: null,
      status: resolved.status,
      scope: resolved.scope,
      businessId: resolved.scope?.businessId ?? null,
      businessName: null,
      expiresAt: null,
      createdAt: null,
      source: resolved.source,
    };
  }

  // ─── Mapping ──────────────────────────────────────────────────────────────

  private couponToDeal(coupon: Coupon, savedAt?: Date): DealDto {
    const metadata = (coupon.metadata ?? {}) as Record<string, any>;
    const balance = Number(metadata.balance ?? 0);
    const isBalanceBearing =
      balance > 0 || Boolean(metadata.couponProductId);
    const faceValue = isBalanceBearing
      ? Number(metadata.initialValue ?? coupon.discountValue ?? 0)
      : Number(coupon.discountValue ?? 0);

    return {
      id: coupon.id,
      kind: isBalanceBearing ? 'coupon_voucher' : 'standard_coupon',
      visualType: 'coupon',
      functionalType: isBalanceBearing ? 'spending_power' : 'price_reducer',
      title: coupon.title || coupon.code,
      description: coupon.description ?? null,
      code: coupon.code,
      faceValue,
      discountType: isBalanceBearing
        ? null
        : ((coupon.discountType as 'percentage' | 'fixed') ?? null),
      remainingValue: isBalanceBearing ? balance : null,
      contributionRemaining: null,
      status: String(coupon.status ?? '').toLowerCase(),
      scope: this.businessScope(coupon.business),
      businessId: coupon.business?.id ?? null,
      businessName: (coupon.business as any)?.businessName ?? null,
      expiresAt: this.toIso(coupon.expiresAt),
      createdAt: this.toIso(savedAt ?? coupon.created_at),
      source: 'coupon',
    };
  }

  private moneyVoucherToDeal(voucher: UserVoucher): DealDto {
    const definition = voucher.definition;
    const isReducer =
      (voucher.functionalType ?? definition?.functionalType) ===
      FunctionalType.PRICE_REDUCER;
    const faceValue = voucher.faceValue ?? definition?.faceValue ?? null;
    const expired = Boolean(
      voucher.expiresAt && new Date() > new Date(voucher.expiresAt),
    );
    const status = expired
      ? 'expired'
      : String(voucher.state ?? '').toLowerCase();
    const isActive = status === 'active';
    const walletBalance =
      Number(voucher.realBalance) + Number(voucher.rewardBalance);
    const realRatio = Number(definition?.splitRatio?.real ?? 0);
    const realTarget =
      voucher.realContributionTarget ??
      (faceValue !== null && faceValue !== undefined && realRatio > 0
        ? Number((Number(faceValue) * realRatio).toFixed(2))
        : null);
    const contributionRemaining =
      isReducer || realTarget === null
        ? null
        : Math.max(0, Number((Number(realTarget) - Number(voucher.realBalance)).toFixed(2)));

    return {
      id: voucher.id,
      kind: isReducer ? 'voucher_coupon' : 'coupon_voucher',
      visualType: (definition?.visualType as any) ?? 'voucher',
      functionalType: isReducer ? 'price_reducer' : 'spending_power',
      title: definition?.name ?? voucher.code,
      description: definition?.description ?? null,
      code: voucher.code,
      faceValue,
      discountType: null,
      // A Voucher Coupon's remaining value is its unconsumed discount, not a
      // wallet balance.
      remainingValue: isReducer
        ? isActive
          ? faceValue
          : 0
        : walletBalance,
      contributionRemaining,
      status,
      scope: this.definitionScope(definition),
      businessId: voucher.issuerBusinessId ?? null,
      businessName: null,
      expiresAt: this.toIso(voucher.expiresAt),
      createdAt: this.toIso(voucher.created_at),
      source: 'money_voucher',
    };
  }

  private voucherToDeal(voucher: Voucher): DealDto {
    return {
      id: voucher.id,
      kind: 'voucher',
      visualType: 'voucher',
      functionalType: 'spending_power',
      title: voucher.voucherProduct?.name ?? voucher.code,
      description: voucher.voucherProduct?.description ?? null,
      code: voucher.code,
      faceValue: Number(voucher.initialValue ?? 0),
      discountType: null,
      remainingValue: Number(voucher.balance ?? 0),
      contributionRemaining: null,
      status: String(voucher.status ?? '').toLowerCase(),
      scope: this.businessScope(voucher.business),
      businessId: voucher.business?.id ?? null,
      businessName: (voucher.business as any)?.businessName ?? null,
      expiresAt: this.toIso(voucher.expiresAt),
      createdAt: this.toIso(voucher.createdAt),
      source: 'voucher',
    };
  }

  private giftCardToDeal(card: GiftCard): DealDto {
    return {
      id: card.id,
      kind: 'gift_card',
      visualType: 'voucher',
      functionalType: 'spending_power',
      title: card.template?.name ?? `Gift card ${card.code}`,
      description:
        card.template?.description ?? card.personalMessage ?? null,
      code: card.code,
      faceValue: Number(card.initialBalance ?? 0),
      discountType: null,
      remainingValue: Number(card.currentBalance ?? 0),
      contributionRemaining: null,
      status: card.isActive ? 'active' : 'inactive',
      scope: this.businessScope(card.purchaseBusiness),
      businessId: card.purchaseBusiness?.id ?? null,
      businessName: (card.purchaseBusiness as any)?.businessName ?? null,
      expiresAt: this.toIso(card.expiryDate),
      createdAt: this.toIso(card.created_at),
      source: 'gift_card',
    };
  }

  private definitionToDeal(definition: RewardDefinition): DealDto {
    const isReducer = definition.functionalType === FunctionalType.PRICE_REDUCER;

    return {
      id: definition.id,
      kind: isReducer ? 'voucher_coupon' : 'coupon_voucher',
      visualType: definition.visualType,
      functionalType: isReducer ? 'price_reducer' : 'spending_power',
      title: definition.name,
      description: definition.description ?? null,
      code: null,
      faceValue: definition.faceValue ?? null,
      discountType: null,
      remainingValue: null,
      contributionRemaining: null,
      status: definition.isActive ? 'active' : 'inactive',
      scope: this.definitionScope(definition),
      businessId: null,
      businessName: null,
      expiresAt: this.toIso(definition.expiresAt),
      createdAt: this.toIso(definition.created_at),
      source: 'definition',
    };
  }

  private campaignToDeal(campaign: MarketingCampaign): DealDto {
    return {
      id: campaign.id,
      kind: 'promotion',
      visualType: 'coupon',
      functionalType: null,
      title: campaign.name,
      description: campaign.targetPostalCodes?.length
        ? `Hyperlocal: ${campaign.targetPostalCodes.join(', ')}`
        : null,
      code: null,
      faceValue: null,
      discountType: null,
      remainingValue: null,
      contributionRemaining: null,
      status: String(campaign.status ?? '').toLowerCase(),
      scope: campaign.targetPostalCodes?.length
        ? { mode: 'LISTINGS', businessId: null, listingIds: [] }
        : null,
      businessId: null,
      businessName: null,
      expiresAt: this.toIso(campaign.endDate),
      createdAt: this.toIso(campaign.created_at),
      source: 'campaign',
    };
  }

  private giftCardTemplateToDeal(template: GiftCardTemplate): DealDto {
    return {
      id: template.id,
      kind: 'gift_card',
      visualType: 'voucher',
      functionalType: 'spending_power',
      title: template.name,
      description: template.description ?? null,
      code: null,
      faceValue: template.fixedAmounts?.[0] ?? null,
      discountType: null,
      remainingValue: null,
      contributionRemaining: null,
      status: template.isActive ? 'active' : 'inactive',
      scope: null,
      businessId: null,
      businessName: null,
      expiresAt: null,
      createdAt: this.toIso(template.created_at),
      source: 'gift_card',
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private businessScope(
    business: { id: string } | null | undefined,
  ): DealScopeDto | null {
    if (!business?.id) return null;
    return {
      mode: 'LISTINGS',
      businessId: business.id,
      listingIds: [business.id],
    };
  }

  private definitionScope(
    definition: RewardDefinition | null | undefined,
  ): DealScopeDto | null {
    if (!definition) return null;

    const productIds = (definition.validProductIds ?? []).filter(Boolean);
    const serviceIds = (definition.validServiceIds ?? []).filter(Boolean);
    if (productIds.length > 0 || serviceIds.length > 0) {
      return {
        mode: 'ITEMS',
        businessId: null,
        listingIds: (definition.validShops ?? []).map((shop) => shop.id),
        productIds,
        serviceIds,
      };
    }

    if (definition.scopeType === ScopeType.ANY_SHOP) {
      return null;
    }
    return {
      mode: 'LISTINGS',
      businessId: null,
      listingIds: (definition.validShops ?? []).map((shop) => shop.id),
    };
  }

  private dedupe(deals: DealDto[]): DealDto[] {
    const unique = new Map<string, DealDto>();
    for (const deal of deals) {
      unique.set(`${deal.source}:${deal.id}`, deal);
    }
    return [...unique.values()];
  }

  private filter(deals: DealDto[], query: GetDealsQueryDto): DealDto[] {
    const search = (query.search ?? '').trim().toLowerCase();
    return deals.filter((deal) => {
      if (query.kind && deal.kind !== query.kind) return false;
      if (!search) return true;
      return [deal.title, deal.description, deal.code, deal.businessName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }

  private paginate(deals: DealDto[], query: GetDealsQueryDto): DealPageDto {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sorted = [...deals].sort((a, b) =>
      (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
    );
    const total = sorted.length;
    const lastPage = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;

    return {
      data: sorted.slice(start, start + limit),
      meta: {
        total,
        page,
        limit,
        lastPage,
        nextPage: page < lastPage ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  private toIso(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}
