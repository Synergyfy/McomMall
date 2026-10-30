import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { UserRole } from '../../common/role.enum';
import { GiftCardTemplate } from '../gift-card/entities/gift-card-template.entity';
import { VoucherProduct } from '../voucher/entities/voucher-product.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import {
  CouponSourceType,
  CouponStatus,
} from '../coupon/coupon.enum';
import { PartnerFeatureFlagsService } from '../partner-instruments/partner-feature-flags.service';
import { InstrumentType, ScopeMode } from '../partner-instruments/enums';

export type TemplateKind = 'gift-cards' | 'vouchers' | 'coupons';

export interface TemplateQuery {
  businessId?: string;
  mcomUserId?: string;
  email?: string;
  includePlatform?: boolean;
  includeInactive?: boolean;
}

export interface PartnerBusinessIdentity {
  id: string;
  name: string;
  mcomUserId: string | null;
  email: string | null;
  /** Mall user that owns the business. Internal use only. */
  ownerUserId: string | null;
}

/**
 * Partner-facing template catalogue. Resolves a business by id, MCOM user
 * id, or email and returns the templates that business may instantiate.
 */
@Injectable()
export class PartnerTemplatesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(GiftCardTemplate)
    private readonly giftCardTemplateRepository: Repository<GiftCardTemplate>,
    @InjectRepository(VoucherProduct)
    private readonly voucherProductRepository: Repository<VoucherProduct>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    private readonly flags: PartnerFeatureFlagsService,
  ) {}

  async list(
    kind: TemplateKind,
    query: TemplateQuery,
    isPlatformCaller: boolean,
    callerBusinessId?: string | null,
  ): Promise<{ business: PartnerBusinessIdentity; templates: any[] }> {
    this.assertEnabled();
    this.assertQueryShape(query, isPlatformCaller);
    const business = await this.resolveBusiness(query);
    this.assertCallerBusiness(business, isPlatformCaller, callerBusinessId);
    const includePlatform = !!query.includePlatform && isPlatformCaller;

    let templates: any[];
    switch (this.normaliseKind(kind)) {
      case InstrumentType.GIFT_CARD:
        templates = await this.listGiftCardTemplates(
          business,
          !!query.includeInactive && isPlatformCaller,
          includePlatform,
        );
        break;
      case InstrumentType.VOUCHER:
        templates = await this.listVoucherProducts(
          business,
          !!query.includeInactive && isPlatformCaller,
          includePlatform,
        );
        break;
      default:
        templates = await this.listCoupons(
          business,
          !!query.includeInactive && isPlatformCaller,
          includePlatform,
          isPlatformCaller,
        );
    }

    return { business, templates };
  }

  async getOne(
    kind: TemplateKind,
    id: string,
    query: TemplateQuery,
    isPlatformCaller: boolean,
    callerBusinessId?: string | null,
  ): Promise<{ business: PartnerBusinessIdentity; template: any }> {
    this.assertEnabled();
    this.assertQueryShape(query, isPlatformCaller);
    const business = await this.resolveBusiness(query);
    this.assertCallerBusiness(business, isPlatformCaller, callerBusinessId);
    const includePlatform = !!query.includePlatform && isPlatformCaller;
    const includeInactive = !!query.includeInactive && isPlatformCaller;

    const normalised = this.normaliseKind(kind);
    let template: any = null;

    if (normalised === InstrumentType.GIFT_CARD) {
      template = await this.giftCardTemplateRepository.findOne({
        where: { id },
        relations: ['owner'],
      });
      if (template && !includeInactive && !template.isActive) {
        throw new NotFoundException('Template not found.');
      }
      if (template && !includePlatform) {
        this.assertOwned(template.ownerId, business, 'gift-card template');
      }
      if (template) template = this.mapGiftCardTemplate(template);
    } else if (normalised === InstrumentType.VOUCHER) {
      template = await this.voucherProductRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      if (
        template &&
        !includeInactive &&
        (!template.isEnabled || template.status === 'inactive')
      ) {
        throw new NotFoundException('Template not found.');
      }
      if (template && !includePlatform) {
        this.assertOwned(template.user?.id, business, 'voucher product');
      }
      if (template) template = this.mapVoucherProduct(template);
    } else {
      template = await this.couponRepository.findOne({
        where: { id },
        relations: ['business', 'business.user'],
      });
      if (
        template &&
        !includeInactive &&
        (template.status === CouponStatus.ARCHIVED ||
          template.status === CouponStatus.DISABLED)
      ) {
        throw new NotFoundException('Template not found.');
      }
      if (template && !includePlatform) {
        const ownerId = template.business?.user?.id;
        this.assertOwned(ownerId, business, 'coupon template');
      }
      if (template) template = this.mapCoupon(template);
    }

    if (!template) throw new NotFoundException('Template not found.');
    return { business, template };
  }

  /** Resolve the template restriction used by scope subset validation. */
  async getTemplateScopeConfig(
    kind: InstrumentType,
    templateId: string,
  ): Promise<Record<string, any> | null> {
    if (kind === InstrumentType.GIFT_CARD) {
      const template = await this.giftCardTemplateRepository.findOne({
        where: { id: templateId },
      });
      return template?.scopeConfig ?? null;
    }
    if (kind === InstrumentType.VOUCHER) {
      const product = await this.voucherProductRepository.findOne({
        where: { id: templateId },
      });
      return product?.scopeConfig ?? null;
    }
    const coupon = await this.couponRepository.findOne({
      where: { id: templateId },
    });
    return coupon?.scopeConfig ?? null;
  }

  // ─── Business resolution ─────────────────────────────────────────────────

  async resolveBusiness(query: TemplateQuery): Promise<PartnerBusinessIdentity> {
    let business: Business | null = null;

    if (query.businessId) {
      business = await this.businessRepository.findOne({
        where: { id: query.businessId },
        relations: ['user'],
      });
    } else if (query.mcomUserId) {
      business = await this.businessRepository.findOne({
        where: { user: { centralUserId: query.mcomUserId } },
        relations: ['user'],
      });
    } else if (query.email) {
      business = await this.businessRepository.findOne({
        where: { businessEmail: query.email.toLowerCase().trim() },
        relations: ['user'],
      });
    }

    if (!business) {
      throw new NotFoundException('Business not found for the supplied identifier.');
    }

    return {
      id: business.id,
      name: business.businessName,
      mcomUserId: business.user?.centralUserId ?? null,
      email: business.businessEmail ?? null,
      ownerUserId: business.user?.id ?? null,
    };
  }

  // ─── Loaders & mappers ───────────────────────────────────────────────────

  private async listGiftCardTemplates(
    business: PartnerBusinessIdentity,
    includeInactive: boolean,
    includePlatform: boolean,
  ): Promise<any[]> {
    const ownerId = business.ownerUserId;
    const builder = this.giftCardTemplateRepository
      .createQueryBuilder('template')
      .leftJoin('template.owner', 'owner');

    if (includePlatform) {
      builder.where('(template.ownerId = :ownerId OR owner.role = :role)', {
        ownerId,
        role: UserRole.ADMIN,
      });
    } else {
      builder.where('template.ownerId = :ownerId', { ownerId });
    }
    if (!includeInactive) builder.andWhere('template.isActive = true');

    const rows = await builder
      .orderBy('template.created_at', 'DESC')
      .getMany();
    return rows.map((row) => this.mapGiftCardTemplate(row));
  }

  private async listVoucherProducts(
    business: PartnerBusinessIdentity,
    includeInactive: boolean,
    includePlatform: boolean,
  ): Promise<any[]> {
    const ownerId = business.ownerUserId;
    const builder = this.voucherProductRepository
      .createQueryBuilder('product')
      .leftJoin('product.user', 'owner');

    if (includePlatform) {
      builder.where('(owner.id = :ownerId OR owner.role = :role)', {
        ownerId,
        role: UserRole.ADMIN,
      });
    } else {
      builder.where('owner.id = :ownerId', { ownerId });
    }
    if (!includeInactive) {
      builder.andWhere('product.isEnabled = true');
      builder.andWhere('product.status = :status', { status: 'active' });
    }

    const rows = await builder
      .orderBy('product.createdAt', 'DESC')
      .getMany();
    return rows.map((row) => this.mapVoucherProduct(row));
  }

  private async listCoupons(
    business: PartnerBusinessIdentity,
    includeInactive: boolean,
    includePlatform: boolean,
    isPlatformCaller: boolean,
  ): Promise<any[]> {
    const where: any = { business: { id: business.id } };
    if (!includePlatform) {
      where.sourceType = CouponSourceType.BUSINESS;
    } else if (isPlatformCaller) {
      // Platform callers may also see platform-wide coupon templates.
      delete where.business;
    }

    const rows = await this.couponRepository.find({
      where: includePlatform
        ? [
            { business: { id: business.id } },
            { sourceType: CouponSourceType.PLATFORM },
          ]
        : where,
      relations: ['business'],
      order: { created_at: 'DESC' } as any,
    });

    return rows
      .filter((row) => {
        if (includeInactive) return true;
        return row.status === CouponStatus.ACTIVE;
      })
      .map((row) => this.mapCoupon(row));
  }

  private assertOwned(
    ownerUserId: string | null | undefined,
    business: PartnerBusinessIdentity,
    label: string,
  ): void {
    if (!ownerUserId) {
      throw new ForbiddenException(
        `TEMPLATE_NOT_OWNED: ${label} is not owned by the resolved business.`,
      );
    }
    if (!business.ownerUserId || ownerUserId !== business.ownerUserId) {
      throw new ForbiddenException(
        `TEMPLATE_NOT_OWNED: ${label} is not owned by the resolved business.`,
      );
    }
  }

  private mapGiftCardTemplate(template: GiftCardTemplate): any {
    return {
      id: template.id,
      kind: 'gift_card',
      name: template.name,
      description: template.description ?? null,
      fixedAmounts: toNumbers(template.fixedAmounts),
      allowCustomAmount: !!template.allowCustomAmount,
      minCustomAmount: toNumberOrNull(template.minCustomAmount),
      maxCustomAmount: toNumberOrNull(template.maxCustomAmount),
      expiryPeriodDays: template.expiryPeriodDays ?? null,
      allowReloading: !!template.allowReloading,
      bonusThreshold: toNumberOrNull(template.bonusThreshold),
      bonusAmount: toNumberOrNull(template.bonusAmount),
      backgroundImageUrl: template.backgroundImageUrl ?? null,
      backgroundColor: template.backgroundColor ?? null,
      textColor: template.textColor ?? null,
      isActive: !!template.isActive,
      scope: template.scopeConfig ?? {
        mode: ScopeMode.NO_SCOPE,
        listingIds: [],
        productIds: [],
        serviceIds: [],
      },
    };
  }

  private mapVoucherProduct(product: VoucherProduct): any {
    return {
      id: product.id,
      kind: 'voucher',
      name: product.name,
      description: product.description ?? null,
      fixedAmounts: toNumbers(product.fixedAmounts),
      allowCustomAmount: !!product.allowCustomAmount,
      minCustomAmount: toNumberOrNull(product.minCustomAmount),
      maxCustomAmount: toNumberOrNull(product.maxCustomAmount),
      usage: product.usage,
      isEnabled: !!product.isEnabled,
      expiryDays: product.expiryDays ?? null,
      allowPartialRedemption: !!product.allowPartialRedemption,
      backgroundImage: product.backgroundImage ?? null,
      textColor: product.textColor ?? null,
      voucherType: product.voucherType,
      valueType: product.valueType,
      value: Number(product.value ?? 0),
      bonusThreshold: toNumberOrNull(product.bonusThreshold),
      bonusAmount: toNumberOrNull(product.bonusAmount),
      allowReloading: !!product.allowReloading,
      scope: product.scopeConfig ?? {
        mode: ScopeMode.NO_SCOPE,
        listingIds: [],
        productIds: [],
        serviceIds: [],
      },
    };
  }

  private mapCoupon(coupon: Coupon): any {
    return {
      id: coupon.id,
      kind: 'coupon',
      title: coupon.title,
      description: coupon.description ?? null,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      startDate: coupon.startDate ?? null,
      expiresAt: coupon.expiresAt ?? null,
      status: coupon.status,
      businessId: (coupon.business as any)?.id ?? null,
      scope: coupon.scopeConfig ?? {
        mode: ScopeMode.NO_SCOPE,
        listingIds: [],
        productIds: [],
        serviceIds: [],
      },
    };
  }

  // ─── Guards ──────────────────────────────────────────────────────────────

  private assertEnabled(): void {
    if (!this.flags.isTemplatesEnabled()) {
      throw new ServiceUnavailableException(
        'FEATURE_DISABLED: partner template discovery is not enabled.',
      );
    }
  }

  private assertCallerBusiness(
    business: PartnerBusinessIdentity,
    isPlatformCaller: boolean,
    callerBusinessId?: string | null,
  ): void {
    if (isPlatformCaller || !callerBusinessId) return;
    if (business.id !== callerBusinessId) {
      throw new ForbiddenException(
        'CROSS_TENANT_SCOPE: a business caller may only read its own templates.',
      );
    }
  }

  private assertQueryShape(    query: TemplateQuery,
    isPlatformCaller: boolean,
  ): void {
    if (!query.businessId && !query.mcomUserId && !query.email) {
      throw new BadRequestException(
        'Provide one of businessId, mcomUserId, or email.',
      );
    }
    if (query.includeInactive && !isPlatformCaller) {
      throw new ForbiddenException(
        'Only platform/admin callers may request inactive templates.',
      );
    }
    if (query.includePlatform && !isPlatformCaller) {
      throw new ForbiddenException(
        'Only platform/admin callers may request platform templates.',
      );
    }
  }

  private normaliseKind(kind: string): InstrumentType {
    const value = String(kind).toLowerCase();
    if (value === 'gift-cards' || value === 'gift_card' || value === 'gift-card') {
      return InstrumentType.GIFT_CARD;
    }
    if (value === 'vouchers' || value === 'voucher') {
      return InstrumentType.VOUCHER;
    }
    if (value === 'coupons' || value === 'coupon') {
      return InstrumentType.COUPON;
    }
    throw new BadRequestException(
      `Unknown template kind "${kind}". Use gift-cards, vouchers, or coupons.`,
    );
  }
}

function toNumbers(values: any): number[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => Number(value)).filter((value) => !isNaN(value));
}

function toNumberOrNull(value: any): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return isNaN(parsed) ? null : parsed;
}
