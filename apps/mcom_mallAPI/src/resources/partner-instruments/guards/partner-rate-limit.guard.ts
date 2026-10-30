import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedServiceRequest } from '../../service-mesh/interfaces/authenticated-service-request.interface';

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Lightweight per-caller, per-route rate limit for partner endpoints.
 *
 * In-memory and best-effort: it protects a single instance from accidental
 * hot loops. For multi-instance deployments put a shared limiter at the edge
 * (e.g. the ingress/gateway) as well.
 */
@Injectable()
export class PartnerRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedServiceRequest>();

    const raw = this.configService.get<string>(
      'MALL_PARTNER_RATE_LIMIT_PER_MINUTE',
    );
    const limit = Math.max(1, Number(raw) || 120);
    const windowMs = 60_000;
    const now = Date.now();

    const caller = request.serviceCaller?.callerAppId ?? 'anonymous';
    const route = `${request.method}:${request.baseUrl}${request.path}`;
    const key = `${caller}:${route}`;

    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;

    // Opportunistic cleanup so the map cannot grow unbounded.
    if (this.buckets.size > 5_000) {
      for (const [entryKey, entry] of this.buckets.entries()) {
        if (entry.resetAt <= now) this.buckets.delete(entryKey);
      }
    }

    if (bucket.count > limit) {
      throw new HttpException(
        'RATE_LIMITED: too many partner requests, retry shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
