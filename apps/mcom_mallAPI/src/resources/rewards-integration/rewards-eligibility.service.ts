import { Injectable } from '@nestjs/common';
import {
  EligibleReward,
  EligibleRewardLine,
  EligibilityLine,
  MallRewardDiscountType,
  MallRewardTargets,
  RewardIssuanceDto,
} from './interfaces/reward-issuance.interface';

const CURRENCY_SCALE = 100;

function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * CURRENCY_SCALE) / CURRENCY_SCALE;
}

/**
 * Pure, side-effect-free reward eligibility engine.
 *
 * Given a user's reward issuances (from MCOM Rewards) and the current cart /
 * booking lines, decides which reward can discount which line and for how
 * much. The server is always the authority; clients only render the result.
 *
 * Rules (v1):
 *  - One reward applies to a whole line (qty × unit price).
 *  - A reward is never applicable to a line whose business does not match its
 *    business scope.
 *  - Rewards stack with nothing on the same line (enforced at checkout).
 */
@Injectable()
export class RewardsEligibilityService {
  /** Extract mall targeting from an issuance's metadata. */
  getTargets(issuance: RewardIssuanceDto): MallRewardTargets | null {
    const raw = issuance?.metadata?.mallTargets;
    if (!raw || typeof raw !== 'object') return null;

    const discountType = this.normalizeDiscountType(raw.discountType);
    const discountValue = Number(raw.discountValue);
    if (!discountType || !Number.isFinite(discountValue) || discountValue <= 0) {
      return null;
    }

    return {
      scope: raw.scope === 'ALL' ? 'ALL' : 'SPECIFIC',
      businessMcomUserId: raw.businessMcomUserId
        ? String(raw.businessMcomUserId)
        : undefined,
      businessId: raw.businessId ? String(raw.businessId) : undefined,
      productIds: Array.isArray(raw.productIds)
        ? raw.productIds.map(String)
        : [],
      serviceIds: Array.isArray(raw.serviceIds)
        ? raw.serviceIds.map(String)
        : [],
      discountType,
      discountValue,
      maxDiscount:
        raw.maxDiscount !== undefined && raw.maxDiscount !== null
          ? Number(raw.maxDiscount)
          : undefined,
      minSpend:
        raw.minSpend !== undefined && raw.minSpend !== null
          ? Number(raw.minSpend)
          : undefined,
    };
  }

  isDiscountReward(issuance: RewardIssuanceDto): boolean {
    return this.getTargets(issuance) !== null;
  }

  isUsable(issuance: RewardIssuanceDto, now: Date = new Date()): boolean {
    if (issuance.status !== 'ISSUED') return false;
    if (issuance.expiresAt && new Date(issuance.expiresAt).getTime() < now.getTime()) {
      return false;
    }
    return true;
  }

  private lineMatchesTarget(
    line: EligibilityLine,
    targets: MallRewardTargets,
  ): boolean {
    if (targets.businessMcomUserId) {
      if (line.businessMcomUserId !== targets.businessMcomUserId) return false;
    }
    if (targets.businessId && line.businessId !== targets.businessId) {
      return false;
    }

    if (targets.scope === 'ALL') {
      // Whole business (or whole ecosystem when no business is scoped).
      return true;
    }

    if (line.kind === 'PRODUCT') {
      return (targets.productIds ?? []).includes(line.id);
    }
    return (targets.serviceIds ?? []).includes(line.id);
  }

  computeLineDiscount(
    line: EligibilityLine,
    targets: MallRewardTargets,
  ): EligibleRewardLine | null {
    if (!this.lineMatchesTarget(line, targets)) return null;

    const lineTotal = round2(line.unitPrice * line.quantity);
    if (lineTotal <= 0) return null;
    if (targets.minSpend !== undefined && lineTotal < targets.minSpend) {
      return null;
    }

    let discount =
      targets.discountType === 'percentage'
        ? lineTotal * (targets.discountValue / 100)
        : targets.discountValue;

    let capped = false;
    if (targets.maxDiscount !== undefined && discount > targets.maxDiscount) {
      discount = targets.maxDiscount;
      capped = true;
    }
    discount = Math.min(discount, lineTotal);
    discount = round2(discount);

    if (discount <= 0) return null;
    return { lineKey: line.lineKey, discountAmount: discount, capped };
  }

  /**
   * Build the list of eligible rewards for a set of cart/booking lines.
   * Does not mutate anything and performs no I/O.
   */
  evaluate(
    issuances: RewardIssuanceDto[],
    lines: EligibilityLine[],
    now: Date = new Date(),
  ): EligibleReward[] {
    const result: EligibleReward[] = [];

    for (const issuance of issuances ?? []) {
      if (!this.isUsable(issuance, now)) continue;
      const targets = this.getTargets(issuance);
      if (!targets) continue;

      const applicableLines: EligibleRewardLine[] = [];
      for (const line of lines) {
        const match = this.computeLineDiscount(line, targets);
        if (match) applicableLines.push(match);
      }

      if (applicableLines.length === 0) continue;

      result.push({
        issuanceId: issuance.id,
        rewardTitle: issuance.rewardTitle || 'Reward',
        rewardType: issuance.rewardType ?? null,
        discountType: targets.discountType as MallRewardDiscountType,
        discountValue: targets.discountValue as number,
        expiresAt: issuance.expiresAt ?? null,
        code: issuance.code ?? null,
        applicableLines,
      });
    }

    return result;
  }

  private normalizeDiscountType(
    value: unknown,
  ): MallRewardDiscountType | null {
    if (typeof value !== 'string') return null;
    const normalized = value.toLowerCase();
    if (normalized === 'percentage') return 'percentage';
    if (normalized === 'fixed') return 'fixed';
    return null;
  }
}
