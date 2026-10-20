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
import { Repository } from 'typeorm';
import {
  McomPayCharge,
} from '../entities/mcom-pay-charge.entity';

export type McomPayMethod = 'stripe' | 'paypal' | 'wallet';

export interface McomPayChargeDto {
  id: string;
  appClientId: string;
  amountMinor: string;
  currency: string;
  feeMinor: string;
  netMinor: string;
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
  idempotencyKey: string;
}

export interface CreateMcomPayChargeResult {
  charge: McomPayChargeDto;
  clientSecret?: string | null;
  approvalUrl?: string | null;
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
    this.hmacSecret =
      this.configService.get<string>('MCOM_HMAC_SECRET') ||
      this.configService.get<string>('SSO_API_SECRET') ||
      '';
    this.webhookSecret =
      this.configService.get<string>('MCOM_WEBHOOK_SECRET') || '';

    this.enabled =
      (
        this.configService.get<string>('MCOM_PAY_ENABLED') || 'true'
      ).toLowerCase() !== 'false';

    if (!this.hmacSecret) {
      this.logger.warn(
        'MCOM Pay HMAC secret is not configured (MCOM_HMAC_SECRET). Charges will fail with INVALID_SIGNATURE.',
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
    };

    const result = await this.request<CreateMcomPayChargeResult>(
      'POST',
      '/charges',
      body,
      input.idempotencyKey,
    );

    await this.recordCharge(result.charge);
    return result;
  }

  async confirmCharge(
    chargeId: string,
    handle: { paymentIntentId?: string; orderId?: string },
  ): Promise<{ charge: McomPayChargeDto; replayed?: boolean }> {
    this.assertEnabled();
    const result = await this.request<{
      charge: McomPayChargeDto;
      replayed?: boolean;
    }>('POST', `/charges/${encodeURIComponent(chargeId)}/confirm`, handle);
    await this.recordCharge(result.charge);
    return result;
  }

  async getCharge(chargeId: string): Promise<McomPayChargeDto> {
    this.assertEnabled();
    const charge = await this.request<McomPayChargeDto>(
      'GET',
      `/charges/${encodeURIComponent(chargeId)}`,
    );
    await this.recordCharge(charge);
    return charge;
  }

  async refundCharge(
    chargeId: string,
    amountMinor?: string,
    reason?: string,
  ): Promise<McomPayChargeDto> {
    this.assertEnabled();
    const charge = await this.request<McomPayChargeDto>(
      'POST',
      `/charges/${encodeURIComponent(chargeId)}/refund`,
      { ...(amountMinor ? { amountMinor } : {}), ...(reason ? { reason } : {}) },
    );
    await this.recordCharge(charge);
    return charge;
  }

  /** Resolve an MCOM charge id from either the charge id or provider ref. */
  async resolveChargeId(value: string): Promise<string | null> {
    if (!value) return null;
    const local = await this.chargeRepository.findOne({
      where: [{ chargeId: value }, { providerRef: value }],
    });
    if (local) return local.chargeId;
    return value.startsWith('c') ? value : null;
  }

  async getLocalCharge(chargeId: string): Promise<McomPayCharge | null> {
    return this.chargeRepository.findOne({ where: { chargeId } });
  }

  async updateLocalStatus(chargeId: string, status: string): Promise<void> {
    await this.chargeRepository.update({ chargeId }, { status });
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
        'MCOM Pay is disabled (MCOM_PAY_ENABLED=false).',
      );
    }
  }

  private async recordCharge(charge: McomPayChargeDto): Promise<void> {
    if (!charge?.id) return;
    try {
      const existing = await this.chargeRepository.findOne({
        where: { chargeId: charge.id },
      });
      const data = {
        chargeId: charge.id,
        providerRef: charge.providerRef ?? null,
        method: charge.method,
        amountMinor: String(charge.amountMinor),
        currency: charge.currency,
        reference: charge.reference ?? null,
        status: charge.status,
        metadata: charge as any,
      };

      if (existing) {
        await this.chargeRepository.update({ id: existing.id }, data);
      } else {
        await this.chargeRepository.save(this.chargeRepository.create(data));
      }
    } catch (err: any) {
      // Never fail a payment because local bookkeeping failed.
      this.logger.warn(
        `Could not persist MCOM Pay charge ${charge.id}: ${err?.message || err}`,
      );
    }
  }
}
