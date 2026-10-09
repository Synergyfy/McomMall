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
import { UserRole } from '../../common/role.enum';
import { Business } from '../listings/entities/listing.entity';
import { Location } from '../listings/entities/location.entity';
import { ListingType, BusinessStatus } from '../listings/listing.enum';
import { LocalMall } from '../localmall/entities/localmall.entity';
import { ActivatedRegion } from '../localmall/entities/activated-region.entity';
import { Membership } from '../membership/entities/membership.entity';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { McomCentralService } from './mcom-central.service';
import { encryptToken } from './token-crypto';

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
    return process.env.SSO_CLIENT_ID || process.env.MCOM_CLIENT_ID || 'mcom-mall';
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
        // Fallback: query packages from MCOM Solutions if no entitlement was returned
        try {
          userPackages =
            await this.mcomCentralService.getUserPackages(centralUserId);
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

    let localUser = await this.userRepository.findOne({
      where: { email: centralUser.email },
    });

    if (!localUser) {
      const role = centralUser.role?.toLowerCase();
      const password = Math.random().toString(36).slice(-10) + 'Aa1!';
      const fullName = centralUser.name || centralUser.email.split('@')[0];
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'User';

      localUser = await this.userService.create({
        email: centralUser.email,
        firstName,
        lastName,
        password,
        confirm_password: password,
        phoneNumber:
          centralUser.phoneNumber ||
          `00000000${Math.floor(1000 + Math.random() * 9000)}`,
        role: role === 'business' ? UserRole.OWNER : UserRole.CUSTOMER,
      });
    } else {
      const newName =
        centralUser.name || `${localUser.firstName} ${localUser.lastName}`;
      const nameParts = newName.split(' ');
      const newFirstName = nameParts[0] || localUser.firstName;
      const newLastName = nameParts.slice(1).join(' ') || localUser.lastName;

      const centralRole = centralUser.role?.toLowerCase();
      const newRole =
        centralRole === 'business' ? UserRole.OWNER : UserRole.CUSTOMER;

      const needsUpdate =
        localUser.firstName !== newFirstName ||
        localUser.lastName !== newLastName ||
        localUser.role !== newRole;

      if (needsUpdate) {
        localUser.firstName = newFirstName;
        localUser.lastName = newLastName;
        localUser.fullName = `${newFirstName} ${newLastName}`;
        localUser.role = newRole;
        await this.userRepository.update(localUser.id, {
          firstName: newFirstName,
          lastName: newLastName,
          fullName: `${newFirstName} ${newLastName}`,
          role: newRole,
        });
      }
    }

    // Store the Mcom Solutions user ID for future subscription lookups
    if (centralUserId && localUser.centralUserId !== centralUserId) {
      localUser.centralUserId = centralUserId;
      await this.userRepository.update(localUser.id, { centralUserId });
    }

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

    if (localUser.role === UserRole.OWNER) {
      await this.jitStorefrontSync(localUser, centralUser);
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

  private async jitStorefrontSync(localUser: User, centralUser: any) {
    const businessRepository = this.dataSource.getRepository(Business);
    const existingBusiness = await businessRepository.findOne({
      select: ['id'],
      where: { user: { id: localUser.id } },
    });

    if (existingBusiness) return;

    const locationRepository = this.dataSource.getRepository(Location);
    const cleanPostcode = (centralUser.postcode || 'SW1A 1AA')
      .trim()
      .toUpperCase();
    const address = centralUser.address || 'High Street';

    let lat = 51.5074;
    let lon = -0.1278;
    let borough = 'London';

    try {
      const postcodeResponse = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(
          cleanPostcode.replace(/\s+/g, ''),
        )}`,
      );
      if (postcodeResponse.ok) {
        const body = await postcodeResponse.json();
        if (body && body.status === 200 && body.result) {
          lat = body.result.latitude;
          lon = body.result.longitude;
          const rawBorough =
            body.result.admin_district || body.result.region || '';
          borough = rawBorough
            .replace(/London Borough of /i, '')
            .replace(/Borough of /i, '')
            .replace(/City of /i, '')
            .replace(/Royal Borough of /i, '')
            .trim();
        }
      }
    } catch (err) {
      this.logger.error('Postcodes.io lookup error in JIT:', err);
    }

    const mallName = `${borough} Local Mall`;
    const localMallRepository = this.dataSource.getRepository(LocalMall);
    let localMall = await localMallRepository.findOne({
      select: ['id', 'name'],
      where: { name: mallName },
    });

    if (!localMall) {
      localMall = localMallRepository.create({
        name: mallName,
        latitude: lat,
        longitude: lon,
      });
      await localMallRepository.save(localMall);
    }

    const activatedRegionRepository =
      this.dataSource.getRepository(ActivatedRegion);
    let activeRegion = await activatedRegionRepository.findOne({
      select: ['id', 'name', 'isActive'],
      where: { name: borough },
    });
    if (!activeRegion) {
      activeRegion = activatedRegionRepository.create({
        name: borough,
        isActive: true,
      });
      await activatedRegionRepository.save(activeRegion);
    } else if (!activeRegion.isActive) {
      activeRegion.isActive = true;
      await activatedRegionRepository.save(activeRegion);
    }

    const newBusiness = businessRepository.create({
      user: { id: localUser.id } as User,
      businessName: centralUser.name || 'Hyperlocal Merchant',
      businessPhone: centralUser.phoneNumber || '0000000000',
      businessEmail: localUser.email,
      shortDescription:
        'Hyperlocal business listing imported from MCOM Ecosystem.',
      listingType: [ListingType.PRODUCT, ListingType.SERVICE],
      status: BusinessStatus.PUBLISHED,
      isVerified: true,
      isGoogleVerified: true,
      localMall: localMall ? ({ id: localMall.id } as LocalMall) : undefined,
    });

    const savedBusiness = await businessRepository.save(newBusiness);

    const newLocation = locationRepository.create({
      business: { id: savedBusiness.id } as Business,
      postcode: cleanPostcode,
      addressLine1: address,
      city: borough,
      countryCode: 'GB',
      showPublicly: true,
    });

    await locationRepository.save(newLocation);
    this.logger.log(
      `[SSO JIT] Provisioned business listing for ${localUser.email}`,
    );
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
