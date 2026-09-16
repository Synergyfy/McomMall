import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { decryptToken, isTokenEncryptionEnabled } from '../../sso/token-crypto';

export type SolutionsBillingCycle = 'monthly' | 'quarterly' | 'annual';

/**
 * Mall-side proxy for user-scoped MCOM Solutions platform payments.
 * Card/PayPal money is processed entirely by Solutions (their Stripe and
 * PayPal accounts): the browser confirms the PaymentIntent with Solutions'
 * publishable key (or is redirected to PayPal), the mall only forwards
 * initiate/confirm calls using the SSO user's own Solutions access token
 * (refreshed per call from the stored encrypted refresh token). The mall
 * never sees card data. Solutions records the purchase in its own ledger
 * (platform package); the mall records membership locally on success.
 */
@Injectable()
export class SolutionsPaymentProxyService {
  private readonly logger = new Logger(SolutionsPaymentProxyService.name);
  private readonly solutionsBackend: string;
  private readonly paymentBase: string;
  /** Exact platform key Solutions' connector factory resolves to McomMall. */
  private readonly platform = 'MCOM Mall';

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const backend =
      this.configService.get<string>('MCOM_SOLUTIONS_BACKEND_URL') ||
      this.configService.get<string>('MCOM_CENTRAL_URL') ||
      'http://localhost:3010';
    this.solutionsBackend = backend
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/$/, '');
    this.paymentBase = `${this.solutionsBackend}/api/v1/payment`;
  }

  getPlatform(): string {
    return this.platform;
  }

  isAvailable(): boolean {
    return (
      this.configService
        .get<string>('MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY')
        ?.trim().length > 0 && isTokenEncryptionEnabled()
    );
  }

  async stripeInitiate(
    mallUserId: string,
    externalPlanId: string,
    billingCycle: SolutionsBillingCycle,
  ): Promise<{ clientSecret: string; type: 'payment' | 'setup' }> {
    if (!externalPlanId) {
      throw new BadRequestException('A plan reference is required.');
    }
    return this.withSolutionsAuth(mallUserId, async (accessToken) => {
      const res = await fetch(`${this.paymentBase}/platform/stripe/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          platform: this.platform,
          externalPlanId,
          billingCycle,
        }),
      });
      if (!res.ok) {
        throw await this.toProxyError(res, 'initiate card payment');
      }
      const body: any = await res.json();
      if (!body?.clientSecret) {
        throw new BadRequestException(
          'MCOM Solutions did not return a payment secret.',
        );
      }
      return { clientSecret: body.clientSecret, type: body.type ?? 'payment' };
    });
  }

  async stripeConfirm(
    mallUserId: string,
    externalPlanId: string,
    billingCycle: SolutionsBillingCycle,
    intentId: string,
  ): Promise<{ ok: boolean; details?: any }> {
    if (!intentId) {
      throw new BadRequestException('A payment reference is required.');
    }
    const isSetupIntent = intentId.startsWith('seti_');
    return this.withSolutionsAuth(mallUserId, async (accessToken) => {
      const res = await fetch(`${this.paymentBase}/platform/stripe/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          platform: this.platform,
          externalPlanId,
          billingCycle,
          ...(isSetupIntent
            ? { setupIntentId: intentId }
            : { paymentIntentId: intentId }),
        }),
      });
      if (!res.ok) {
        throw await this.toProxyError(res, 'confirm card payment');
      }
      const details: any = await res.json().catch(() => ({}));
      return { ok: true, details };
    });
  }

  async paypalInitiate(
    mallUserId: string,
    externalPlanId: string,
    billingCycle: SolutionsBillingCycle,
    returnUrl?: string,
    cancelUrl?: string,
  ): Promise<{ orderId: string; approvalUrl: string }> {
    if (!externalPlanId) {
      throw new BadRequestException('A plan reference is required.');
    }
    return this.withSolutionsAuth(mallUserId, async (accessToken) => {
      const res = await fetch(`${this.paymentBase}/platform/paypal/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          platform: this.platform,
          externalPlanId,
          billingCycle,
          ...(returnUrl ? { returnUrl } : {}),
          ...(cancelUrl ? { cancelUrl } : {}),
        }),
      });
      if (!res.ok) {
        throw await this.toProxyError(res, 'initiate PayPal payment');
      }
      const body: any = await res.json();
      if (!body?.orderId || !body?.approvalUrl) {
        throw new BadRequestException(
          'MCOM Solutions did not return a PayPal approval.',
        );
      }
      return { orderId: body.orderId, approvalUrl: body.approvalUrl };
    });
  }

  /**
   * Solutions' platform PayPal capture endpoint is unauthenticated, so no
   * user token is needed here — the order id itself authorizes the capture.
   */
  async paypalCapture(
    orderId: string,
  ): Promise<{ ok: boolean; details?: any }> {
    if (!orderId) {
      throw new BadRequestException('A PayPal order ID is required.');
    }
    const res = await fetch(`${this.paymentBase}/platform/paypal/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
      throw await this.toProxyError(res, 'capture PayPal payment');
    }
    const details: any = await res.json().catch(() => ({}));
    return { ok: true, details };
  }

  /**
   * Runs a user-scoped Solutions call: refresh → access → call, with one
   * retry on 401. A failed refresh means the SSO session ended → ask the
   * user to re-authenticate via SSO.
   */
  private async withSolutionsAuth<T>(
    mallUserId: string,
    call: (accessToken: string) => Promise<T>,
  ): Promise<T> {
    const user = await this.userRepository.findOne({
      where: { id: mallUserId },
    });
    const refreshToken = user?.centralRefreshToken
      ? decryptToken(user.centralRefreshToken)
      : null;
    if (!refreshToken) {
      throw new UnauthorizedException(
        'MCOM Solutions session not linked for card payments. Please re-authenticate via SSO.',
      );
    }
    let accessToken = await this.refreshAccessToken(refreshToken);
    if (!accessToken) {
      await this.clearStoredToken(mallUserId);
      throw new UnauthorizedException(
        'MCOM Solutions session expired. Please re-authenticate via SSO.',
      );
    }
    try {
      return await call(accessToken);
    } catch (err: any) {
      if (err?.status === 401) {
        accessToken = await this.refreshAccessToken(refreshToken);
        if (!accessToken) {
          await this.clearStoredToken(mallUserId);
          throw new UnauthorizedException(
            'MCOM Solutions session expired. Please re-authenticate via SSO.',
          );
        }
        return call(accessToken);
      }
      throw err;
    }
  }

  private async refreshAccessToken(
    refreshToken: string,
  ): Promise<string | null> {
    try {
      const res = await fetch(
        `${this.solutionsBackend}/api/v1/auth/sso/token/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );
      if (!res.ok) return null;
      const body: any = await res.json().catch(() => null);
      return typeof body?.accessToken === 'string' ? body.accessToken : null;
    } catch {
      return null;
    }
  }

  private async clearStoredToken(mallUserId: string): Promise<void> {
    try {
      await this.userRepository.update(
        { id: mallUserId },
        { centralRefreshToken: null },
      );
    } catch {
      this.logger.warn(
        `Could not clear stored Solutions token for ${mallUserId}`,
      );
    }
  }

  private async toProxyError(res: Response, action: string): Promise<Error> {
    const body: any = await res.json().catch(() => ({}));
    const message =
      body?.message || body?.error || `Failed to ${action} (${res.status})`;
    if (res.status === 401 || res.status === 403) {
      const err: any = new UnauthorizedException(message);
      err.status = 401;
      throw err;
    }
    if (res.status >= 500) {
      throw new HttpException(
        { error: 'PAYMENT_UPSTREAM_ERROR', message },
        HttpStatus.BAD_GATEWAY,
      );
    }
    throw new BadRequestException(message);
  }
}
