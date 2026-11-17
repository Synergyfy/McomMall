import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Coupon } from '../coupon/entities/coupon.entity';
import { UserVoucher } from '../money-engine/entities/user-voucher.entity';
import {
  FunctionalType,
  ScopeType,
} from '../money-engine/entities/reward-definition.entity';
import { Voucher } from '../voucher/entities/voucher.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';

export type ResolvedInstrumentKind =
  | 'standard_coupon'
  | 'coupon_voucher'
  | 'voucher_coupon'
  | 'voucher'
  | 'gift_card';

export interface ResolvedInstrument {
  id: string;
  code: string;
  kind: ResolvedInstrumentKind;
  visualType: 'coupon' | 'voucher';
  behavior: 'price_reducer' | 'spending_power';
  faceValue: number | null;
  balance: number | null;
  status: string;
  scope: {
    mode: string;
    businessId?: string | null;
    listingIds?: string[];
    productIds?: string[];
    serviceIds?: string[];
  } | null;
  source: 'coupon' | 'money_voucher' | 'voucher' | 'gift_card';
}

/**
 * Canonical code resolver across every instrument ledger.
 *
 * Callers that only have a code (checkout, POS, Deals, support tooling) can
 * ask this service what the instrument is and how it behaves, without knowing
 * which table owns it. Domain services remain the write source of truth.
 */
@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(UserVoucher)
    private readonly userVoucherRepository: Repository<UserVoucher>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(GiftCard)
    private readonly giftCardRepository: Repository<GiftCard>,
  ) {}

  async resolve(code: string): Promise<ResolvedInstrument> {
    const moneyVoucher = await this.userVoucherRepository.findOne({
      where: { code },
      relations: ['definition', 'definition.validShops'],
    });
    if (moneyVoucher) {
      const behavior =
        (moneyVoucher.functionalType ??
          moneyVoucher.definition?.functionalType) ===
        FunctionalType.PRICE_REDUCER
          ? 'price_reducer'
          : 'spending_power';
      const expired = Boolean(
        moneyVoucher.expiresAt &&
          new Date() > new Date(moneyVoucher.expiresAt),
      );
      const status = expired
        ? 'expired'
        : String(moneyVoucher.state ?? '').toLowerCase();
      const faceValue =
        moneyVoucher.faceValue ?? moneyVoucher.definition?.faceValue ?? null;
      return {
        id: moneyVoucher.id,
        code: moneyVoucher.code,
        kind: behavior === 'price_reducer' ? 'voucher_coupon' : 'coupon_voucher',
        visualType: (moneyVoucher.definition?.visualType as any) ?? 'voucher',
        behavior,
        faceValue,
        balance:
          behavior === 'price_reducer'
            ? status === 'active'
              ? Number(faceValue ?? 0)
              : 0
            : Number(moneyVoucher.realBalance) +
              Number(moneyVoucher.rewardBalance),
        status,
        scope: this.definitionScope(moneyVoucher.definition),
        source: 'money_voucher',
      };
    }

    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['business'],
    });
    if (voucher) {
      return {
        id: voucher.id,
        code: voucher.code,
        kind: 'voucher',
        visualType: 'voucher',
        behavior: 'spending_power',
        faceValue: Number(voucher.initialValue ?? 0),
        balance: Number(voucher.balance ?? 0),
        status: String(voucher.status ?? '').toLowerCase(),
        scope: this.businessScope(voucher.business),
        source: 'voucher',
      };
    }

    const giftCard = await this.giftCardRepository.findOne({
      where: { code },
      relations: ['purchaseBusiness'],
    });
    if (giftCard) {
      return {
        id: giftCard.id,
        code: giftCard.code,
        kind: 'gift_card',
        visualType: 'voucher',
        behavior: 'spending_power',
        faceValue: Number(giftCard.initialBalance ?? 0),
        balance: Number(giftCard.currentBalance ?? 0),
        status: giftCard.isActive ? 'active' : 'inactive',
        scope: this.businessScope(giftCard.purchaseBusiness),
        source: 'gift_card',
      };
    }

    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['business'],
    });
    if (coupon) {
      const metadata = (coupon.metadata ?? {}) as Record<string, any>;
      const balance = Number(metadata.balance ?? 0);
      const isBalanceBearing = balance > 0 || Boolean(metadata.couponProductId);
      return {
        id: coupon.id,
        code: coupon.code,
        kind: isBalanceBearing ? 'coupon_voucher' : 'standard_coupon',
        visualType: 'coupon',
        behavior: isBalanceBearing ? 'spending_power' : 'price_reducer',
        faceValue: isBalanceBearing
          ? Number(metadata.initialValue ?? coupon.discountValue ?? 0)
          : Number(coupon.discountValue ?? 0),
        balance: isBalanceBearing ? balance : null,
        status: String(coupon.status ?? '').toLowerCase(),
        scope: this.businessScope(coupon.business),
        source: 'coupon',
      };
    }

    throw new NotFoundException('Instrument not found.');
  }

  private businessScope(
    business: { id: string } | null | undefined,
  ): ResolvedInstrument['scope'] {
    if (!business?.id) return null;
    return {
      mode: 'LISTINGS',
      businessId: business.id,
      listingIds: [business.id],
    };
  }

  private definitionScope(
    definition: {
      scopeType?: ScopeType;
      validShops?: Array<{ id: string }>;
      validProductIds?: string[] | null;
      validServiceIds?: string[] | null;
    } | null | undefined,
  ): ResolvedInstrument['scope'] {
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
}
