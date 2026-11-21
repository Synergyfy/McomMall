import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  McomPayIntent,
  McomPaySplit,
  VerifyChargeContext,
} from './mcom-pay.service';
import { PaymentProviderService } from './payment-provider.service';

/**
 * The one payment rail vocabulary used by every feature module.
 *
 * Values intentionally match `PaymentMethod` in the order entity, so callers
 * can pass the enum straight through.
 */
export type PaymentRail = 'stripe' | 'paypal' | 'mcom_wallet';

export interface PaymentPayer {
  /** Mall user id (JWT subject). */
  mallUserId: string;
  /** Linked MCOM Central user id, required for wallet rails. */
  centralUserId?: string | null;
}

export interface InitiatePaymentInput {
  rail: PaymentRail;
  amount: number;
  currency?: string;
  payer: PaymentPayer;
  /** Frozen business context stored on the charge and local mirror. */
  metadata?: Record<string, any>;
  /** Deterministic per business event. Caller owns the identity. */
  idempotencyKey: string;
  /**
   * Wallet hold key, when it differs from the provider idempotency key
   * (for example a domain-scoped `buildWalletKey(...)`).
   */
  walletIdempotencyKey?: string;
  /** Reduced metadata for the wallet hold, when it differs. */
  walletHoldMetadata?: Record<string, any>;
  /** Stable business reference used by verification/webhooks. */
  reference: string;
  description?: string;
  /**
   * Wallet rails only. `hold` (default) reserves funds for a later capture;
   * `charge` debits immediately.
   */
  walletMode?: 'hold' | 'charge';
  splits?: McomPaySplit[];
  intent?: McomPayIntent;
  /** Retained for wallet hold TTLs. */
  ttlHours?: number;
}

export type InitiatePaymentResult =
  | {
      rail: 'stripe';
      chargeId: string;
      providerRef: string | null;
      clientSecret: string;
      amount: number;
      currency: string;
    }
  | {
      rail: 'paypal';
      chargeId: string;
      orderId: string;
      approvalUrl: string | null;
      amount: number;
      currency: string;
    }
  | {
      rail: 'mcom_wallet';
      chargeId?: string;
      holdId: string;
      expiresAt?: string;
      status?: string;
      amount: number;
      currency: string;
    };

export interface ConfirmPaymentInput {
  rail: PaymentRail;
  /** Provider handle from the browser: intent id, order id, or hold id. */
  reference: string;
  amount: number;
  currency?: string;
  payer: PaymentPayer;
  /** Domain purpose, e.g. `ORDER`, `BOOKING`, `MEMBERSHIP`. */
  purpose?: string;
  /** Wallet hold id when the browser only kept the hold reference. */
  holdId?: string;
  /** Reference to bind the charge to (prefix match, e.g. `booking-<id>`). */
  contextReference?: string;
  intent?: McomPayIntent;
  splits?: McomPaySplit[];
  /** Key used when a wallet hold is converted into a settled charge. */
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentResult {
  ok: boolean;
  /** MCOM Pay charge id (null for a legacy wallet-only capture). */
  chargeId: string | null;
  /** Stable reference for the local ledger. */
  transactionId: string;
  providerRef: string | null;
  feeMinor: string | null;
  netMinor: string | null;
  method: PaymentRail;
  amountMinor: string;
  currency: string;
  status: string;
  reason?: string;
  raw?: any;
}

export interface RefundPaymentInput {
  rail: PaymentRail;
  reference: string;
  amount?: number;
  reason?: string;
}

/**
 * Central payment orchestration.
 *
 * Every feature module (orders, bookings, memberships, gift cards, vouchers,
 * coupons, money engine, wallet top-ups, campaigns) calls this service instead
 * of branching on the payment rail itself.
 *
 * The domain still owns:
 *  - how much to charge (server-side price),
 *  - the idempotency-key identity,
 *  - the local ledger write and product grant.
 *
 * This service owns:
 *  - which MCOM Pay primitive to call for the rail,
 *  - wallet hold vs immediate charge,
 *  - verification/normalisation of the provider result,
 *  - refunds.
 */
@Injectable()
export class PaymentOrchestratorService {
  constructor(private readonly provider: PaymentProviderService) {}

  isEnabled(): boolean {
    return this.provider.isEnabled();
  }

  isSplitsEnabled(): boolean {
    return this.provider.isSplitsEnabled();
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const currency = (input.currency || 'GBP').toUpperCase();
    const metadata = this.buildMetadata(input);

    if (input.rail === 'stripe') {
      const intent = await this.provider.createStripePaymentIntent(
        input.amount,
        currency,
        metadata,
      );
      return {
        rail: 'stripe',
        chargeId: (intent as any).chargeId || intent.id,
        providerRef: (intent as any).providerRef ?? null,
        clientSecret: intent.client_secret as string,
        amount: input.amount,
        currency,
      };
    }

    if (input.rail === 'paypal') {
      const order = await this.provider.createPaypalOrder(
        input.amount,
        currency,
        metadata,
      );
      return {
        rail: 'paypal',
        chargeId: order.chargeId,
        orderId: order.id,
        approvalUrl: order.approvalUrl ?? null,
        amount: input.amount,
        currency,
      };
    }

    if (input.rail === 'mcom_wallet') {
      const centralUserId = input.payer.centralUserId;
      if (!centralUserId) {
        throw new BadRequestException(
          'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
        );
      }

      if ((input.walletMode ?? 'hold') === 'charge') {
        const charge = await this.provider.createWalletCharge(
          input.amount,
          currency,
          metadata,
          centralUserId,
        );
        return {
          rail: 'mcom_wallet',
          chargeId: charge.chargeId,
          holdId: charge.chargeId,
          status: charge.status,
          amount: charge.amount,
          currency,
        };
      }

      const hold = await this.provider.createWalletHold({
        mcomUserId: centralUserId,
        amount: input.amount,
        reference: input.reference,
        idempotencyKey: input.walletIdempotencyKey ?? input.idempotencyKey,
        ttlHours: input.ttlHours,
        metadata: input.walletHoldMetadata ?? metadata,
      });
      return {
        rail: 'mcom_wallet',
        holdId: hold.holdId,
        expiresAt: hold.expiresAt,
        amount: hold.amount,
        currency,
      };
    }

    throw new BadRequestException('Invalid payment rail specified.');
  }

  async confirm(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    const currency = (input.currency || 'GBP').toUpperCase();
    const context: VerifyChargeContext & {
      holdId?: string;
      reference?: string;
      intent?: McomPayIntent;
      splits?: McomPaySplit[];
    } = {
      mallUserId: input.payer.mallUserId,
      mcomUserId: input.payer.centralUserId ?? undefined,
      holdId: input.holdId,
      reference: input.contextReference,
      intent: input.intent,
      splits: input.splits,
    };

    if (input.rail === 'stripe') {
      const result = await this.provider.verifyStripePaymentIntent(
        input.reference,
        input.amount,
        currency,
        context,
      );
      return this.normalise(result, input, currency);
    }

    if (input.rail === 'paypal') {
      const result = await this.provider.captureAndVerifyPaypalOrder(
        input.reference,
        input.amount,
        currency,
        context,
      );
      return this.normalise(result, input, currency);
    }

    if (input.rail === 'mcom_wallet') {
      const result = await this.provider.settleWalletReference(
        input.reference,
        input.amount,
        currency,
        context,
        input.idempotencyKey,
      );
      return this.normalise(result, input, currency);
    }

    throw new BadRequestException('Invalid payment rail specified.');
  }

  async refund(input: RefundPaymentInput): Promise<any> {
    if (input.rail === 'stripe') {
      return this.provider.refundStripePayment(
        input.reference,
        input.amount,
        input.reason,
      );
    }
    if (input.rail === 'paypal') {
      return this.provider.refundPaypalOrder(input.reference, input.amount);
    }

    // Wallet refunds are domain decisions (release a hold or credit the wallet).
    // There is no MCOM Pay "refund a wallet charge" endpoint; callers use the
    // wallet service directly.
    throw new ServiceUnavailableException(
      'Wallet payments are settled, not refunded through the payment rail.',
    );
  }

  /**
   * Refund an MCOM Pay charge by its ledger reference, regardless of rail.
   * Safe for wallet charges too: MCOM Pay reverses the settled charge and its
   * splits itself.
   */
  refundCharge(
    reference: string,
    amount?: number,
    reason?: string,
  ): Promise<any> {
    return this.provider.refundStripePayment(reference, amount, reason);
  }

  /** Expose the existing price/amount helper so callers don't re-implement it. */
  toMinorUnits(amount: number): string {
    return this.provider.toMinorUnits(amount);
  }

  /** Read-only: has a wallet charge/reference already settled? */
  checkWalletCharge(
    reference: string,
    amount: number,
    currency: string,
    payer: PaymentPayer,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    return this.provider.verifyWalletCharge(reference, amount, currency, {
      mallUserId: payer.mallUserId,
      mcomUserId: payer.centralUserId ?? undefined,
    });
  }

  /** Read-only: inspect a Stripe charge without capturing anything. */
  checkStripePayment(
    reference: string,
    amount: number,
    currency: string,
    payer: PaymentPayer,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    return this.provider.verifyStripePaymentIntent(
      reference,
      amount,
      currency,
      {
        mallUserId: payer.mallUserId,
        mcomUserId: payer.centralUserId ?? undefined,
      },
    );
  }

  /** Read-only ledger lookup (used for legacy reference normalisation). */
  getCharge(chargeId: string): Promise<any> {
    return this.provider.getMcomCharge(chargeId);
  }

  private buildMetadata(
    input: InitiatePaymentInput,
  ): Record<string, any> & {
    localContext?: Record<string, any>;
  } {
    return {
      ...(input.metadata ?? {}),
      reference: input.reference,
      userId: input.payer.mallUserId,
      idempotencyKey: input.idempotencyKey,
      description: input.description ?? input.metadata?.description,
      intent: input.intent ?? input.metadata?.intent,
      splits: input.splits ?? input.metadata?.splits,
      // Make the central identity explicit for the provider.
      mcomUserId:
        input.metadata?.mcomUserId ??
        input.metadata?.centralUserId ??
        input.payer.centralUserId ??
        undefined,
    };
  }

  private normalise(
    result: { ok: boolean; details?: any; reason?: string },
    input: ConfirmPaymentInput,
    currency: string,
  ): ConfirmPaymentResult {
    const details: any = result.details ?? {};
    const rawId = details.id ?? null;
    const chargeId =
      rawId && !String(rawId).startsWith('wallet:') ? String(rawId) : null;
    const transactionId =
      details.transactionId || rawId || input.holdId || input.reference;

    return {
      ok: result.ok,
      chargeId,
      transactionId: String(transactionId),
      providerRef: details.providerRef ?? null,
      feeMinor: details.feeMinor ?? null,
      netMinor: details.netMinor ?? null,
      method: input.rail,
      amountMinor: String(
        details.amountMinor ?? Math.round(input.amount * 100),
      ),
      currency: (details.currency || currency).toUpperCase(),
      status: details.status ?? (result.ok ? 'paid' : 'failed'),
      reason: result.reason,
      raw: details,
    };
  }
}
