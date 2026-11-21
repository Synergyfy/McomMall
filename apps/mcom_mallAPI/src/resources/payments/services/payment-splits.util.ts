import type { McomPaySplit } from './mcom-pay.service';

/**
 * Largest-remainder allocation of an exact minor-unit total across weights.
 *
 * Every returned amount is an integer string in minor units and the results
 * always sum to `totalMinor`. This is deliberately BigInt-based: splits must
 * reconcile to the penny before MCOM Pay will accept a charge.
 */
export function allocateProRata(
  totalMinor: bigint,
  weights: bigint[],
): bigint[] {
  if (totalMinor <= 0n || weights.length === 0) {
    return weights.map(() => 0n);
  }

  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0n);
  if (weightTotal <= 0n) {
    return weights.map(() => 0n);
  }

  const floors = weights.map((weight) => (weight * totalMinor) / weightTotal);
  const remainders = weights.map(
    (weight) => (weight * totalMinor) % weightTotal,
  );
  let allocated = floors.reduce((sum, amount) => sum + amount, 0n);
  let leftover = totalMinor - allocated;

  // Give the remaining pennies to the largest fractional remainders first.
  // Ties keep their original order so the allocation is deterministic.
  const order = remainders
    .map((remainder, index) => ({ remainder, index }))
    .sort((a, b) =>
      a.remainder === b.remainder
        ? a.index - b.index
        : a.remainder > b.remainder
          ? -1
          : 1,
    );

  const result = [...floors];
  let cursor = 0;
  while (leftover > 0n && order.length > 0) {
    result[order[cursor % order.length].index] += 1n;
    leftover -= 1n;
    cursor += 1;
  }

  return result;
}

export type SplitContractError = 'MALFORMED_SPLIT' | 'SPLIT_SUM_MISMATCH';

export interface SplitContractResult {
  ok: boolean;
  error?: SplitContractError;
  message?: string;
}

/**
 * Validate a caller-supplied split list against the MCOM Pay contract
 * (Partner Guide G4/G8) before the charge is created.
 *
 * - every amount is a positive integer string in minor units;
 * - each payee is identified by exactly one id for its type;
 * - one split per payee, at most 50 payees;
 * - the splits sum exactly to the charge amount.
 */
export function validateSplitContract(
  amountMinor: string,
  splits?: McomPaySplit[],
): SplitContractResult {
  if (!splits || splits.length === 0) return { ok: true };

  if (splits.length > 50) {
    return {
      ok: false,
      error: 'MALFORMED_SPLIT',
      message: 'A charge can have at most 50 payee splits.',
    };
  }

  if (typeof amountMinor !== 'string' || !/^\d+$/.test(amountMinor)) {
    return {
      ok: false,
      error: 'MALFORMED_SPLIT',
      message: 'The charge amount must be a positive integer in minor units.',
    };
  }

  const seen = new Set<string>();
  let total = 0n;

  for (const split of splits) {
    const rawAmount = split?.amountMinor;
    if (typeof rawAmount !== 'string' || !/^\d+$/.test(rawAmount)) {
      return {
        ok: false,
        error: 'MALFORMED_SPLIT',
        message:
          'Every split amount must be a positive integer string in minor units.',
      };
    }

    const minor = BigInt(rawAmount);
    if (minor <= 0n) {
      return {
        ok: false,
        error: 'MALFORMED_SPLIT',
        message: 'Every split amount must be greater than zero.',
      };
    }

    let payeeKey: string;
    if (split.payeeType === 'mcom_user') {
      const payeeUserId = split.payeeUserId?.trim();
      if (!payeeUserId) {
        return {
          ok: false,
          error: 'MALFORMED_SPLIT',
          message: 'A mcom_user split requires payeeUserId.',
        };
      }
      payeeKey = `mcom_user:${payeeUserId}`;
    } else if (split.payeeType === 'external') {
      const payeeExternalId = split.payeeExternalId?.trim();
      if (!payeeExternalId) {
        return {
          ok: false,
          error: 'MALFORMED_SPLIT',
          message: 'An external split requires payeeExternalId.',
        };
      }
      payeeKey = `external:${payeeExternalId}`;
    } else {
      return {
        ok: false,
        error: 'MALFORMED_SPLIT',
        message: 'payeeType must be "mcom_user" or "external".',
      };
    }

    if (seen.has(payeeKey)) {
      return {
        ok: false,
        error: 'MALFORMED_SPLIT',
        message: `Duplicate split for payee ${payeeKey}.`,
      };
    }
    seen.add(payeeKey);
    total += minor;
  }

  if (total !== BigInt(amountMinor)) {
    return {
      ok: false,
      error: 'SPLIT_SUM_MISMATCH',
      message: `Splits sum to ${total.toString()} but the charge is ${amountMinor} minor units.`,
    };
  }

  return { ok: true };
}

export interface WeightedSplit {
  /** Internal key used to map the allocation back to a local business row. */
  key: string;
  /** Gross entitlement in minor units (before fees/discounts). */
  entitlementMinor: bigint;
  split: Omit<McomPaySplit, 'amountMinor'>;
}

export interface CashSplitAllocation {
  splits: McomPaySplit[];
  /** key -> the part of the buyer's cash that went through MCOM Pay. */
  allocatedMinor: Map<string, bigint>;
}

/**
 * Turn gross entitlements into MCOM Pay payee splits for the amount actually
 * charged. The Mall keeps the un-split remainder in its local earnings ledger,
 * so a seller is never paid twice for the same money.
 *
 * Rules:
 * - An exact entitlement total is used verbatim.
 * - When cash is lower (discounts/instruments), every payee bears the
 *   reduction proportionally, with largest-remainder rounding.
 * - When cash is higher (shipping/commission not in entitlements), the surplus
 *   goes to the platform payee. The caller should include a platform weight.
 */
export function allocateCashSplits(
  totalMinor: bigint,
  payees: WeightedSplit[],
  platformKey?: string,
): CashSplitAllocation {
  const nonZero = payees.filter((payee) => payee.entitlementMinor > 0n);
  if (totalMinor <= 0n || nonZero.length === 0) {
    return { splits: [], allocatedMinor: new Map() };
  }

  const weights = nonZero.map((payee) => payee.entitlementMinor);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0n);

  // Cash above the gross entitlement (for example a shipping fee with no
  // platform weight) is retained by the platform payee.
  if (totalMinor > weightTotal) {
    const surplus = totalMinor - weightTotal;
    const platformIndex = nonZero.findIndex(
      (payee) => payee.key === platformKey,
    );
    if (platformIndex >= 0) {
      weights[platformIndex] += surplus;
    } else {
      const platformExternalId = platformKey ?? '__platform__';
      nonZero.push({
        key: platformKey ?? '__platform__',
        entitlementMinor: surplus,
        split: {
          payeeType: 'external',
          payeeExternalId: platformExternalId,
        },
      });
      weights.push(surplus);
    }
  }

  const allocated = allocateProRata(totalMinor, weights);
  const splits: McomPaySplit[] = [];
  const allocatedMinor = new Map<string, bigint>();
  nonZero.forEach((payee, index) => {
    const amount = allocated[index] ?? 0n;
    if (amount <= 0n) return;
    splits.push({ ...payee.split, amountMinor: amount.toString() });
    allocatedMinor.set(payee.key, amount);
  });

  // MCOM Pay accepts at most 50 payees per charge. Refusing the split is
  // safer than silently dropping a seller; the caller can fall back to the
  // app-payable model and flag the order for manual settlement.
  if (splits.length > 50) {
    return { splits: [], allocatedMinor: new Map() };
  }

  return { splits, allocatedMinor };
}
