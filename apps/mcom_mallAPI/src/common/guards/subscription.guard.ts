import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { McomCentralService } from '../../resources/sso/mcom-central.service';
import { MembershipService } from '../../resources/membership/membership.service';

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
    @Inject(forwardRef(() => MembershipService))
    private readonly membershipService: MembershipService,
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
    if (
      cached &&
      Date.now() - cached.timestamp < SubscriptionGuard.CACHE_TTL_MS
    ) {
      if (!cached.result) {
        throw new ForbiddenException('No active MCOM Mall subscription');
      }
      return true;
    }

    // Query Mcom Solutions
    const packages =
      await this.mcomCentralService.getUserPackages(centralUserId);

    // If MCOM Central is unreachable (packages is null), fail open to avoid blocking users
    // Only block if we successfully queried and found no active subscription
    let isActive = packages?.isActive === true;
    const centralReachable = packages !== null;

    // DB is the source of truth for mall entitlement: a local row only exists
    // after a verified central-wallet payment, admin grant, or trial. It wins
    // over a silent central — money always moves on Solutions regardless.
    if (!isActive) {
      try {
        const local = await this.membershipService.findActiveWithTier(
          user.id ?? user.userId,
        );
        if (
          local?.isActive &&
          local.expiresAt &&
          new Date(local.expiresAt).getTime() > Date.now()
        ) {
          isActive = true;
        }
      } catch (e) {
        this.logger.warn(
          `Local membership check failed for user ${centralUserId}, falling back to central result`,
        );
      }
    }

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
