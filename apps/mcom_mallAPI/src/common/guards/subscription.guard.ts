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
import { SubscriptionAccessCache } from './subscription-access.cache';

const SUBSCRIPTION_KEY = 'requireSubscription';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  static clearCache(userId?: string) {
    SubscriptionAccessCache.clear(userId);
  }

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
    const cached = SubscriptionAccessCache.get(cacheKey);
    if (cached !== null) {
      if (!cached) {
        throw new ForbiddenException('No active MCOM Mall subscription');
      }
      return true;
    }

    // Local entitlement resolution, highest precedence first:
    //   1. a plan bought directly from the Mall
    //   2. a CHS membership that bundles a Mall plan
    //   3. an active trial
    // A direct Mall plan therefore wins over an included CHS plan while it is
    // active, and the CHS grant takes over once it expires.
    let hasLocalAccess = false;
    try {
      const effective = await this.membershipService.resolveEffectiveMembership(
        user.id ?? user.userId,
      );
      if (effective) {
        hasLocalAccess = true;
        request.membershipSource = effective.source;
      }
    } catch (e) {
      this.logger.warn(
        `Local membership check failed for user ${centralUserId}: ${e}`,
      );
    }

    // Query MCOM Solutions for CHS memberships (and Central trials) that have
    // not been delivered to the webhook yet. Central is only consulted when
    // there is no local/CHS grant, so a Mall purchase is never overridden.
    const packages = hasLocalAccess
      ? null
      : await this.mcomCentralService.getUserPackages(centralUserId);

    const centralReachable = packages !== null;
    const isActive = hasLocalAccess || packages?.isActive === true;

    // Update cache
    SubscriptionAccessCache.set(cacheKey, isActive);

    if (isActive) {
      if (packages?.entitlement) {
        request.entitlement = packages.entitlement;
        request.isTrial = packages.isTrial;
        request.programmeTasks = packages.programmeTasks;
      }
      return true;
    }

    // Only throw if Central was reachable AND no local/CHS/trial access exists.
    if (centralReachable) {
      const reason = packages?.reason || 'NO_ACTIVE_ENTITLEMENT';
      const upgradeUrl =
        packages?.upgradeUrl ||
        `${this.mcomCentralService.getFrontendUrl()}/dashboard/memberships`;

      throw new ForbiddenException({
        message: 'subscription_required',
        reason,
        upgradeUrl,
      });
    }

    // Central unreachable and no local evidence: fail open so an outage does
    // not lock out legitimate CHS members mid-session.
    this.logger.warn(
      `MCOM Central unreachable for user ${centralUserId}, failing open`,
    );
    return true;
  }
}
