import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';

/**
 * Validates the Console-issued System API Key (`ak_...`) on inbound MCOM
 * Central requests (e.g. Central reading/updating pricing tiers via
 * `/system/plans`).
 *
 * This is the Central → App direction only (never used for app-to-app traffic).
 * Keys are read once from config (env) — never re-parsed from disk — and are
 * compared in constant time.
 */
@Injectable()
export class McomSolutionAuthGuard implements CanActivate {
  private readonly logger = new Logger(McomSolutionAuthGuard.name);
  private readonly validKeys: string[];

  constructor(private readonly configService: ConfigService) {
    this.validKeys = [
      this.configService.get<string>('MCOM_SOLUTION_API_KEY'),
      this.configService.get<string>('MCOM_API_KEY'),
    ]
      .filter((k): k is string => Boolean(k && k.trim()))
      .map((k) => k.trim());
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = (request.headers['x-mcom-solution-api-key'] ||
      request.headers['x-api-key']) as string | undefined;

    if (this.validKeys.length === 0) {
      this.logger.error(
        `[AuthGuard] No MCOM System API key configured on server for ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException(
        'MCOM_SOLUTION_API_KEY not configured on server',
      );
    }

    const provided = (apiKey || '').trim();
    const isMatch = this.validKeys.some((key) => this.safeEqual(key, provided));

    if (!provided || !isMatch) {
      this.logger.warn(
        `[AuthGuard] Rejected ${request.method} ${request.url} - invalid or missing MCOM System API key`,
      );
      throw new UnauthorizedException(
        'Invalid or missing MCOM Solution API key',
      );
    }

    return true;
  }

  /** Constant-time comparison to avoid leaking key material via timing. */
  private safeEqual(expected: string, provided: string): boolean {
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  }
}
