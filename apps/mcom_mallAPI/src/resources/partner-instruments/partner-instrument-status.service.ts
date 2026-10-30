import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { Voucher, VoucherStatus } from '../voucher/entities/voucher.entity';
import { Coupon } from '../coupon/entities/coupon.entity';
import {
  CouponStatus,
} from '../coupon/coupon.enum';
import {
  RedemptionLog,
  RedemptionStatus,
} from '../coupon/entities/redemption-log.entity';
import { InstrumentScopeService } from './instrument-scope.service';
import { PartnerCallbackService } from './partner-callback.service';
import { InstrumentType, ScopeMode } from './enums';

export type InstrumentKind = 'gift-cards' | 'vouchers' | 'coupons';

export interface InstrumentStatusResponse {
  type: 'gift_card' | 'voucher' | 'coupon';
  id: string;
  code: string;
  issuanceId: string | null;
  status: string;
  balance: number;
  currency: string;
  expiresAt: string | null;
  businessId: string | null;
  scope: {
    mode: ScopeMode;
    businessId: string | null;
    listingIds: string[];
    productIds: string[];
    serviceIds: string[];
  };
  metadata: Record<string, any> | null;
}

/**
 * Cross-kind status/revoke surface used by Rewards and the storefront deep
 * link. Reads are safe (no consumption); revoke is idempotent and reports
 * `409` when there is nothing left to revoke.
 */
@Injectable()
export class PartnerInstrumentStatusService {
  constructor(
    @InjectRepository(GiftCard)
    private readonly giftCardRepository: Repository<GiftCard>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(RedemptionLog)
    private readonly redemptionLogRepository: Repository<RedemptionLog>,
    private readonly scopeService: InstrumentScopeService,
    private readonly callbacks: PartnerCallbackService,
  ) {}

  async getStatus(
    kind: InstrumentKind | string,
    code: string,
  ): Promise<InstrumentStatusResponse> {
    const normalised = this.normaliseKind(kind);

    switch (normalised.type) {
      case InstrumentType.GIFT_CARD: {
        const card = await this.giftCardRepository.findOne({
          where: { code },
        });
        if (!card) throw new NotFoundException('Gift card not found.');
        const cardScope = await this.scopeService.getScope(
          InstrumentType.GIFT_CARD,
          card.id,
        );
        return {
          type: 'gift_card',
          id: card.id,
          code: card.code,
          issuanceId: card.issuanceId ?? null,
          status: this.giftCardStatus(card),
          balance: round2(Number(card.currentBalance)),
          currency: card.currency || 'GBP',
          expiresAt: card.expiryDate ? new Date(card.expiryDate).toISOString() : null,
          businessId: card.purchaseBusinessId ?? null,
          scope: this.scopeService.toResponse(cardScope),
          metadata: card.metadata ?? null,
        };
      }
      case InstrumentType.VOUCHER: {
        const voucher = await this.voucherRepository.findOne({
          where: { code },
        });
        if (!voucher) throw new NotFoundException('Voucher not found.');
        const voucherScope = await this.scopeService.getScope(
          InstrumentType.VOUCHER,
          voucher.id,
        );
        return {
          type: 'voucher',
          id: voucher.id,
          code: voucher.code,
          issuanceId: voucher.issuanceId ?? null,
          status: voucher.status,
          balance: round2(Number(voucher.balance)),
          currency: 'GBP',
          expiresAt: voucher.expiresAt
            ? new Date(voucher.expiresAt).toISOString()
            : null,
          businessId: voucher.businessId ?? null,
          scope: this.scopeService.toResponse(voucherScope),
          metadata: voucher.metadata ?? null,
        };
      }
      case InstrumentType.COUPON: {
        const coupon = await this.couponRepository.findOne({
          where: { code },
          relations: ['business'],
        });
        if (!coupon) throw new NotFoundException('Coupon not found.');
        const couponScope = await this.scopeService.getScope(
          InstrumentType.COUPON,
          coupon.id,
        );
        return {
          type: 'coupon',
          id: coupon.id,
          code: coupon.code,
          issuanceId: coupon.issuanceId ?? null,
          status: coupon.status,
          balance:
            coupon.status === CouponStatus.ACTIVE
              ? round2(Number(coupon.discountValue))
              : 0,
          currency: 'GBP',
          expiresAt: coupon.expiresAt
            ? new Date(coupon.expiresAt).toISOString()
            : null,
          businessId: (coupon.business as any)?.id ?? null,
          scope: this.scopeService.toResponse(couponScope),
          metadata: coupon.metadata ?? null,
        };
      }
      default:
        throw new BadRequestException(`Unknown instrument kind "${kind}".`);
    }
  }

  /**
   * Lightweight, unauthenticated (storefront) lookup used by the deep-link
   * banner. Returns no issuance id and no recipient PII.
   */
  async resolvePublicReward(
    code: string,
    listingId?: string,
  ): Promise<{
    valid: boolean;
    reason?: string;
    type?: 'gift_card' | 'voucher' | 'coupon';
    businessId?: string | null;
    balance?: number;
    currency?: string;
    expiresAt?: string | null;
    eligibleForListing?: boolean;
    scope?: any;
    eligibleProductIds?: string[];
    eligibleServiceIds?: string[];
  }> {
    const card = await this.giftCardRepository.findOne({ where: { code } });
    if (card) {
      if (!card.isActive || Number(card.currentBalance) <= 0) {
        return { valid: false, reason: 'CODE_CONSUMED' };
      }
      if (card.expiryDate && new Date() > new Date(card.expiryDate)) {
        return { valid: false, reason: 'CODE_EXPIRED' };
      }
      const scope = await this.scopeService.getScope(
        InstrumentType.GIFT_CARD,
        card.id,
      );
      const eligibility = this.listingEligibility(
        scope,
        card.purchaseBusinessId ?? null,
        listingId,
      );
      return {
        valid: true,
        type: 'gift_card',
        businessId: card.purchaseBusinessId ?? null,
        balance: round2(Number(card.currentBalance)),
        currency: card.currency || 'GBP',
        expiresAt: card.expiryDate ? new Date(card.expiryDate).toISOString() : null,
        eligibleForListing: eligibility.eligible,
        scope: this.scopeService.toResponse(scope),
        eligibleProductIds: eligibility.productIds,
        eligibleServiceIds: eligibility.serviceIds,
      };
    }

    const voucher = await this.voucherRepository.findOne({ where: { code } });
    if (voucher) {
      if (voucher.status === VoucherStatus.REDEEMED || voucher.status === VoucherStatus.DISABLED) {
        return { valid: false, reason: 'CODE_CONSUMED' };
      }
      if (voucher.expiresAt && new Date() > new Date(voucher.expiresAt)) {
        return { valid: false, reason: 'CODE_EXPIRED' };
      }
      const scope = await this.scopeService.getScope(
        InstrumentType.VOUCHER,
        voucher.id,
      );
      const eligibility = this.listingEligibility(
        scope,
        voucher.businessId ?? null,
        listingId,
      );
      return {
        valid: true,
        type: 'voucher',
        businessId: voucher.businessId ?? null,
        balance: round2(Number(voucher.balance)),
        currency: 'GBP',
        expiresAt: voucher.expiresAt
          ? new Date(voucher.expiresAt).toISOString()
          : null,
        eligibleForListing: eligibility.eligible,
        scope: this.scopeService.toResponse(scope),
        eligibleProductIds: eligibility.productIds,
        eligibleServiceIds: eligibility.serviceIds,
      };
    }

    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['business'],
    });
    if (coupon) {
      if (coupon.status !== CouponStatus.ACTIVE) {
        return { valid: false, reason: 'CODE_CONSUMED' };
      }
      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        return { valid: false, reason: 'CODE_EXPIRED' };
      }
      const scope = await this.scopeService.getScope(
        InstrumentType.COUPON,
        coupon.id,
      );
      const businessId = (coupon.business as any)?.id ?? null;
      const eligibility = this.listingEligibility(scope, businessId, listingId);
      return {
        valid: true,
        type: 'coupon',
        businessId,
        balance: round2(Number(coupon.discountValue)),
        currency: 'GBP',
        expiresAt: coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString()
          : null,
        eligibleForListing: eligibility.eligible,
        scope: this.scopeService.toResponse(scope),
        eligibleProductIds: eligibility.productIds,
        eligibleServiceIds: eligibility.serviceIds,
      };
    }

    return { valid: false, reason: 'CODE_NOT_FOUND' };
  }

  private listingEligibility(
    scope: any,
    businessId: string | null,
    listingId?: string,
  ): {
    eligible: boolean;
    productIds: string[];
    serviceIds: string[];
  } {
    const mode = scope?.scopeMode ?? ScopeMode.NO_SCOPE;
    const productIds = scope?.productIds ?? [];
    const serviceIds = scope?.serviceIds ?? [];
    if (!listingId) {
      return { eligible: true, productIds, serviceIds };
    }
    if (mode === ScopeMode.NO_SCOPE) {
      return { eligible: true, productIds, serviceIds };
    }
    if (mode === ScopeMode.ALL) {
      return {
        eligible: !scope?.businessId || scope.businessId === listingId,
        productIds,
        serviceIds,
      };
    }
    if (mode === ScopeMode.LISTINGS) {
      return {
        eligible: (scope?.listingIds ?? []).includes(listingId),
        productIds,
        serviceIds,
      };
    }
    // ITEMS: eligible if the instrument is bound to this listing (or global).
    return {
      eligible: !businessId || businessId === listingId,
      productIds,
      serviceIds,
    };
  }

  async revoke(
    kind: InstrumentKind | string,
    code: string,
    note?: string,
  ): Promise<InstrumentStatusResponse> {    const normalised = this.normaliseKind(kind);

    if (normalised.type === InstrumentType.GIFT_CARD) {
      const card = await this.giftCardRepository.findOne({ where: { code } });
      if (!card) throw new NotFoundException('Gift card not found.');
      if (
        Number(card.currentBalance) <= 0 ||
        (!card.isActive && (card.metadata as any)?.revokedAt)
      ) {
        throw new ConflictException(
          'CODE_ALREADY_CONSUMED: this gift card has no remaining balance.',
        );
      }
      card.currentBalance = 0;
      card.isActive = false;
      card.metadata = {
        ...(card.metadata ?? {}),
        revokedAt: new Date().toISOString(),
        revocationNote: note ?? null,
      };
      await this.giftCardRepository.save(card);
      await this.callbacks.enqueueRevoke({
        issuanceId: card.issuanceId,
        code: card.code,
        instrumentType: InstrumentType.GIFT_CARD,
        instrumentId: card.id,
        note,
      });
      return this.getStatus(kind, code);
    }

    if (normalised.type === InstrumentType.VOUCHER) {
      const voucher = await this.voucherRepository.findOne({
        where: { code },
      });
      if (!voucher) throw new NotFoundException('Voucher not found.');
      if (
        voucher.status === VoucherStatus.REDEEMED ||
        Number(voucher.balance) <= 0
      ) {
        throw new ConflictException(
          'CODE_ALREADY_CONSUMED: this voucher has no remaining balance.',
        );
      }
      voucher.balance = 0;
      voucher.status = VoucherStatus.DISABLED;
      voucher.metadata = {
        ...(voucher.metadata ?? {}),
        revokedAt: new Date().toISOString(),
        revocationNote: note ?? null,
      };
      await this.voucherRepository.save(voucher);
      await this.callbacks.enqueueRevoke({
        issuanceId: voucher.issuanceId,
        code: voucher.code,
        instrumentType: InstrumentType.VOUCHER,
        instrumentId: voucher.id,
        note,
      });
      return this.getStatus(kind, code);
    }

    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found.');
    const consumed = await this.redemptionLogRepository.count({
      where: {
        coupon: { id: coupon.id },
        status: RedemptionStatus.REDEEMED,
      },
    });
    if (
      coupon.status === CouponStatus.DISABLED ||
      (coupon.usageLimit > 0 && consumed >= coupon.usageLimit)
    ) {
      throw new ConflictException(
        'CODE_ALREADY_CONSUMED: this coupon has already been consumed or revoked.',
      );
    }
    coupon.status = CouponStatus.DISABLED;
    coupon.metadata = {
      ...(coupon.metadata ?? {}),
      revokedAt: new Date().toISOString(),
      revocationNote: note ?? null,
    };
    await this.couponRepository.save(coupon);
    await this.callbacks.enqueueRevoke({
      issuanceId: coupon.issuanceId,
      code: coupon.code,
      instrumentType: InstrumentType.COUPON,
      instrumentId: coupon.id,
      note,
    });
    return this.getStatus(kind, code);
  }

  private giftCardStatus(card: GiftCard): string {
    if ((card.metadata as any)?.revokedAt) return 'revoked';
    if (Number(card.currentBalance) <= 0) return 'redeemed';
    if (!card.isActive) return 'disabled';
    if (card.expiryDate && new Date() > new Date(card.expiryDate)) {
      return 'expired';
    }
    return 'active';
  }

  private normaliseKind(kind: string): { type: InstrumentType } {
    const value = String(kind).toLowerCase();
    if (value === 'gift-cards' || value === 'gift_card' || value === 'gift-card') {
      return { type: InstrumentType.GIFT_CARD };
    }
    if (value === 'vouchers' || value === 'voucher') {
      return { type: InstrumentType.VOUCHER };
    }
    if (value === 'coupons' || value === 'coupon') {
      return { type: InstrumentType.COUPON };
    }
    throw new BadRequestException(
      `Unknown instrument kind "${kind}". Use gift-cards, vouchers, or coupons.`,
    );
  }
}

function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
