import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { EntityManager, Repository } from 'typeorm';
import { McomPayCharge } from '../entities/mcom-pay-charge.entity';
import { PaymentAllocation } from '../entities/payment-allocation.entity';
import { McomPayWebhookEvent } from '../entities/mcom-pay-webhook-event.entity';

export type McomPayMethod = 'stripe' | 'paypal' | 'wallet';

export interface McomPayChargeDto {
  id: string;
  appClientId?: string;
  amountMinor: string;
  currency: string;
  feeMinor?: string | null;
  netMinor?: string | null;
  refundedMinor?: string | null;
  method: McomPayMethod;
  status: string;
  reference?: string | null;
  description?: string | null;
  mcomUserId?: string | null;
  externalCustomerId?: string | null;
  provider?: string | null;
  providerRef?: string | null;
  walletDebitAmount?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface CreateMcomPayChargeInput {
  amountMinor: string;
  currency?: string;
  method: McomPayMethod;
  reference: string;
  description?: string;
  mcomUserId?: string;
  externalCustomerId?: string;
  metadata?: Record<string, any>;
  /** PayPal return/cancel URLs supplied by the mall purchase page. */
  returnUrl?: string;
  cancelUrl?: string;
  idempotencyKey: string;
}

export interface CreateMcomPayChargeResult {
  charge: McomPayChargeDto;
  clientSecret?: string | null;
  approvalUrl?: string | null;
}

export interface VerifyChargeContext {
  /** Mall user id (matches charge.externalCustomerId when present). */
  mallUserId?: string;
  /** Central MCOM user id (matches charge.mcomUserId when present). */
  mcomUserId?: string;
  /** Business reference prefix (e.g. `mall-order-<id>`). */
  reference?: string;
  /** Expected method — stops a Stripe charge being redeemed as a wallet sale. */
  method?: McomPayMethod;
  /** Provider handle supplied by the caller (Stripe PI / PayPal order id). */
  providerHandle?: string;
}

export interface AllocateChargeInput {
  mcomChargeId: string;
  purpose: string;
  entityType: string;
  entityId: string;
  userId: string;
  amountMinor: string;
  currency: string;
}

export class McomPayError extends Error {
  constructor(
    public code: string,
    message: string,
    public httpStatus: number,
  ) {
    super(message);
    this.name = 'McomPayError';
  }
}

const TRANSIENT_STATUSES = [409, 429, 500, 503];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isUniqueViolation(err: any): boolean {
  return (
    err?.code === '23505' ||
    err?.driverError?.code === '23505' ||
    /duplicate key/i.test(String(err?.message || ''))
  );
}

/**
 * Partner client for MCOM Pay (Central Hub `/api/v1/app-payments`).
 *
 * MCOM Pay is the single payment gateway for the mall: card (Stripe), PayPal
 * and MCOM Wallet are all created and confirmed by MCOM Central, which owns the
 * provider credentials and the immutable ledger. The mall never talks to
 * Stripe/PayPal with its own secret keys.
 *
 * Auth is HMAC-SHA256 (`X-Mcom-Client-ID` + `X-Mcom-Signature`) with the
 * app-scoped `MCOM_HMAC_SECRET`; writes also send `X-Idempotency-Key`.
 */
@Injectable()
export class McomPayService {
  private readonly logger = new Logger(McomPayService.name);
  private readonly base: string;
  private readonly clientId: string;
  private readonly hmacSecret: string;
  private readonly webhookSecret: string;
  private readonly enabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(McomPayCharge)
    private readonly chargeRepository: Repository<McomPayCharge>,
    @InjectRepository(PaymentAllocation)
    private readonly allocationRepository: Repository<PaymentAllocation>,
    @InjectRepository(McomPayWebhookEvent)
    private readonly webhookEventRepository: Repository<McomPayWebhookEvent>,
  ) {
    const solutionsUrl =
      this.configService.get<string>('MCOM_SOLUTIONS_URL') ||
      this.configService.get<string>('MCOM_SOLUTIONS_BACKEND_URL') ||
      this.configService.get<string>('MCOM_CENTRAL_URL') ||
      'http://localhost:3010';
    this.base = `${solutionsUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')}/api/v1/app-payments`;

    this.clientId =
      this.configService.get<string>('MCOM_CLIENT_ID') ||
      this.configService.get<string>('SSO_CLIENT_ID') ||
      'mcom-mall';

    // Per-app secret first, then MCOM_<CLIENT>_SECRET, then shared SSO secret.
    const normalized = this.clientId.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    this.hmacSecret =
      this.configService.get<string>('MCOM_HMAC_SECRET') ||
      this.configService.get<string>(`MCOM_${normalized}_SECRET`) ||
      this.configService.get<string>('SSO_API_SECRET') ||
      '';
    this.webhookSecret =
      this.configService.get<string>('MCOM_WEBHOOK_SECRET') ||
      this.configService.get<string>('MCOM_SOLUTIONS_WEBHOOK_SECRET') ||
      '';

    this.enabled =
      (
        this.configService.get<string>('MCOM_PAY_ENABLED') || 'true'
      ).toLowerCase() !== 'false';

    if (!this.hmacSecret) {
      this.logger.warn(
        'MCOM Pay HMAC secret is not configured (MCOM_HMAC_SECRET). Charges will fail with INVALID_SIGNATURE.',
      );
    }
    if (!this.webhookSecret) {
      this.logger.warn(
        'MCOM Pay webhook secret is not configured (MCOM_WEBHOOK_SECRET). Webhooks will be rejected.',
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toMinorUnits(amount: number | string): string {
    const minor = Math.round(Number(amount) * 100);
    if (!Number.isFinite(minor) || minor <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }
    return String(minor);
  }

  fromMinorUnits(amountMinor: string | number | bigint): number {
    return Number(amountMinor) / 100;
  }

  buildKey(...parts: Array<string | number>): string {
    return `${this.clientId}-${parts.join('-')}`
      .slice(0, 255)
      .replace(/[^\x20-\x7E]/g, '');
  }

  private sign(body: unknown): string {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    return (
      'sha256=' +
      crypto.createHmac('sha256', this.hmacSecret).update(raw).digest('hex')
    );
  }

  private headers(body: unknown, idempotencyKey?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Mcom-Client-ID': this.clientId,
      'X-Mcom-Signature': this.sign(body),
    };
    if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
    return headers;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    idempotencyKey?: string,
    maxRetries = 3,
  ): Promise<T> {
    const url = `${this.base}${path}`;
    const payload = body === undefined ? '' : body;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let res: Response;
      try {
        res = await fetch(url, {
          method,
          headers: this.headers(payload, idempotencyKey),
          ...(method === 'GET' ? {} : { body: JSON.stringify(payload) }),
        });
      } catch (err: any) {
        if (attempt === maxRetries) {
          throw new McomPayError(
            'SERVICE_UNAVAILABLE',
            `MCOM Pay unreachable: ${err?.message || err}`,
            503,
          );
        }
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      if (res.ok) return (await res.json()) as T;

      const errBody: any = await res.json().catch(async () => ({
        error: 'UNKNOWN',
        message: await res.text().catch(() => res.statusText),
      }));
      const code = errBody?.error || 'ERROR';
      const message = errBody?.message || `MCOM Pay request failed (${res.status})`;

      if (TRANSIENT_STATUSES.includes(res.status) && attempt < maxRetries) {
        this.logger.warn(
          `MCOM Pay ${method} ${path} transient ${res.status} (attempt ${attempt}/${maxRetries}); retrying.`,
        );
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      if (code === 'INSUFFICIENT_BALANCE' || res.status === 422) {
        throw new McomPayError('INSUFFICIENT_BALANCE', message, 422);
      }
      throw new McomPayError(code, message, res.status);
    }

    throw new McomPayError('INTERNAL_ERROR', 'MCOM Pay request failed', 500);
  }

  async createCharge(
    input: CreateMcomPayChargeInput,
  ): Promise<CreateMcomPayChargeResult> {
    this.assertEnabled();
    if (!input.idempotencyKey) {
      throw new BadRequestException('An idempotency key is required.');
    }

    const body = {
      amountMinor: input.amountMinor,
      currency: (input.currency || 'GBP').toUpperCase(),
      method: input.method,
      reference: input.reference,
      description: input.description,
      mcomUserId: input.mcomUserId,
      externalCustomerId: input.externalCustomerId,
      metadata: input.metadata,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    };

    const result = await this.request<CreateMcomPayChargeResult>(
      'POST',
      '/charges',
      body,
      input.idempotencyKey,
    );

    const charge = (result as any)?.charge ?? (result as any);
    await this.recordCharge(charge);
    return { ...result, charge } as CreateMcomPayChargeResult;
  }

  async confirmCharge(
    chargeId: string,
    handle: { paymentIntentId?: string; orderId?: string },
  ): Promise<{ charge: McomPayChargeDto; replayed?: boolean }> {
    this.assertEnabled();
    const raw = await this.request<any>(
      'POST',
      `/charges/${encodeURIComponent(chargeId)}/confirm`,
      handle,
    );
    const charge = raw?.charge ?? raw;
    await this.recordCharge(charge);
    return { charge, replayed: raw?.replayed };
  }

  async getCharge(chargeId: string): Promise<McomPayChargeDto> {
    this.assertEnabled();
    const raw = await this.request<any>(
      'GET',
      `/charges/${encodeURIComponent(chargeId)}`,
    );
    const charge = raw?.charge ?? raw;
    if (!charge?.id) {
      throw new McomPayError(
        'INVALID_RESPONSE',
        'MCOM Pay returned an invalid charge payload.',
        502,
      );
    }
    await this.recordCharge(charge);
    return charge;
  }

  async refundCharge(
    chargeId: string,
    amountMinor?: string,
    reason?: string,
    idempotencyKey?: string,
  ): Promise<McomPayChargeDto> {
    this.assertEnabled();
    const key =
      idempotencyKey ||
      this.buildKey('refund', chargeId, amountMinor || 'full');
    const raw = await this.request<any>(
      'POST',
      `/charges/${encodeURIComponent(chargeId)}/refund`,
      { ...(amountMinor ? { amountMinor } : {}), ...(reason ? { reason } : {}) },
      key,
    );
    const charge = raw?.charge ?? raw;
    await this.recordCharge(charge);
    return charge;
  }

  /**
   * Resolve an MCOM charge id from either the charge id or a provider handle.
   * Every provider handle must already exist in the local mirror — we refuse to
   * guess, because guessing lets an arbitrary string be treated as a charge id.
   */
  async resolveChargeId(value: string): Promise<string | null> {
    if (!value) return null;
    const local = await this.chargeRepository.findOne({
      where: [{ chargeId: value }, { providerRef: value }],
    });
    if (local) return local.chargeId;
    // Central charge ids are cuids beginning with `c`; reject known provider
    // prefixes (`pi_`, `ch_`, `cus_`, `seti_`, `BA-…`) explicitly.
    if (/^pi_|^ch_|^cus_|^seti_|^ba-|^[A-Z0-9]{15,}$/i.test(value)) return null;
    return /^c[a-z0-9]{20,}$/i.test(value) ? value : null;
  }

  async getLocalCharge(chargeId: string): Promise<McomPayCharge | null> {
    return this.chargeRepository.findOne({ where: { chargeId } });
  }

  async updateLocalStatus(chargeId: string, status: string): Promise<void> {
    await this.chargeRepository.update({ chargeId }, { status });
  }

  /**
   * Confirm (when needed) and verify a Central charge before releasing value.
   *
   * This is the single verification choke point. Besides status/amount/currency
   * it binds the charge to the caller and business reference, and checks the
   * payment method so a Stripe charge cannot be redeemed as a wallet purchase.
   */
  async verifySettledCharge(
    chargeId: string,
    expectedAmount: number,
    currency: string,
    method: McomPayMethod,
    context: VerifyChargeContext = {},
  ): Promise<{ ok: boolean; details?: any; reason?: string }> {
    let charge: McomPayChargeDto;
    try {
      charge = await this.getCharge(chargeId);
    } catch (err: any) {
      return {
        ok: false,
        reason: err?.message || 'Could not load the MCOM Pay charge',
      };
    }

    if (charge.status !== 'paid') {
      if (method === 'wallet') {
        return {
          ok: false,
          details: charge,
          reason: `MCOM Wallet charge status ${charge.status}`,
        };
      }
      const providerHandle = charge.providerRef || context.providerHandle;
      const handle =
        method === 'stripe'
          ? { paymentIntentId: providerHandle ?? undefined }
          : { orderId: providerHandle ?? undefined };
      try {
        const confirmed = await this.confirmCharge(chargeId, handle);
        charge = confirmed.charge;
      } catch (err: any) {
        return {
          ok: false,
          details: charge,
          reason: err?.message || 'MCOM Pay could not confirm the payment',
        };
      }
    }

    if (charge.status !== 'paid') {
      return {
        ok: false,
        details: charge,
        reason: `MCOM Pay charge status ${charge.status}`,
      };
    }

    const expectedMinor = BigInt(Math.round(expectedAmount * 100));
    const actualMinor = BigInt(charge.amountMinor);
    if (actualMinor !== expectedMinor) {
      return {
        ok: false,
        details: charge,
        reason: `Amount mismatch: expected ${expectedMinor} minor units, received ${actualMinor}`,
      };
    }
    if (charge.currency.toLowerCase() !== currency.toLowerCase()) {
      return {
        ok: false,
        details: charge,
        reason: `Currency mismatch: expected ${currency}, received ${charge.currency}`,
      };
    }
    if (charge.method && charge.method !== method) {
      return {
        ok: false,
        details: charge,
        reason: `Payment method mismatch: expected ${method}, received ${charge.method}`,
      };
    }

    // Ownership / business binding. Only enforced when Central returned the
    // field, so legacy charges created before this change still verify — but
    // every new charge includes externalCustomerId and reference.
    if (
      context.mallUserId &&
      charge.externalCustomerId &&
      String(charge.externalCustomerId) !== String(context.mallUserId)
    ) {
      return {
        ok: false,
        details: charge,
        reason: 'Charge belongs to a different customer',
      };
    }
    if (
      context.mcomUserId &&
      charge.mcomUserId &&
      String(charge.mcomUserId) !== String(context.mcomUserId)
    ) {
      return {
        ok: false,
        details: charge,
        reason: 'Charge belongs to a different MCOM wallet',
      };
    }
    if (context.reference && charge.reference) {
      // Legacy booking charges were created before the `booking-` prefix was
      // added to the charge metadata, so they start with the raw booking id.
      const expectedReference = String(context.reference);
      const legacyReference = expectedReference.replace(/^booking-/, '');
      const matches =
        charge.reference.startsWith(expectedReference) ||
        (legacyReference !== expectedReference &&
          charge.reference.startsWith(legacyReference));
      if (!matches) {
        return {
          ok: false,
          details: charge,
          reason: 'Charge does not match this business reference',
        };
      }
    }

    return { ok: true, details: charge };
  }

  /**
   * Atomically allocate a settled charge to one business event.
   *
   * Repeating the same allocation (e.g. a retry after the response was lost)
   * is idempotent. Reusing a charge for a different entity throws 409.
   */
  async allocate(
    input: AllocateChargeInput,
    manager?: EntityManager,
  ): Promise<PaymentAllocation> {
    const repo = manager
      ? manager.getRepository(PaymentAllocation)
      : this.allocationRepository;

    const existing = await repo.findOne({
      where: { mcomChargeId: input.mcomChargeId },
    });
    if (existing) {
      if (
        existing.purpose === input.purpose &&
        existing.entityType === input.entityType &&
        existing.entityId === input.entityId
      ) {
        return existing;
      }
      throw new McomPayError(
        'CHARGE_ALREADY_USED',
        'This payment has already been used for another purchase.',
        409,
      );
    }

    const sameEntity = await repo.findOne({
      where: {
        purpose: input.purpose,
        entityType: input.entityType,
        entityId: input.entityId,
      },
    });
    if (sameEntity) {
      if (sameEntity.mcomChargeId === input.mcomChargeId) return sameEntity;
      throw new McomPayError(
        'PAYMENT_ALREADY_RECORDED',
        'This purchase already has a different payment recorded.',
        409,
      );
    }

    try {
      return await repo.save(repo.create(input));
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        const replay = await repo.findOne({
          where: { mcomChargeId: input.mcomChargeId },
        });
        if (
          replay &&
          replay.purpose === input.purpose &&
          replay.entityType === input.entityType &&
          replay.entityId === input.entityId
        ) {
          return replay;
        }
        throw new McomPayError(
          'CHARGE_ALREADY_USED',
          'This payment has already been used for another purchase.',
          409,
        );
      }
      throw err;
    }
  }

  async getAllocation(
    mcomChargeId: string,
  ): Promise<PaymentAllocation | null> {
    return this.allocationRepository.findOne({ where: { mcomChargeId } });
  }

  /** Persist a webhook delivery exactly once. */
  async recordWebhookEvent(input: {
    event: string;
    chargeId?: string | null;
    payload: Record<string, any>;
    rawBody: string;
  }): Promise<{ duplicate: boolean; record: McomPayWebhookEvent }> {
    const rawHash = crypto
      .createHash('sha256')
      .update(input.rawBody)
      .digest('hex');
    const existing = await this.webhookEventRepository.findOne({
      where: { rawHash },
    });
    if (existing) return { duplicate: true, record: existing };

    try {
      const record = await this.webhookEventRepository.save(
        this.webhookEventRepository.create({
          event: input.event,
          chargeId: input.chargeId ?? null,
          payload: input.payload,
          rawHash,
          signatureVerified: true,
          attempts: 1,
        }),
      );
      return { duplicate: false, record };
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        const replay = await this.webhookEventRepository.findOne({
          where: { rawHash },
        });
        if (replay) return { duplicate: true, record: replay };
      }
      throw err;
    }
  }

  async markWebhookProcessed(id: string, error?: unknown): Promise<void> {
    await this.webhookEventRepository.update(
      { id },
      error
        ? {
            lastError:
              error instanceof Error ? error.message : String(error),
            attempts: () => '"attempts" + 1',
          }
        : { processedAt: new Date(), lastError: null },
    );
  }

  /** Upsert a charge delivered by webhook (which has no local row yet). */
  async upsertFromWebhook(
    chargeId: string,
    data: Record<string, any>,
  ): Promise<void> {
    if (!chargeId) return;
    const existing = await this.chargeRepository.findOne({
      where: { chargeId },
    });
    const status = String(data.status || 'paid');
    const amountMinor = String(data.amountMinor ?? '0');
    const isRefunded = status === 'refunded' || data.event === 'payment.refunded';
    const updates: Partial<McomPayCharge> = {
      status,
      amountMinor,
      currency: String(data.currency || 'GBP').toUpperCase(),
      reference: data.reference ?? null,
      mcomUserId: data.mcomUserId ?? null,
      externalCustomerId: data.externalCustomerId ?? null,
      provider: data.provider ?? null,
      providerRef: data.providerRef ?? null,
      feeMinor: data.feeMinor != null ? String(data.feeMinor) : null,
      netMinor: data.netMinor != null ? String(data.netMinor) : null,
      paidAt: data.paidAt ? new Date(data.paidAt) : existing?.paidAt ?? null,
      ...(isRefunded
        ? { refundedMinor: String(data.refundedMinor ?? amountMinor) }
        : {}),
    };
    if (existing) {
      await this.chargeRepository.update({ id: existing.id }, updates);
    } else {
      await this.chargeRepository.save(
        this.chargeRepository.create({
          chargeId,
          method: String(data.method || 'unknown'),
          ...updates,
        }),
      );
    }
  }

  verifyWebhookSignature(rawBody: string, signature?: string): boolean {
    if (!this.webhookSecret || !signature) return false;
    const expected =
      'sha256=' +
      crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  toHttpException(err: unknown): HttpException {
    if (err instanceof McomPayError) {
      if (err.code === 'INSUFFICIENT_BALANCE') {
        return new HttpException(
          {
            error: 'WALLET_INSUFFICIENT_FUNDS',
            message: 'Top up your MCOM Wallet to continue.',
            topUpUrl: this.configService.get<string>(
              'MCOM_SOLUTIONS_FRONTEND_URL',
            )
              ? `${this.configService
                  .get<string>('MCOM_SOLUTIONS_FRONTEND_URL')!
                  .replace(/\/$/, '')}/dashboard/wallet`
              : 'http://localhost:3000/dashboard/wallet',
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      const status = TRANSIENT_STATUSES.includes(err.httpStatus)
        ? HttpStatus.BAD_GATEWAY
        : err.httpStatus;
      return new HttpException(
        { error: err.code, message: err.message },
        status,
      );
    }
    if (err instanceof HttpException) return err;
    return new ServiceUnavailableException(
      err instanceof Error ? err.message : 'MCOM Pay request failed',
    );
  }

  private assertEnabled(): void {
    if (!this.enabled) {
      throw new ServiceUnavailableException(
        'MCOM Pay is disabled (MCOM_PAY_ENABLED=false). The mall has no direct provider fallback.',
      );
    }
  }

  private async recordCharge(charge: McomPayChargeDto): Promise<void> {
    if (!charge?.id) return;
    try {
      const existing = await this.chargeRepository.findOne({
        where: { chargeId: charge.id },
      });
      const data: Partial<McomPayCharge> = {
        chargeId: charge.id,
        appClientId: charge.appClientId ?? null,
        providerRef: charge.providerRef ?? null,
        method: charge.method,
        amountMinor: String(charge.amountMinor),
        feeMinor: charge.feeMinor != null ? String(charge.feeMinor) : null,
        netMinor: charge.netMinor != null ? String(charge.netMinor) : null,
        refundedMinor:
          charge.refundedMinor != null
            ? String(charge.refundedMinor)
            : existing?.refundedMinor ?? '0',
        currency: charge.currency,
        reference: charge.reference ?? null,
        description: charge.description ?? null,
        mcomUserId: charge.mcomUserId ?? null,
        externalCustomerId: charge.externalCustomerId ?? null,
        provider: charge.provider ?? null,
        walletDebitAmount:
          charge.walletDebitAmount != null
            ? String(charge.walletDebitAmount)
            : null,
        paidAt: charge.paidAt
          ? new Date(charge.paidAt)
          : existing?.paidAt ??
            (charge.status === 'paid' ? new Date() : null),
        status: charge.status,
        metadata: charge as any,
      };

      if (existing) {
        await this.chargeRepository.update({ id: existing.id }, data);
      } else {
        await this.chargeRepository.save(this.chargeRepository.create(data));
      }
    } catch (err: any) {
      // A payment must not fail because local bookkeeping failed, but this is
      // an alertable condition: the mirror can be repaired by the reconciler.
      this.logger.error(
        `Could not persist MCOM Pay charge ${charge.id}: ${err?.message || err}`,
      );
    }
  }
}
