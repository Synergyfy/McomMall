import {
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../../users/entities/user.entity';
import {
  McomPayIntent,
  McomPayService,
  McomPaySplit,
  VerifyChargeContext,
} from './mcom-pay.service';
import { McomWalletService } from './mcom-wallet.service';
import { allocateCashSplits } from './payment-splits.util';

export interface PaypalPayoutBatch {
  batch_header: {
    payout_batch_id: string;
    batch_status: string;
  };
}

function isPaypalPayoutBatch(payload: unknown): payload is PaypalPayoutBatch {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const header = (payload as { batch_header?: unknown }).batch_header;
  return (
    typeof header === 'object' &&
    header !== null &&
    typeof (header as { payout_batch_id?: unknown }).payout_batch_id ===
      'string'
  );
}

/**
 * Payment gateway facade.
 *
 * Every customer payment (card, PayPal, MCOM Wallet) is created, confirmed and
 * refunded by MCOM Central through `McomPayService`. There is intentionally no
 * direct Stripe/PayPal fallback: a misconfigured deployment must fail closed,
 * never silently move money through the mall's own merchant accounts.
 *
 * The Stripe instance is retained only for business payouts (transfers), which
 * are an outbound settlement concern and outside MCOM Pay's customer-charge
 * API.
 */
@Injectable()
export class PaymentProviderService {
  private readonly logger = new Logger(PaymentProviderService.name);
  private stripe: Stripe | null = null;

  constructor(
    private configService: ConfigService,
    private readonly mcomPay: McomPayService,
    private readonly mcomWallet: McomWalletService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey && !stripeKey.includes('placeholder')) {
      this.stripe = new Stripe(stripeKey);
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY is not configured. Business payouts via Stripe transfers are unavailable; customer payments still use MCOM Pay.',
      );
    }

    if (!this.mcomPay.isEnabled()) {
      this.logger.error(
        'MCOM Pay is disabled. All customer payments will be rejected; there is no direct provider fallback.',
      );
    }
  }

  isEnabled(): boolean {
    return this.mcomPay.isEnabled();
  }

  isSplitsEnabled(): boolean {
    return this.mcomPay.isSplitsEnabled();
  }

  getLocalChargeSplits(chargeId: string): Promise<McomPaySplit[]> {
    return this.mcomPay.getLocalChargeSplits(chargeId);
  }

  getLocalChargeMeta(
    chargeId: string,
  ): Promise<{ splits: McomPaySplit[]; intent: string | null }> {
    return this.mcomPay.getLocalChargeMeta(chargeId);
  }

  getLocalChargeContext(
    chargeId: string,
  ): Promise<Record<string, any> | null> {
    return this.mcomPay.getLocalChargeContext(chargeId);
  }

  /**
   * Splits for a direct purchase from one seller (gift card, voucher, coupon).
   * There is no platform commission or shipping on these sales.
   */
  buildSellerSplits(
    amount: number,
    seller: {
      userId: string;
      centralUserId?: string | null;
      externalId?: string | null;
    },
  ): McomPaySplit[] | undefined {
    if (!this.mcomPay.isSplitsEnabled() || amount <= 0) return undefined;
    const allocation = allocateCashSplits(
      BigInt(Math.round(amount * 100)),
      [
        {
          key: 'seller',
          entitlementMinor: BigInt(Math.round(amount * 100)),
          split: seller.centralUserId
            ? {
                payeeType: 'mcom_user',
                payeeUserId: seller.centralUserId,
              }
            : {
                payeeType: 'external',
                payeeExternalId:
                  seller.externalId ?? `user:${seller.userId}`,
              },
        },
      ],
    );
    return allocation.splits.length ? allocation.splits : undefined;
  }

  /** The seller's portion of a charge that was paid through MCOM splits. */
  sellerCashMinor(
    splits: McomPaySplit[],
    seller: {
      userId: string;
      centralUserId?: string | null;
      externalId?: string | null;
    },
  ): bigint {
    if (!splits?.length) return 0n;
    const externalId = seller.externalId ?? `user:${seller.userId}`;
    return splits.reduce((total, split) => {
      const matches = seller.centralUserId
        ? split.payeeUserId === seller.centralUserId
        : split.payeeExternalId === externalId;
      return matches ? total + BigInt(split.amountMinor || '0') : total;
    }, 0n);
  }

  private chargeIntent(metadata?: Record<string, any>): McomPayIntent {
    if (metadata?.intent) return metadata.intent as McomPayIntent;
    switch (metadata?.purpose) {
      case 'MEMBERSHIP':
        return 'SUBSCRIPTION';
      case 'VOUCHER_PURCHASE':
      case 'PAYG_TOPUP':
        return 'PURCHASE';
      default:
        return 'ORDER';
    }
  }

  private assertMcomPayEnabled(): void {
    if (!this.mcomPay.isEnabled()) {
      throw new ServiceUnavailableException(
        'Payments are temporarily unavailable (MCOM Pay is disabled).',
      );
    }
  }

  /**
   * Resolve the buyer's Central Hub identity when we have one.
   *
   * The Partner Guide (B4.1a) makes `mcomUserId` required for wallet payments
   * but optional for card/PayPal, where the ledger records a guest buyer. We
   * always send it when the mall account is SSO-linked so support can trace the
   * payment; a legacy account can still pay by card as a guest.
   */
  private async resolvePayerMcomUserId(
    metadata?: Record<string, any>,
  ): Promise<string | undefined> {
    const explicit = String(
      metadata?.mcomUserId ?? metadata?.centralUserId ?? '',
    ).trim();
    if (explicit) return explicit;

    const mallUserId = String(
      metadata?.userId ?? metadata?.mallUserId ?? '',
    ).trim();
    if (mallUserId) {
      const user = await this.userRepository.findOne({
        where: { id: mallUserId },
        select: ['id', 'centralUserId'],
      });
      const centralUserId = user?.centralUserId?.trim();
      if (centralUserId) return centralUserId;
    }

    return undefined;
  }

  async createStripePaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.PaymentIntent> {
    this.assertMcomPayEnabled();
    const reference = this.paymentReference(metadata, 'stripe', amount);
    const mcomUserId = await this.resolvePayerMcomUserId(metadata);
    const {
      intent: _intent,
      splits: _splits,
      localContext,
      mcomUserId: _mcomUserId,
      centralUserId: _centralUserId,
      ...chargeMetadata
    } = metadata ?? {};
    try {
      const result = await this.mcomPay.createCharge({
        amountMinor: this.mcomPay.toMinorUnits(amount),
        currency,
        method: 'stripe',
        reference,
        description: metadata?.description,
        mcomUserId,
        externalCustomerId: metadata?.userId
          ? String(metadata.userId)
          : undefined,
        metadata: chargeMetadata,
        intent: this.chargeIntent(metadata),
        splits: metadata?.splits as McomPaySplit[] | undefined,
        localContext,
        idempotencyKey: this.paymentIdempotencyKey(metadata, 'stripe', amount),
      });
      const charge = result.charge;

      // Shape-compatible with Stripe.PaymentIntent for existing callers.
      return {
        id: charge.id,
        // The provider handle (Stripe PaymentIntent id) is what the browser
        // sees. Business code that needs a stable MCOM ledger reference should
        // use `chargeId`, not `id`.
        chargeId: charge.id,
        providerRef: charge.providerRef ?? null,
        client_secret: result.clientSecret ?? null,
        // Normalised alias used by the mall's own clients.
        clientSecret: result.clientSecret ?? null,
        amount: Number(charge.amountMinor),
        currency: charge.currency.toLowerCase(),
        status:
          charge.status === 'paid' ? 'succeeded' : 'requires_payment_method',
        metadata,
      } as unknown as Stripe.PaymentIntent;
    } catch (err) {
      throw this.mcomPay.toHttpException(err);
    }
  }

  async createPaypalOrder(
    amount: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    this.assertMcomPayEnabled();
    const reference = this.paymentReference(metadata, 'paypal', amount);
    const mcomUserId = await this.resolvePayerMcomUserId(metadata);
    const {
      intent: _intent,
      splits: _splits,
      localContext,
      mcomUserId: _mcomUserId,
      centralUserId: _centralUserId,
      ...chargeMetadata
    } = metadata ?? {};
    try {
      const result = await this.mcomPay.createCharge({
        amountMinor: this.mcomPay.toMinorUnits(amount),
        currency,
        method: 'paypal',
        reference,
        description: metadata?.description,
        mcomUserId,
        externalCustomerId: metadata?.userId
          ? String(metadata.userId)
          : undefined,
        metadata: chargeMetadata,
        intent: this.chargeIntent(metadata),
        splits: metadata?.splits as McomPaySplit[] | undefined,
        localContext,
        returnUrl: metadata?.returnUrl,
        cancelUrl: metadata?.cancelUrl,
        idempotencyKey: this.paymentIdempotencyKey(metadata, 'paypal', amount),
      });
      const charge = result.charge;

      return {
        // Existing frontend passes this to the PayPal SDK/redirect.
        id: charge.providerRef || charge.id,
        chargeId: charge.id,
        approvalUrl: result.approvalUrl ?? null,
        status: 'CREATED',
        links: result.approvalUrl
          ? [{ rel: 'approve', href: result.approvalUrl }]
          : [],
      };
    } catch (err) {
      throw this.mcomPay.toHttpException(err);
    }
  }

  /**
   * Charge the payer's central MCOM Wallet through MCOM Pay.
   *
   * Wallet charges settle immediately at create time, so callers should only
   * invoke this at the final confirmation step (not while a checkout/booking is
   * still able to fail) and must refund/release on a later failure.
   */
  async createWalletCharge(
    amount: number,
    currency: string,
    metadata: Record<string, any> | undefined,
    mcomUserId: string,
  ): Promise<{ chargeId: string; status: string; amount: number }> {
    this.assertMcomPayEnabled();
    if (!mcomUserId) {
      throw new ServiceUnavailableException(
        'MCOM Wallet is not linked for this account. Please re-authenticate via SSO.',
      );
    }

    const reference = this.paymentReference(metadata, 'wallet', amount);
    const {
      intent: _intent,
      splits: _splits,
      localContext,
      ...chargeMetadata
    } = metadata ?? {};
    try {
      const result = await this.mcomPay.createCharge({
        amountMinor: this.mcomPay.toMinorUnits(amount),
        currency,
        method: 'wallet',
        reference,
        description: metadata?.description,
        mcomUserId,
        externalCustomerId: metadata?.userId
          ? String(metadata.userId)
          : undefined,
        metadata: chargeMetadata,
        intent: this.chargeIntent(metadata),
        splits: metadata?.splits as McomPaySplit[] | undefined,
        localContext,
        idempotencyKey: this.paymentIdempotencyKey(metadata, 'wallet', amount),
      });
      const charge = result.charge;
      return {
        chargeId: charge.id,
        status: charge.status,
        amount: this.mcomPay.fromMinorUnits(charge.amountMinor),
      };
    } catch (err) {
      throw this.mcomPay.toHttpException(err);
    }
  }

  /** Verify a wallet charge created through MCOM Pay. */
  async verifyWalletCharge(
    chargeId: string,
    expectedAmount: number,
    currency: string,
    context?: VerifyChargeContext,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    this.assertMcomPayEnabled();
    if (!chargeId) {
      return { ok: false, reason: 'A wallet payment reference is required' };
    }
    return this.verifyMcomPayCharge(
      chargeId,
      expectedAmount,
      currency,
      'wallet',
      context,
    );
  }

  /**
   * Settle a wallet reference that may be either:
   *  - an MCOM Pay wallet charge (settles at create time), or
   *  - an MCOM Wallet hold created at checkout/booking/membership initiation.
   *
   * Holds are the preferred pre-authorisation primitive: the customer's funds
   * are never debited until the business operation can actually commit, and an
   * abandoned attempt auto-expires instead of stranding money.
   */
  async settleWalletReference(
    reference: string,
    expectedAmount: number,
    currency: string,
    context: VerifyChargeContext & {
      holdId?: string;
      reference?: string;
      intent?: McomPayIntent;
      splits?: McomPaySplit[];
    },
    idempotencyKey?: string,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    if (!reference && !context.holdId) {
      return { ok: false, reason: 'A wallet payment reference is required' };
    }

    const chargeReference = context.holdId || reference;
    const chargeResult = await this.verifyWalletCharge(
      chargeReference,
      expectedAmount,
      currency,
      context,
    );
    if (chargeResult.ok) return chargeResult;

    // The reference is an MCOM Wallet hold. Wallet spends must be recorded in
    // the MCOM Pay ledger (the app fee applies), so release the pre-auth and
    // create a settled wallet charge at confirmation time. The charge key is
    // derived from the hold, making retries replay the same charge.
    if (context.mcomUserId) {
      try {
        await this.mcomWallet.releaseHold({
          holdId: chargeReference,
          reason: 'Converted to MCOM Pay wallet charge',
        });
      } catch {
        // Already released/expired is fine; the charge attempt decides.
      }
      try {
        const charge = await this.createWalletCharge(
          expectedAmount,
          currency.toUpperCase(),
          {
            reference: context.reference || `wallet-${chargeReference}`,
            userId: context.mallUserId,
            idempotencyKey:
              idempotencyKey ||
              this.mcomWallet.buildKey('wallet-pay', chargeReference),
            description: 'MCOM Pay wallet payment',
            intent: context.intent,
            splits: context.splits,
          },
          context.mcomUserId,
        );
        return this.verifyWalletCharge(
          charge.chargeId,
          expectedAmount,
          currency,
          { ...context, reference: undefined },
        );
      } catch (err: any) {
        return {
          ok: false,
          reason:
            err?.message ||
            chargeResult.reason ||
            'Could not create the wallet payment',
        };
      }
    }

    // Legacy fallback: capture the hold through the MCOM Wallet API when no
    // central user id is available.
    try {
      const captured = await this.mcomWallet.captureHold({
        holdId: chargeReference,
        amount: expectedAmount,
        reference: context.reference,
        idempotencyKey:
          idempotencyKey ||
          this.mcomWallet.buildKey('capture', chargeReference),
      });
      return {
        ok: true,
        details: {
          ...captured,
          id: `wallet:${captured.transactionId}`,
          method: 'wallet',
          amountMinor: this.mcomPay.toMinorUnits(expectedAmount),
          currency: currency.toUpperCase(),
          status: 'paid',
        },
      };
    } catch (err: any) {
      return {
        ok: false,
        reason:
          err?.message ||
          chargeResult.reason ||
          'Could not verify the wallet payment',
      };
    }
  }

  /** Create a wallet hold for a flow that will capture it on confirmation. */
  async createWalletHold(input: {
    mcomUserId: string;
    amount: number;
    reference: string;
    idempotencyKey: string;
    ttlHours?: number;
    metadata?: Record<string, any>;
  }): Promise<{ holdId: string; amount: number; expiresAt?: string }> {
    try {
      const hold = await this.mcomWallet.placeHold({
        userId: input.mcomUserId,
        amount: input.amount,
        reference: input.reference,
        ttlHours: input.ttlHours,
        metadata: input.metadata,
        idempotencyKey: input.idempotencyKey,
      });
      return {
        holdId: hold.holdId,
        amount: Number(hold.amount),
        expiresAt: hold.expiresAt,
      };
    } catch (err) {
      throw this.mcomWallet.toHttpException(err);
    }
  }

  async releaseWalletHold(holdId: string, reason?: string): Promise<void> {
    try {
      await this.mcomWallet.releaseHold({ holdId, reason });
    } catch (err) {
      throw this.mcomWallet.toHttpException(err);
    }
  }

  buildWalletKey(...parts: Array<string | number>): string {
    return this.mcomWallet.buildKey(...parts);
  }

  /** Load a charge from MCOM Pay's ledger. */
  async getMcomCharge(chargeId: string) {
    return this.mcomPay.getCharge(chargeId);
  }

  async allocateCharge(
    input: Parameters<McomPayService['allocate']>[0],
    manager?: any,
  ) {
    return this.mcomPay.allocate(input, manager);
  }

  fromMinorUnits(amountMinor: string | number): number {
    return this.mcomPay.fromMinorUnits(amountMinor);
  }

  toMinorUnits(amount: number): string {
    return this.mcomPay.toMinorUnits(amount);
  }

  async capturePaypalOrder(
    orderId: string,
    context?: VerifyChargeContext,
  ): Promise<any> {
    this.assertMcomPayEnabled();
    const chargeId = await this.mcomPay.resolveChargeId(orderId);
    if (!chargeId) {
      throw new Error(`No MCOM Pay charge found for PayPal order ${orderId}`);
    }
    const result = await this.mcomPay.confirmCharge(chargeId, { orderId });
    if (context?.mallUserId && result.charge.externalCustomerId) {
      if (String(result.charge.externalCustomerId) !== context.mallUserId) {
        throw new ServiceUnavailableException(
          'This payment belongs to a different customer.',
        );
      }
    }
    return result.charge;
  }

  async verifyStripePaymentIntent(
    intentId: string,
    expectedAmount: number,
    currency: string,
    context?: VerifyChargeContext,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    this.assertMcomPayEnabled();
    const chargeId = await this.mcomPay.resolveChargeId(intentId);
    if (!chargeId) {
      return {
        ok: false,
        reason: 'No MCOM Pay charge found for this payment',
      };
    }
    return this.verifyMcomPayCharge(
      chargeId,
      expectedAmount,
      currency,
      'stripe',
      { ...context, providerHandle: intentId },
    );
  }

  async captureAndVerifyPaypalOrder(
    orderId: string,
    expectedAmount: number,
    currency: string,
    context?: VerifyChargeContext,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    this.assertMcomPayEnabled();
    const chargeId = await this.mcomPay.resolveChargeId(orderId);
    if (!chargeId) {
      return {
        ok: false,
        reason: 'No MCOM Pay charge found for this PayPal payment',
      };
    }
    return this.verifyMcomPayCharge(
      chargeId,
      expectedAmount,
      currency,
      'paypal',
      { ...context, providerHandle: orderId },
    );
  }

  private async verifyMcomPayCharge(
    chargeId: string,
    expectedAmount: number,
    currency: string,
    method: 'stripe' | 'paypal' | 'wallet',
    context?: VerifyChargeContext,
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    return this.mcomPay.verifySettledCharge(
      chargeId,
      expectedAmount,
      currency,
      method,
      { ...context, method },
    );
  }

  /** Build a stable business reference for an MCOM Pay charge. */
  private paymentReference(
    metadata: Record<string, any> | undefined,
    method: string,
    amount: number,
  ): string {
    const base =
      metadata?.reference ||
      metadata?.orderId ||
      metadata?.bookingId ||
      metadata?.purchaseReference ||
      metadata?.planVariantId ||
      metadata?.tierId ||
      metadata?.userId;
    return `${base ? `${base}-` : ''}${method}-${amount.toFixed(2)}`.slice(
      0,
      190,
    );
  }

  /**
   * Idempotency key scoped to the business event and amount.
   *
   * A product/user reference alone is not unique (it would replay an old paid
   * charge on the next purchase), so callers must provide a per-attempt key or
   * a stable order/booking/purchase reference. We never silently fall back to a
   * random UUID because that makes retries create a second charge.
   */
  private paymentIdempotencyKey(
    metadata: Record<string, any> | undefined,
    method: string,
    amount: number,
  ): string {
    const base =
      metadata?.idempotencyKey ||
      metadata?.orderId ||
      metadata?.bookingId ||
      metadata?.purchaseReference ||
      metadata?.entityId;
    if (!base) {
      throw new HttpException(
        {
          error: 'IDEMPOTENCY_KEY_REQUIRED',
          message:
            'A business idempotency key is required to create a payment.',
        },
        400,
      );
    }
    return this.mcomPay.buildKey('pay', method, base, amount.toFixed(2));
  }

  /**
   * Business payouts (outbound). These are not customer payments and are not
   * part of MCOM Pay's charge API, but keeping them in one place makes the
   * separation explicit.
   */
  async createStripeTransfer(
    amount: number,
    currency: string,
    destinationAccountId: string,
    metadata?: Record<string, any>,
  ): Promise<Stripe.Transfer> {
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Stripe transfers are not configured.',
      );
    }
    return this.stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency,
      destination: destinationAccountId,
      metadata,
    });
  }

  async refundStripePayment(
    paymentIntentId: string,
    amount?: number,
    reason = 'MCOM Mall refund',
  ): Promise<any> {
    this.assertMcomPayEnabled();
    const chargeId = await this.mcomPay.resolveChargeId(paymentIntentId);
    if (!chargeId) {
      throw new ServiceUnavailableException(
        `No MCOM Pay charge found for refund reference ${paymentIntentId}`,
      );
    }
    return this.mcomPay.refundCharge(
      chargeId,
      amount ? this.mcomPay.toMinorUnits(amount) : undefined,
      reason,
    );
  }

  async createPaypalPayout(
    amount: number,
    currency: string,
    receiverEmail: string,
  ): Promise<PaypalPayoutBatch> {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'PayPal Payouts is not configured. PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set.',
      );
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: randomUUID(),
          email_subject: 'You have a payout from Mcom Mall',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: { value: amount.toFixed(2), currency },
            receiver: receiverEmail,
            note: 'Thank you for your business with Mcom Mall',
          },
        ],
      }),
    });

    const payload: unknown = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `PayPal payout failed (${response.status}): ${
          JSON.stringify(payload) || response.statusText
        }`,
      );
    }

    if (!isPaypalPayoutBatch(payload)) {
      throw new ServiceUnavailableException(
        'PayPal payout response is missing payout_batch_id.',
      );
    }

    return payload;
  }

  async refundPaypalOrder(
    captureId: string,
    amount?: number,
    _currency = 'GBP',
  ): Promise<any> {
    this.assertMcomPayEnabled();
    const chargeId = await this.mcomPay.resolveChargeId(captureId);
    if (!chargeId) {
      throw new ServiceUnavailableException(
        `No MCOM Pay charge found for refund reference ${captureId}`,
      );
    }
    return this.mcomPay.refundCharge(
      chargeId,
      amount ? this.mcomPay.toMinorUnits(amount) : undefined,
      'MCOM Mall refund',
    );
  }
}
