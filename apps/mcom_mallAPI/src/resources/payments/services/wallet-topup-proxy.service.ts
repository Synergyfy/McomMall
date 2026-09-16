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

/**
 * Mall-side proxy for user-scoped MCOM Solutions wallet top-ups.
 * Card money is processed entirely by Solutions (their Stripe account):
 * the browser confirms the PaymentIntent with Solutions' publishable key,
 * the mall only forwards initiate/confirm calls using the SSO user's own
 * Solutions access token (refreshed per call from the stored encrypted
 * refresh token). The mall never sees card data.
 */
@Injectable()
export class WalletTopUpProxyService {
  private readonly logger = new Logger(WalletTopUpProxyService.name);
  private readonly solutionsBackend: string;
  private readonly userWalletBase: string;

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
    this.userWalletBase = `${this.solutionsBackend}/api/v1/wallet`;
  }

  getPublishableKey(): string {
    return (
      this.configService.get<string>('MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY') ||
      ''
    ).trim();
  }

  isCardTopUpAvailable(): boolean {
    return this.getPublishableKey().length > 0 && isTokenEncryptionEnabled();
  }

  async initiateTopUp(
    mallUserId: string,
    amount: number,
    currency = 'GBP',
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    topUpRequestId: string;
    amount: number;
    currency: string;
    checkoutUrl?: string | null;
  }> {
    if (!this.isCardTopUpAvailable()) {
      throw new BadRequestException(
        'Card top-up is not configured. Please top up from MCOM Solutions.',
      );
    }
    if (!(amount >= 5 && amount <= 500)) {
      throw new BadRequestException(
        'Top-up amount must be between 5 and 500 GBP per attempt.',
      );
    }
    return this.withSolutionsAuth(mallUserId, async (accessToken) => {
      const res = await fetch(`${this.userWalletBase}/topup/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ amount, currency, provider: 'stripe' }),
      });
      if (!res.ok) {
        throw await this.toProxyError(res, 'initiate card top-up');
      }
      return res.json();
    });
  }

  async confirmTopUp(
    mallUserId: string,
    topUpRequestId: string,
    paymentIntentId: string,
  ): Promise<{ success: boolean; credited?: number }> {
    if (!this.isCardTopUpAvailable()) {
      throw new BadRequestException(
        'Card top-up is not configured. Please top up from MCOM Solutions.',
      );
    }
    return this.withSolutionsAuth(mallUserId, async (accessToken) => {
      const res = await fetch(`${this.userWalletBase}/topup/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ topUpRequestId, paymentIntentId }),
      });
      if (!res.ok) {
        throw await this.toProxyError(res, 'confirm card top-up');
      }
      return res.json();
    });
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
    } catch (err) {
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
        { error: 'TOPUP_UPSTREAM_ERROR', message },
        HttpStatus.BAD_GATEWAY,
      );
    }
    throw new BadRequestException(message);
  }
}
