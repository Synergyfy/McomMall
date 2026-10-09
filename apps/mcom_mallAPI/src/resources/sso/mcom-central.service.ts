import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class McomCentralService {
  private readonly logger = new Logger(McomCentralService.name);
  public readonly baseUrl: string;
  public readonly serviceId: string;
  private readonly apiSecret: string;

  constructor() {
    this.baseUrl =
      process.env.MCOM_SOLUTIONS_BACKEND_URL || 'http://localhost:3010';
    this.serviceId = process.env.SSO_CLIENT_ID || 'mcom-mall';
    this.apiSecret = process.env.SSO_API_SECRET || '';
  }

  getFrontendUrl(): string {
    return process.env.MCOM_SOLUTIONS_FRONTEND_URL || 'http://localhost:3000';
  }

  private getHmacHeaders(): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${this.serviceId}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');

    return {
      'X-Service-Id': this.serviceId,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'Content-Type': 'application/json',
    };
  }

  async getUserMembership(userId: string) {
    try {
      const headers = this.getHmacHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/data/user?userId=${encodeURIComponent(userId)}`,
        { headers },
      );

      if (!response.ok) {
        this.logger.error(
          `MCOM Central returned ${response.status} for userId=${userId}`,
        );
        return null;
      }

      const body = await response.json();
      const userData = body.data;

      if (!userData) return null;

      const hasActiveMall = Array.isArray(userData.packages)
        ? userData.packages.some(
            (pkg: any) =>
              ((pkg.platformName || pkg.platform)?.toLowerCase() ===
                'mcom mall' ||
                (pkg.platformName || pkg.platform)?.toLowerCase() === 'mall') &&
              pkg.status === 'active',
          )
        : false;

      return {
        membershipLevel: userData.membershipLevel || null,
        membershipTier: userData.membershipTier || null,
        hasActiveMall,
        packages: userData.packages || [],
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch user membership from MCOM Central:',
        error,
      );
      return null;
    }
  }

  async getMembershipFromCentral(userId: string) {
    try {
      const headers = this.getHmacHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/data/user/${encodeURIComponent(userId)}/membership`,
        { headers },
      );

      if (!response.ok) {
        this.logger.error(
          `MCOM Central membership returned ${response.status} for userId=${userId}`,
        );
        return null;
      }

      const body = await response.json();
      return body.data || body;
    } catch (error) {
      this.logger.error('Failed to fetch membership from MCOM Central:', error);
      return null;
    }
  }

  async getUserContext(userId: string) {
    try {
      const headers = this.getHmacHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/data/user?userId=${encodeURIComponent(userId)}`,
        { headers },
      );

      if (!response.ok) {
        this.logger.error(
          `MCOM Central user context returned ${response.status} for userId=${userId}`,
        );
        return null;
      }

      const body = await response.json();
      return body.data || null;
    } catch (error) {
      this.logger.error(
        'Failed to fetch user context from MCOM Central:',
        error,
      );
      return null;
    }
  }

  async getIntrospectedEntitlement(
    userId: string,
    accessToken?: string,
  ): Promise<any | null> {
    try {
      let response: Response;
      if (accessToken) {
        response = await fetch(`${this.baseUrl}/api/v1/auth/sso/entitlement`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Client-Id': this.serviceId,
            'Content-Type': 'application/json',
          },
        });
      } else {
        const headers = this.getHmacHeaders();
        if (this.apiSecret) {
          headers['X-API-Key'] = this.apiSecret;
        }
        response = await fetch(
          `${this.baseUrl}/api/v1/auth/sso/entitlement?client_id=${encodeURIComponent(
            this.serviceId,
          )}&user_id=${encodeURIComponent(userId)}`,
          { headers },
        );
      }

      if (!response.ok) {
        this.logger.warn(
          `MCOM Central entitlement introspection returned ${response.status} for userId=${userId}`,
        );
        return null;
      }

      const body = await response.json();
      return body.entitlement || body.data?.entitlement || null;
    } catch (error) {
      this.logger.error(
        'Failed to introspect entitlement from MCOM Central:',
        error,
      );
      return null;
    }
  }

  async getUserPackages(
    userId: string,
    accessToken?: string,
  ): Promise<{
    tierId: string | null;
    isActive: boolean;
    packages: any[];
    entitlement?: any | null;
    accessType?: string;
    reason?: string;
    upgradeUrl?: string;
    isTrial?: boolean;
    programmeTasks?: any[];
    plan?: any;
    quotas?: Record<string, unknown>;
  } | null> {
    // 1. Try real-time entitlement introspection first (Standard Protocol Version: 2026-10-01)
    try {
      const entitlement = await this.getIntrospectedEntitlement(
        userId,
        accessToken,
      );
      if (entitlement && entitlement.access) {
        const hasAccess = Boolean(entitlement.access.hasAccess);
        const tierId =
          entitlement.plan?.planId ||
          entitlement.membershipContext?.membershipLevel ||
          null;
        const isTrial = entitlement.access.accessType === 'TRIAL_PROGRAMME';

        return {
          tierId,
          isActive: hasAccess,
          packages: [],
          entitlement,
          accessType: entitlement.access.accessType,
          reason: entitlement.access.reason,
          upgradeUrl: entitlement.access.upgradeUrl,
          isTrial,
          programmeTasks: entitlement.trialContext?.programmeTasks || [],
          plan: entitlement.plan,
          quotas: entitlement.plan?.quotas || {},
        };
      }
    } catch (err) {
      this.logger.warn(
        `Introspection failed for userId=${userId}, attempting legacy query: ${err instanceof Error ? err.message : err}`,
      );
    }

    // 2. Legacy fallback: query /api/v1/data/user?userId=...
    try {
      const headers = this.getHmacHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/data/user?userId=${encodeURIComponent(userId)}`,
        { headers },
      );

      if (!response.ok) {
        this.logger.error(
          `MCOM Central returned ${response.status} for userId=${userId}`,
        );
        return null;
      }

      const body = await response.json();
      const userData = body.data;

      if (!userData) return null;

      const packages = userData.packages || [];

      // Find the MCOM Mall package
      const mallPackage = Array.isArray(packages)
        ? packages.find(
            (pkg: any) =>
              (pkg.platformName || pkg.platform)?.toLowerCase() ===
                'mcom mall' ||
              (pkg.platformName || pkg.platform)?.toLowerCase() === 'mall',
          )
        : null;

      if (mallPackage) {
        const isActive = mallPackage.status === 'active';
        const tierId =
          mallPackage.externalPlanId ||
          mallPackage.packageId ||
          mallPackage.tierId ||
          null;
        return { tierId, isActive, packages };
      }

      // Check membership status from business profile
      const membershipStatus =
        userData.membershipStatus || userData.businessProfile?.membershipStatus;
      if (membershipStatus && membershipStatus.toLowerCase() === 'active') {
        const tierId =
          userData.tierId || userData.businessProfile?.membershipLevel || null;
        return { tierId, isActive: true, packages };
      }

      return { tierId: null, isActive: false, packages };
    } catch (error) {
      this.logger.error(
        'Failed to fetch user packages from MCOM Central:',
        error,
      );
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const headers = this.getHmacHeaders();
      const response = await fetch(`${this.baseUrl}/health`, { headers });
      return response.ok;
    } catch {
      return false;
    }
  }
}
