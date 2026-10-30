import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Business } from '../listings/entities/listing.entity';
import { BusinessStatus } from '../listings/listing.enum';
import { Product } from '../product/entities/product.entity';
import { Service } from '../services/entities/service.entity';
import { InstrumentScopeDto } from './dto/instrument-scope.dto';
import { InstrumentScope } from './entities/instrument-scope.entity';
import { InstrumentType, ScopeLine, ScopeMode } from './enums';

export interface PartnerRequestContext {
  callerAppId?: string;
  /** True for platform/admin callers (Rewards admins, MCOM ops). */
  isPlatformCaller?: boolean;
  /** Business binding carried by a delegated token, when present. */
  businessId?: string | null;
  /** False when scope persistence is disabled by rollout flag. */
  scopeEnabled?: boolean;
}

/** Scope restriction optionally declared by a template. */
export interface TemplateScopeConfig {
  mode: ScopeMode;
  businessId?: string | null;
  listingIds?: string[];
  productIds?: string[];
  serviceIds?: string[];
}

export interface NormalisedScope {
  mode: ScopeMode;
  businessId: string | null;
  listingIds: string[];
  productIds: string[];
  serviceIds: string[];
}

export interface EligibleResult {
  eligibleSubtotal: number;
  lines: ScopeLine[];
}

const NO_SCOPE: NormalisedScope = {
  mode: ScopeMode.NO_SCOPE,
  businessId: null,
  listingIds: [],
  productIds: [],
  serviceIds: [],
};

/**
 * Owns the `instrument_scopes` table plus the pure matching/maths helpers
 * used by checkout and booking. Keeping the matcher here (rather than in the
 * order service) means product checkout and booking payment cannot drift.
 */
@Injectable()
export class InstrumentScopeService {
  private readonly logger = new Logger(InstrumentScopeService.name);

  constructor(
    @InjectRepository(InstrumentScope)
    private readonly scopeRepository: Repository<InstrumentScope>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  // ─── Persistence ──────────────────────────────────────────────────────────

  async getScope(
    instrumentType: InstrumentType,
    instrumentId: string,
  ): Promise<InstrumentScope | null> {
    return this.scopeRepository.findOne({
      where: { instrumentType, instrumentId },
    });
  }

  async getScopeByCode(
    instrumentType: InstrumentType,
    instrumentId: string | null | undefined,
  ): Promise<InstrumentScope | null> {
    if (!instrumentId) return null;
    return this.getScope(instrumentType, instrumentId);
  }

  /**
   * Scope used for consumption checks. Falls back to a whole-business scope
   * when a business-bound instrument has no explicit `instrument_scopes` row:
   * a missing scope must fail closed for business-owned instruments, never
   * behave as platform-wide.
   */
  async getEffectiveScope(
    instrumentType: InstrumentType,
    instrument: { id: string; businessId?: string | null },
  ): Promise<Pick<
    InstrumentScope,
    'scopeMode' | 'businessId' | 'listingIds' | 'productIds' | 'serviceIds'
  > | null> {
    const scope = await this.getScope(instrumentType, instrument.id);
    if (scope) return scope;
    if (!instrument.businessId) return null;
    return {
      scopeMode: ScopeMode.ALL,
      businessId: instrument.businessId,
      listingIds: [],
      productIds: [],
      serviceIds: [],
    };
  }

  /**
   * Validates and persists a scope. Returns the normalised scope even when
   * nothing was persisted (`NO_SCOPE`).
   */
  async saveScope(params: {
    instrumentType: InstrumentType;
    instrumentId: string;
    businessId?: string | null;
    scope?: InstrumentScopeDto | NormalisedScope | null;
    context?: PartnerRequestContext;
    templateScope?: TemplateScopeConfig | null;
    /** Validate ids belong to this business (template owner when omitted). */
    tenantBusinessId?: string | null;
  }): Promise<InstrumentScope> {
    const normalised = await this.normaliseScope({
      businessId: params.businessId,
      scope: params.scope,
      context: params.context,
      templateScope: params.templateScope,
      tenantBusinessId: params.tenantBusinessId,
    });

    if (normalised.mode === ScopeMode.NO_SCOPE && !normalised.businessId) {
      return null as unknown as InstrumentScope;
    }

    const existing = await this.getScope(
      params.instrumentType,
      params.instrumentId,
    );
    const row = existing ?? this.scopeRepository.create();
    row.instrumentType = params.instrumentType;
    row.instrumentId = params.instrumentId;
    row.businessId = normalised.businessId;
    row.scopeMode = normalised.mode;
    row.listingIds = normalised.listingIds;
    row.productIds = normalised.productIds;
    row.serviceIds = normalised.serviceIds;
    return this.scopeRepository.save(row);
  }

  // ─── Validation ───────────────────────────────────────────────────────────

  async normaliseScope(input: {
    businessId?: string | null;
    scope?: InstrumentScopeDto | NormalisedScope | null;
    context?: PartnerRequestContext;
    templateScope?: TemplateScopeConfig | null;
    tenantBusinessId?: string | null;
  }): Promise<NormalisedScope> {
    const businessId = input.businessId ?? null;
    let mode =
      input.scope?.mode ?? (businessId ? ScopeMode.ALL : ScopeMode.NO_SCOPE);
    // A business-bound instrument can never be globally unrestricted.
    if (mode === ScopeMode.NO_SCOPE && businessId) mode = ScopeMode.ALL;
    const listingIds = unique(input.scope?.listingIds ?? []);
    const productIds = unique(input.scope?.productIds ?? []);
    const serviceIds = unique(input.scope?.serviceIds ?? []);

    if (businessId) {
      await this.assertBusinessExists(businessId);
      if (
        !input.context?.isPlatformCaller &&
        input.context?.businessId &&
        input.context.businessId !== businessId
      ) {
        throw new ForbiddenException(
          'CROSS_TENANT_SCOPE: a business caller may only target its own business.',
        );
      }
    }

    if (mode === ScopeMode.NO_SCOPE) {
      if (input.templateScope && input.templateScope.mode !== ScopeMode.NO_SCOPE) {
        throw new UnprocessableEntityException(
          'SCOPE_EXCEEDS_TEMPLATE: template restricts this instrument but no scope was supplied.',
        );
      }
      return { ...NO_SCOPE, businessId };
    }

    if (mode === ScopeMode.ALL) {
      if (!businessId && !input.context?.isPlatformCaller) {
        throw new ForbiddenException(
          'CROSS_TENANT_SCOPE: an all-Mall scope requires a platform/admin caller.',
        );
      }
      return {
        mode,
        businessId,
        listingIds: [],
        productIds: [],
        serviceIds: [],
      };
    }

    if (mode === ScopeMode.LISTINGS) {
      if (listingIds.length === 0) {
        throw new UnprocessableEntityException(
          'SCOPE_EMPTY: LISTINGS scope requires at least one listingId.',
        );
      }
      await this.assertListings(listingIds, businessId ?? input.tenantBusinessId ?? null);
    } else if (mode === ScopeMode.ITEMS) {
      if (productIds.length === 0 && serviceIds.length === 0) {
        throw new UnprocessableEntityException(
          'SCOPE_EMPTY: ITEMS scope requires at least one productId or serviceId.',
        );
      }
      await this.assertProducts(productIds, businessId ?? input.tenantBusinessId ?? null);
      await this.assertServices(serviceIds, businessId ?? input.tenantBusinessId ?? null);
    } else {
      throw new BadRequestException(`Unknown scope mode "${mode}".`);
    }

    const normalised: NormalisedScope = {
      mode,
      businessId,
      listingIds,
      productIds,
      serviceIds,
    };

    if (input.templateScope) {
      this.assertWithinTemplate(normalised, input.templateScope);
    }

    return normalised;
  }

  private assertWithinTemplate(
    scope: NormalisedScope,
    template: TemplateScopeConfig,
  ): void {
    if (template.mode === ScopeMode.NO_SCOPE) return;

    const fail = () => {
      throw new UnprocessableEntityException(
        'SCOPE_EXCEEDS_TEMPLATE: instrument scope is broader than the template restriction.',
      );
    };

    if (template.businessId && scope.businessId !== template.businessId) {
      fail();
    }

    if (template.mode === ScopeMode.ALL) return;

    if (template.mode === ScopeMode.LISTINGS) {
      if (scope.mode === ScopeMode.ALL) fail();
      if (scope.mode === ScopeMode.LISTINGS) {
        if (!isSubset(scope.listingIds, template.listingIds ?? [])) fail();
        return;
      }
      // ITEMS inside a listing template: every product/service must live in
      // one of the template listings. Ownership is validated separately, so
      // we only need to check the business binding here.
      if (scope.businessId && (template.listingIds ?? []).length > 0) {
        if (!template.listingIds.includes(scope.businessId)) fail();
      }
      return;
    }

    if (template.mode === ScopeMode.ITEMS) {
      if (scope.mode !== ScopeMode.ITEMS) fail();
      if (!isSubset(scope.productIds, template.productIds ?? [])) fail();
      if (!isSubset(scope.serviceIds, template.serviceIds ?? [])) fail();
    }
  }

  private async assertBusinessExists(businessId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException(`Business "${businessId}" was not found.`);
    }
    if (business.status === BusinessStatus.ARCHIVED) {
      throw new UnprocessableEntityException(
        'SCOPE_INVALID: the bound business is archived.',
      );
    }
    return business;
  }

  private async assertListings(
    listingIds: string[],
    businessId: string | null,
  ): Promise<void> {
    const businesses = await this.businessRepository.find({
      where: { id: In(listingIds) },
    });
    if (businesses.length !== listingIds.length) {
      throw new NotFoundException('One or more listings were not found.');
    }
    for (const business of businesses) {
      if (business.status !== BusinessStatus.PUBLISHED) {
        throw new UnprocessableEntityException(
          `SCOPE_INVALID: listing "${business.id}" is not published.`,
        );
      }
      if (businessId && business.id !== businessId) {
        throw new ForbiddenException(
          'CROSS_TENANT_SCOPE: listing does not belong to the bound business.',
        );
      }
    }
  }

  private async assertProducts(
    productIds: string[],
    businessId: string | null,
  ): Promise<void> {
    if (productIds.length === 0) return;
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      relations: ['business'],
    });
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found.');
    }
    for (const product of products) {
      if ((product.productStatus || '').toLowerCase() !== 'published') {
        throw new UnprocessableEntityException(
          `SCOPE_INVALID: product "${product.id}" is not published.`,
        );
      }
      if (businessId && product.business?.id !== businessId) {
        throw new ForbiddenException(
          'CROSS_TENANT_SCOPE: product does not belong to the bound business.',
        );
      }
    }
  }

  private async assertServices(
    serviceIds: string[],
    businessId: string | null,
  ): Promise<void> {
    if (serviceIds.length === 0) return;
    const services = await this.serviceRepository.find({
      where: { id: In(serviceIds) },
    });
    if (services.length !== serviceIds.length) {
      throw new NotFoundException('One or more services were not found.');
    }
    for (const service of services) {
      if ((service.status || '').toLowerCase() !== 'published') {
        throw new UnprocessableEntityException(
          `SCOPE_INVALID: service "${service.id}" is not published.`,
        );
      }
      if (businessId && service.businessId !== businessId) {
        throw new ForbiddenException(
          'CROSS_TENANT_SCOPE: service does not belong to the bound business.',
        );
      }
    }
  }

  // ─── Matching & maths (pure) ──────────────────────────────────────────────

  /**
   * Whether a checkout/booking line is eligible for an instrument.
   * A missing/NO_SCOPE row is unrestricted (legacy behaviour).
   */
  matches(
    scope:
      | Pick<
          InstrumentScope,
          'scopeMode' | 'businessId' | 'listingIds' | 'productIds' | 'serviceIds'
        >
      | NormalisedScope
      | null
      | undefined,
    line: Pick<ScopeLine, 'kind' | 'id' | 'businessId'>,
  ): boolean {
    if (!scope) return true;
    const mode = 'scopeMode' in (scope as any)
      ? (scope as InstrumentScope).scopeMode
      : (scope as NormalisedScope).mode;
    const businessId =
      (scope as any).businessId ?? (scope as any).business_id ?? null;

    switch (mode) {
      case ScopeMode.NO_SCOPE:
        return true;
      case ScopeMode.ALL:
        return !businessId || line.businessId === businessId;
      case ScopeMode.LISTINGS: {
        const ids = (scope as any).listingIds ?? [];
        return !!line.businessId && ids.includes(line.businessId);
      }
      case ScopeMode.ITEMS: {
        if (line.kind === 'product') {
          return ((scope as any).productIds ?? []).includes(line.id);
        }
        return ((scope as any).serviceIds ?? []).includes(line.id);
      }
      default:
        return true;
    }
  }

  computeEligible(
    scope:
      | Pick<
          InstrumentScope,
          'scopeMode' | 'businessId' | 'listingIds' | 'productIds' | 'serviceIds'
        >
      | NormalisedScope
      | null
      | undefined,
    lines: ScopeLine[],
  ): EligibleResult {
    const eligible = lines.filter((line) => this.matches(scope, line));
    return {
      eligibleSubtotal: round2(
        eligible.reduce((sum, line) => sum + line.lineTotal, 0),
      ),
      lines: eligible,
    };
  }

  /**
   * Item-only subtotal, used by scoped gift cards/vouchers (shipping is
   * deliberately excluded). Discounts already allocated to a line are
   * subtracted so an instrument can never pay for value that a coupon or
   * reward already removed.
   */
  computeEligiblePayable(
    scope:
      | Pick<
          InstrumentScope,
          'scopeMode' | 'businessId' | 'listingIds' | 'productIds' | 'serviceIds'
        >
      | NormalisedScope
      | null
      | undefined,
    lines: ScopeLine[],
    itemSubtotal: number,
    totalWithShipping: number,
  ): EligibleResult {
    const mode = !scope
      ? ScopeMode.NO_SCOPE
      : 'scopeMode' in (scope as any)
        ? (scope as InstrumentScope).scopeMode
        : (scope as NormalisedScope).mode;

    if (mode === ScopeMode.NO_SCOPE) {
      return {
        eligibleSubtotal: round2(Math.min(itemSubtotal, totalWithShipping)),
        lines,
      };
    }

    const { lines: eligibleLines } = this.computeEligible(scope, lines);
    const subtotal = eligibleLines.reduce(
      (sum, line) => sum + Math.max(0, line.lineTotal - (line.discount ?? 0)),
      0,
    );
    return {
      eligibleSubtotal: round2(Math.min(subtotal, totalWithShipping)),
      lines: eligibleLines,
    };
  }

  toResponse(scope: InstrumentScope | null): {
    mode: ScopeMode;
    businessId: string | null;
    listingIds: string[];
    productIds: string[];
    serviceIds: string[];
  } {
    if (!scope) {
      return {
        mode: ScopeMode.NO_SCOPE,
        businessId: null,
        listingIds: [],
        productIds: [],
        serviceIds: [],
      };
    }
    return {
      mode: scope.scopeMode,
      businessId: scope.businessId ?? null,
      listingIds: scope.listingIds ?? [],
      productIds: scope.productIds ?? [],
      serviceIds: scope.serviceIds ?? [],
    };
  }
}

export function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function isSubset(candidate: string[], allowed: string[]): boolean {
  return candidate.every((id) => allowed.includes(id));
}
