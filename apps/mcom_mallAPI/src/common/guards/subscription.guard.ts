import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { McomCentralService } from '../../resources/sso/mcom-central.service';

const SUBSCRIPTION_KEY = 'requireSubscription';

@Injectable()
export class SubscriptionGuard implements CanActivate {
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
    const isActive = packages?.isActive === true;

    // Update cache
    SubscriptionGuard.cache.set(cacheKey, {
      result: isActive,
      timestamp: Date.now(),
    });

    if (!isActive) {
      throw new ForbiddenException('No active MCOM Mall subscription');
    }

    return true;
  }
}
