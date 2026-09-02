import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { McomCentralService } from '../../resources/sso/mcom-central.service';

const SUBSCRIPTION_KEY = 'requireSubscription';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);
  private static cache = new Map<
    string,
    { result: boolean; timestamp: number }
  >();
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly reflector: Reflector,
    private readonly mcomCentralService: McomCentralService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireSubscription = this.reflector.getAllAndOverride<boolean>(
      SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireSubscription) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id && !user?.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Customers do not require a paid merchant subscription
    if (user?.role?.toString().toLowerCase() === 'customer') {
      return true;
    }

    const centralUserId = user.centralUserId;

    if (!centralUserId) {
      throw new ForbiddenException(
        'MCOM Solutions user ID not found. Please re-authenticate via SSO.',
      );
    }

    // Check cache
    const cacheKey = centralUserId;
    const cached = SubscriptionGuard.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < SubscriptionGuard.CACHE_TTL_MS) {
      if (!cached.result) {
        throw new ForbiddenException('No active MCOM Mall subscription');
      }
      return true;
    }

    // Query Mcom Solutions
    const packages = await this.mcomCentralService.getUserPackages(centralUserId);

    // If MCOM Central is unreachable (packages is null), fail open to avoid blocking users
    // Only block if we successfully queried and found no active subscription
    const isActive = packages?.isActive === true;
    const centralReachable = packages !== null;

    // Update cache
    SubscriptionGuard.cache.set(cacheKey, {
      result: isActive,
      timestamp: Date.now(),
    });

    // Only throw if central was reachable AND no active subscription found
    if (centralReachable && !isActive) {
      throw new ForbiddenException('No active MCOM Mall subscription');
    }

    // If central is unreachable, allow access (fail open) but log warning
    if (!centralReachable) {
      this.logger.warn(
        `MCOM Central unreachable for user ${centralUserId}, failing open`,
      );
    }

    return true;
  }
}
