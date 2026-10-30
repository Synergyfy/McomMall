import {
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { createTokenInterface } from '../../common/types/auth.interface';
import { Membership } from '../membership/entities/membership.entity';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { McomCentralService } from './mcom-central.service';
import { encryptToken } from './token-crypto';
import {
  buildNewUserIdentity,
  syncCentralIdentity,
} from './central-profile-sync';

@Injectable()
export class SsoService {
  private readonly logger = new Logger(SsoService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly dataSource: DataSource,
    private readonly mcomCentralService: McomCentralService,
  ) {}

  getMcomSolutionsFrontendUrl(): string {
    return process.env.MCOM_SOLUTIONS_FRONTEND_URL || 'http://localhost:3000';
  }

  getMcomSolutionsBackendUrl(): string {
    return process.env.MCOM_SOLUTIONS_BACKEND_URL || 'http://localhost:3010';
  }

  getMallFrontendUrl(): string {
    return process.env.MALL_FRONTEND_URL || 'http://localhost:3003';
  }

  getClientId(): string {
    return (
      process.env.SSO_CLIENT_ID || process.env.MCOM_CLIENT_ID || 'mcom-mall'
    );
  }

  private getClientSecret(): string {
    return (
      process.env.SSO_CLIENT_SECRET ||
      process.env.MCOM_CLIENT_SECRET ||
      'mall_secret_123'
    );
  }

  private getBasicAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.getClientId()}:${this.getClientSecret()}`,
    ).toString('base64');
    return `Basic ${credentials}`;
  }

  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  getAuthorizeUrl(state: string): string {
    const baseUrl = this.getMcomSolutionsFrontendUrl();
    const clientId = this.getClientId();
    const redirectUri = `${this.getMallFrontendUrl()}/auth/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    return `${baseUrl}/api/v1/auth/sso/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri?: string) {
    const baseUrl = this.getMcomSolutionsBackendUrl();
    const uri = redirectUri || `${this.getMallFrontendUrl()}/auth/callback`;

    const response = await fetch(`${baseUrl}/api/v1/auth/sso/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getBasicAuthHeader(),
      },
      body: JSON.stringify({
        code,
        client_id: this.getClientId(),
        redirect_uri: uri,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      this.logger.error(`Token exchange failed: ${response.status}`, errorBody);
      throw new UnauthorizedException(
        errorBody.error || 'SSO token exchange failed',
      );
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      throw new UnauthorizedException(
        'Invalid response from MCOM Solutions token endpoint',
      );
    }
    return data;
  }

  async refreshSsoToken(refreshToken: string) {
    const baseUrl = this.getMcomSolutionsBackendUrl();

    const response = await fetch(`${baseUrl}/api/v1/auth/sso/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      this.logger.error(
        `SSO token refresh failed: ${response.status}`,
        errorBody,
      );
      throw new UnauthorizedException(
        errorBody.error || 'SSO token refresh failed',
      );
    }

    return response.json();
  }

  async getSsoUserInfo(accessToken: string) {
    const baseUrl = this.getMcomSolutionsBackendUrl();

    const response = await fetch(`${baseUrl}/api/v1/auth/sso/userinfo`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      this.logger.error(
        `SSO userinfo fetch failed: ${response.status}`,
        errorBody,
      );
      throw new UnauthorizedException(
        errorBody.error || 'Failed to fetch SSO user info',
      );
    }

    return response.json();
  }

  async logoutSso(accessToken: string) {
    const baseUrl = this.getMcomSolutionsBackendUrl();

    const response = await fetch(`${baseUrl}/api/v1/auth/sso/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });

    if (!response.ok) {
      this.logger.warn(`SSO logout returned ${response.status} (non-fatal)`);
    }

    return { success: true };
  }

  async handleCallback(code: string, state: string, cookieState: string) {
    if (!state || !cookieState || state !== cookieState) {
      throw new UnauthorizedException('CSRF State mismatch');
    }

    const tokenData = await this.exchangeCode(code);
    return this.processSsoUser(tokenData);
  }

  async handleCallbackFromCode(code: string, redirectUri?: string) {
    const tokenData = await this.exchangeCode(code, redirectUri);
    return this.processSsoUser(tokenData);
  }

  private async processSsoUser(tokenData: any) {
    const centralUser = tokenData.user;

    if (!centralUser || !centralUser.email) {
      throw new UnauthorizedException(
        'Invalid user data received from MCOM Solutions',
      );
    }

    const centralUserId = centralUser.sub || centralUser.id;

    if (!centralUserId) {
      throw new UnauthorizedException(
        'MCOM Solutions user ID not found in token response',
      );
    }

    // --- Entitlement Resolution Rules Engine (Standard Protocol Version: 2026-10-01) ---
    const isOwnerRole =
      centralUser.role?.toLowerCase() === 'owner' ||
      centralUser.role?.toLowerCase() === 'business';

    let resolvedEntitlement =
      tokenData.entitlement || centralUser.businessProfile?.entitlement || null;

    let userPackages: {
      tierId: string | null;
      isActive: boolean;
      packages: any[];
      reason?: string;
      upgradeUrl?: string;
    } | null = null;

    if (isOwnerRole) {
      if (!resolvedEntitlement && centralUserId) {
        // Fallback: real-time introspection via GET /api/v1/auth/sso/entitlement
        try {
          resolvedEntitlement =
            await this.mcomCentralService.getIntrospectedEntitlement(
              centralUserId,
              tokenData.accessToken,
            );
        } catch (err) {
          this.logger.warn(
            `Could not introspect entitlement for user ${centralUserId}: ${err instanceof Error ? err.message : err}`,
          );
        }
      }

      // Check if user has an active direct plan paid specifically for MCOM Mall
      let hasLocalActivePlan = false;
      let localActiveMembership: any = null;

      try {
        const existingLocalUser = await this.userRepository.findOne({
          select: ['id', 'email', 'centralUserId'],
          where: [
            { email: centralUser.email },
            ...(centralUserId ? [{ centralUserId }] : []),
          ],
        });

        if (existingLocalUser) {
          const membershipRepo = this.dataSource.getRepository(Membership);
          const activeMem = await membershipRepo.findOne({
            where: { user: { id: existingLocalUser.id }, isActive: true },
          });

          if (
            activeMem &&
            activeMem.isActive &&
            (!activeMem.expiresAt ||
              new Date(activeMem.expiresAt).getTime() > Date.now())
          ) {
            hasLocalActivePlan = true;
            localActiveMembership = activeMem;
          }
        }
      } catch (err) {
        this.logger.warn(
          `Could not check local MCOM Mall plan: ${err instanceof Error ? err.message : err}`,
        );
      }

      if (hasLocalActivePlan && localActiveMembership) {
        this.logger.log(
          `User ${centralUser.email} has active direct plan on MCOM Mall (${localActiveMembership.planVariantId || localActiveMembership.planType || 'mall-direct'}), granting access.`,
        );

        if (!resolvedEntitlement || !resolvedEntitlement.access?.hasAccess) {
          resolvedEntitlement = {
            version: '2026-10-01',
            targetPlatform: {
              clientId: this.getClientId(),
              platformSlug: 'mall',
              name: 'MCOM Mall',
            },
            access: {
              hasAccess: true,
              accessType: 'DIRECT_PACKAGE',
              upgradeUrl: `${this.getMcomSolutionsFrontendUrl()}/dashboard/memberships`,
            },
            plan: {
              planId:
                localActiveMembership.planVariantId ||
                localActiveMembership.planType ||
                'mall-direct',
              planName: 'MCOM Mall Direct Plan',
              source: 'direct',
              status: 'active',
              billingCycle: localActiveMembership.planType || null,
              expiresAt: localActiveMembership.expiresAt
                ? new Date(localActiveMembership.expiresAt).toISOString()
                : null,
              quotas: {},
              limits: {},
              features: [],
            },
            membershipContext: {
              membershipPlanName: null,
              membershipLevel: 'Direct',
              membershipStatus: 'active',
              isIncludedInMembership: false,
            },
            trialContext: {
              isInTrial: false,
              hasPaidVerificationFee: false,
              trialExpiresAt: null,
              daysRemaining: 0,
              programmeTasks: [],
            },
          };
        }
      } else if (resolvedEntitlement && resolvedEntitlement.access) {
        if (!resolvedEntitlement.access.hasAccess) {
          const reason =
            resolvedEntitlement.access.reason || 'NO_ACTIVE_ENTITLEMENT';
          const upgradeUrl =
            resolvedEntitlement.access.upgradeUrl ||
            `${this.getMcomSolutionsFrontendUrl()}/dashboard/memberships`;

          this.logger.warn(
            `Access denied for user ${centralUserId}: reason=${reason}, upgradeUrl=${upgradeUrl}`,
          );

          throw new ForbiddenException({
            message: 'subscription_required',
            reason,
            upgradeUrl,
          });
        }
      } else {
        // Fallback: query packages from MCOM Solutions if no entitlement was returned.
        // Pass the Solutions access token so the authenticated real-time
        // entitlement endpoint is used instead of the service-HMAC path.
        try {
          userPackages = await this.mcomCentralService.getUserPackages(
            centralUserId,
            tokenData.accessToken,
          );
        } catch (err) {
          this.logger.warn(
            `Could not verify legacy subscription for user ${centralUserId}: ${err instanceof Error ? err.message : err}`,
          );
        }

        if (userPackages && !userPackages.isActive) {
          throw new ForbiddenException({
            message: 'subscription_required',
            reason: userPackages.reason || 'NO_ACTIVE_ENTITLEMENT',
            upgradeUrl:
              userPackages.upgradeUrl ||
              `${this.getMcomSolutionsFrontendUrl()}/dashboard/memberships`,
          });
        }
      }
    }
    // --- End entitlement resolution ---

    // Resolve the local account by Central ID first, then by email (case
    // insensitive). Provisioning is idempotent so concurrent SSO callbacks
    // cannot violate the users.email unique constraint.
    const identity = buildNewUserIdentity(centralUser);

    let localUser = await this.userService.findOrCreateFromCentralIdentity({
      email: centralUser.email,
      centralUserId,
      firstName: identity.firstName,
      lastName: identity.lastName,
      phoneNumber: identity.phoneNumber,
      role: identity.role,
    });

    // MCOM Central is the identity source of truth. Diff and refresh every
    // local field (person, contact, business profile, storefront) on login.
    const synced = await syncCentralIdentity({
      userRepository: this.userRepository,
      dataSource: this.dataSource,
      localUser,
      centralUser,
      logger: this.logger,
    });
    localUser = synced.user;

    // Store the Solutions SSO refresh token (encrypted at rest) so the mall
    // can proxy user-scoped Solutions calls (embedded wallet card top-ups).
    // Skipped when TOKEN_ENCRYPTION_KEY is unconfigured — debits unaffected.
    if (typeof tokenData.refreshToken === 'string' && tokenData.refreshToken) {
      const encrypted = encryptToken(tokenData.refreshToken);
      if (encrypted && localUser.centralRefreshToken !== encrypted) {
        localUser.centralRefreshToken = encrypted;
        await this.userRepository.update(localUser.id, {
          centralRefreshToken: encrypted,
        });
      } else if (!encrypted) {
        this.logger.warn(
          'TOKEN_ENCRYPTION_KEY is not configured — Solutions refresh token not stored; embedded card top-up unavailable.',
        );
      }
    }

    const tokenPayload: createTokenInterface = {
      sub: localUser.id,
      role: localUser.role,
      email: localUser.email,
      name: `${localUser.firstName} ${localUser.lastName}`,
      userId: localUser.id,
      centralUserId: centralUserId,
    };

    const tokens = this.createToken(tokenPayload);

    const isTrial =
      resolvedEntitlement?.access?.accessType === 'TRIAL_PROGRAMME';
    const planId =
      resolvedEntitlement?.plan?.planId || userPackages?.tierId || null;
    const planName = resolvedEntitlement?.plan?.planName || null;
    const quotas = resolvedEntitlement?.plan?.quotas || {};
    const tasks = resolvedEntitlement?.trialContext?.programmeTasks || [];
    const accessType =
      resolvedEntitlement?.access?.accessType ||
      (userPackages?.isActive ? 'DIRECT_PACKAGE' : 'NONE');

    return {
      ...tokens,
      userId: localUser.id,
      name: `${localUser.firstName} ${localUser.lastName}`,
      role: localUser.role,
      email: localUser.email,
      packageInfo: planId ? { planType: planId } : null,
      entitlement: resolvedEntitlement,
      accessType,
      isTrial,
      planId,
      planName,
      quotas,
      tasks,
    };
  }

  private createToken(payload: createTokenInterface) {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessToken = this.jwtService.sign(
      { ...payload, jti: accessJti },
      { expiresIn: '30m' as any },
    );
    const refreshToken = this.jwtService.sign(
      { ...payload, jti: refreshJti },
      { expiresIn: '7d' as any },
    );
    return { accessToken, refreshToken };
  }
}
