import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export class McomWalletError extends Error {
  constructor(
    public code: string,
    message: string,
    public httpStatus: number,
  ) {
    super(message);
    this.name = 'McomWalletError';
  }
}

export type WalletDebitCategory = 'SUBSCRIPTION' | 'PURCHASE' | 'SERVICE_FEE';
export type WalletCreditCategory =
  | 'REWARD'
  | 'REFUND'
  | 'ADMIN_CREDIT'
  | 'TRANSFER_IN';

export interface WalletDebitInput {
  userId: string; // MCOM Solutions (central) userId
  amount: number;
  category: WalletDebitCategory | string;
  description: string;
  reference?: string;
  metadata?: Record<string, any>;
  idempotencyKey: string;
}

export interface WalletCreditInput {
  userId: string;
  amount: number;
  category: WalletCreditCategory | string;
  description: string;
  reference?: string;
  metadata?: Record<string, any>;
  idempotencyKey: string;
}

const TRANSIENT_STATUSES = [409, 429, 500, 503];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Partner client for the centralized MCOM Wallet (MCOM Solutions).
 * Docs: MCOM Wallet — Partner Integration Guide.
 * Base: {MCOM_SOLUTIONS_URL}/api/v1/wallet/partner
 * Auth: X-Mcom-Client-ID + X-Mcom-Signature (HMAC-SHA256 of exact JSON body,
 *   empty string for GET) + X-Idempotency-Key on writes.
 */
@Injectable()
export class McomWalletService {
  private readonly logger = new Logger(McomWalletService.name);
  private readonly base: string;
  private readonly clientId: string;
  private readonly hmacSecret: string;
  readonly enabled: boolean;
  readonly topUpUrl: string;

  constructor(private readonly configService: ConfigService) {
    const solutionsUrl =
      this.configService.get<string>('MCOM_SOLUTIONS_URL') ||
      this.configService.get<string>('MCOM_SOLUTIONS_BACKEND_URL') ||
      this.configService.get<string>('MCOM_CENTRAL_URL') ||
      'http://localhost:3010';
    // MCOM_CENTRAL_URL may already include /api/v1 — normalize to origin.
    this.base = `${solutionsUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')}/api/v1/wallet/partner`;

    const clientId =
      this.configService.get<string>('MCOM_CLIENT_ID') ||
      this.configService.get<string>('SSO_CLIENT_ID') ||
      'mcom-mall';
    this.clientId = clientId;

    // Per-app secret first, then MCOM_<CLIENT>_SECRET, then shared SSO_API_SECRET.
    const normalized = clientId.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    this.hmacSecret =
      this.configService.get<string>('MCOM_HMAC_SECRET') ||
      this.configService.get<string>(`MCOM_${normalized}_SECRET`) ||
      this.configService.get<string>('SSO_API_SECRET') ||
      '';

    this.enabled =
      (
        this.configService.get<string>('MCOM_WALLET_ENABLED') || 'true'
      ).toLowerCase() !== 'false';

    const frontend =
      this.configService.get<string>('MCOM_SOLUTIONS_FRONTEND_URL') ||
      'http://localhost:3000';
    this.topUpUrl = `${frontend.replace(/\/$/, '')}/dashboard/wallet`;

    if (!this.hmacSecret) {
      this.logger.warn(
        'MCOM wallet HMAC secret is not configured (MCOM_HMAC_SECRET). Wallet calls will fail with INVALID_SIGNATURE.',
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getTopUpUrl(): string {
    return this.topUpUrl;
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
        // Network failure — transient, retry with same key.
        if (attempt === maxRetries) {
          throw new McomWalletError(
            'SERVICE_UNAVAILABLE',
            `MCOM Wallet unreachable: ${err?.message || err}`,
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
      const message =
        errBody?.message || `Wallet request failed (${res.status})`;
      if (TRANSIENT_STATUSES.includes(res.status) && attempt < maxRetries) {
        this.logger.warn(
          `MCOM Wallet ${method} ${path} transient ${res.status} (attempt ${attempt}/${maxRetries}), retrying with same idempotency key.`,
        );
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }
      if (res.status === 402 || code === 'INSUFFICIENT_BALANCE') {
        throw new McomWalletError('INSUFFICIENT_BALANCE', message, 422);
      }
      throw new McomWalletError(code, message, res.status);
    }
    throw new McomWalletError('INTERNAL_ERROR', 'Wallet request failed', 500);
  }

  async getBalance(centralUserId: string) {
    return this.request<{
      success: boolean;
      balance: number;
      availableBalance: number;
      status: string;
      currency: string;
    }>('GET', `/balance/${encodeURIComponent(centralUserId)}`);
  }

  /** Look up one of this platform's transactions (by id or idempotencyKey). */
  async getTransaction(id: string) {
    return this.request<{
      id: string;
      type: string;
      amount: number;
      currency: string;
      status: string;
      reference?: string | null;
      idempotencyKey?: string | null;
    }>('GET', `/transaction/${encodeURIComponent(id)}`);
  }

  async getTransactionByIdempotencyKey(idempotencyKey: string) {
    return this.request<{
      id: string;
      type: string;
      amount: number;
      currency: string;
      status: string;
      reference?: string | null;
      idempotencyKey?: string | null;
    }>(
      'GET',
      `/transaction/${encodeURIComponent(idempotencyKey)}?by=idempotencyKey`,
      undefined,
      undefined,
      1,
    );
  }

  async debit(input: WalletDebitInput) {
    if (!input.idempotencyKey)
      throw new McomWalletError(
        'VALIDATION_ERROR',
        'idempotencyKey is required for wallet debit',
        400,
      );
    const { idempotencyKey, ...body } = input;
    return this.request<{
      success: boolean;
      transactionId: string;
      type: string;
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
      currency: string;
      reference?: string;
      idempotencyKey: string;
      processedAt: string;
    }>('POST', '/debit', body, idempotencyKey);
  }

  async credit(input: WalletCreditInput) {
    if (!input.idempotencyKey)
      throw new McomWalletError(
        'VALIDATION_ERROR',
        'idempotencyKey is required for wallet credit',
        400,
      );
    const { idempotencyKey, ...body } = input;
    return this.request<{
      success: boolean;
      transactionId: string;
      type: string;
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
      currency: string;
      reference?: string;
      idempotencyKey: string;
      processedAt: string;
    }>('POST', '/credit', body, idempotencyKey);
  }

  async placeHold(input: {
    userId: string;
    amount: number;
    reference?: string;
    metadata?: Record<string, any>;
    ttlHours?: number;
    idempotencyKey?: string;
  }) {
    const { idempotencyKey, ...body } = input;
    return this.request<{
      success: boolean;
      holdId: string;
      amount: number;
      expiresAt: string;
    }>('POST', '/hold/place', body, idempotencyKey);
  }

  async captureHold(input: {
    holdId: string;
    amount?: number;
    reference?: string;
    metadata?: Record<string, any>;
    idempotencyKey?: string;
  }) {
    const { idempotencyKey, ...body } = input;
    try {
      return await this.request<{
        success: boolean;
        transactionId: string;
        type: string;
        amount: number;
      }>('POST', '/hold/capture', body, idempotencyKey);
    } catch (err: any) {
      // The central capture endpoint has no idempotency guard: a capture that
      // succeeded server-side (commit OK, post-commit hook failed) or a
      // retried request surfaces as 500/unique-violation or 409
      // (hold already CAPTURED). Reconcile via the idempotency-key lookup and
      // treat a found transaction as success instead of double-charging or
      // failing the checkout.
      const status = err instanceof McomWalletError ? err.httpStatus : 0;
      if (idempotencyKey && (status === 409 || status === 500)) {
        try {
          const txn = await this.getTransactionByIdempotencyKey(idempotencyKey);
          if (txn?.id) {
            this.logger.log(
              `Hold capture reconciled via idempotency key ${idempotencyKey} -> txn ${txn.id}`,
            );
            return {
              success: true,
              transactionId: txn.id,
              type: txn.type,
              amount: Number(txn.amount),
            };
          }
        } catch {
          // No prior capture found — fall through to the original error.
        }
      }
      throw err;
    }
  }

  async releaseHold(input: { holdId: string; reason?: string }) {
    return this.request<{ success: boolean }>(
      'POST',
      '/hold/release',
      input,
      undefined,
      1,
    );
  }

  /** Build a deterministic idempotency key scoped to this platform. */
  buildKey(...parts: Array<string | number>): string {
    const key = `${this.clientId}-${parts.join('-')}`;
    return key.slice(0, 255).replace(/[^\x20-\x7E]/g, '');
  }

  toHttpException(err: unknown): HttpException {
    if (err instanceof McomWalletError) {
      if (err.code === 'INSUFFICIENT_BALANCE') {
        return new HttpException(
          {
            error: 'WALLET_INSUFFICIENT_FUNDS',
            message: 'Top up your MCOM Wallet to continue.',
            topUpUrl: this.topUpUrl,
          },
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      if (err.httpStatus === 409) {
        // Hold already used/expired (or a genuine key collision). Never a
        // 502: tell the caller to restart the payment, not retry blindly.
        return new HttpException(
          {
            error: err.code,
            message: `${err.message}. Please restart the payment to place a fresh hold.`,
          },
          HttpStatus.CONFLICT,
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
    throw err;
  }
}
