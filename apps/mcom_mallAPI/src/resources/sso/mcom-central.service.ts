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

  /**
   * Secret used to sign legacy service-to-service HMAC requests. Must match the
   * secret MCOM Central has issued for this client (`MCOM_MALL_SECRET` there).
   */
  private getHmacSecret(): string {
    return (
      process.env.MCOM_MALL_HMAC_SECRET ||
      process.env.MCOM_HMAC_SECRET ||
      this.apiSecret
    );
  }

  /**
   * Value sent as `X-API-Key` when introspecting entitlements without a bearer
   * token. Must match this client's `apiKey` on MCOM Central.
   */
  private getClientApiKey(): string {
    return (
      process.env.MCOM_CLIENT_API_KEY ||
      process.env.MCOM_API_KEY ||
      this.apiSecret
    );
  }

  private getHmacHeaders(): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `${this.serviceId}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.getHmacSecret())
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

  /**
   * Resolves the local mall Central has assigned to a user (or the closest
   * mall to their postcode). Businesses, customers and affiliates are all
   * assigned to a City > Borough > High Street > Local Mall hierarchy in
   * Central, which is the canonical source for this page.
   */
  async getLocalMall(params: {
    userId?: string | null;
    postcode?: string | null;
  }): Promise<any | null> {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', params.userId);
    if (params.postcode) query.set('postcode', params.postcode);
    if (![...query.keys()].length) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const headers = this.getHmacHeaders();
      const response = await fetch(
        `${this.baseUrl}/api/v1/data/local-mall?${query.toString()}`,
        { headers, signal: controller.signal },
      );

      if (!response.ok) {
        this.logger.error(
          `MCOM Central local mall lookup returned ${response.status} for ` +
            `userId=${params.userId ?? '-'} postcode=${params.postcode ?? '-'}`,
        );
        return null;
      }

      const body = await response.json();
      return body.data || null;
    } catch (error) {
      this.logger.error('Failed to fetch local mall from MCOM Central:', error);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Exact Central local-mall assignment when available, otherwise the public
   * postcode resolver. The public endpoint returns only names (no Central ids),
   * but it lets the marketplace build a usable City → Borough → High Street →
   * Local Mall tree even when the HMAC secret is not yet aligned.
   */
  async getLocalMallOrResolvePostcode(params: {
    userId?: string | null;
    postcode?: string | null;
  }): Promise<any | null> {
    const exact = await this.getLocalMall(params);
    if (exact) return exact;
    if (!params.postcode) return null;
    return this.resolvePostcodeHierarchy(params.postcode);
  }

  async resolvePostcodeHierarchy(postcode: string): Promise<any | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/geography/validate-postcode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcode }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `MCOM Central postcode resolver returned ${response.status} for ${postcode}`,
        );
        return null;
      }

      const body = await response.json();
      const data = body?.data;
      if (!data?.postcode) return null;

      return {
        city: data.city
          ? { id: null, name: data.city }
          : null,
        borough: data.borough
          ? { id: null, name: data.borough }
          : null,
        highStreet: data.highStreet
          ? {
              id: null,
              name: data.highStreet,
              latitude: data.latitude ?? null,
              longitude: data.longitude ?? null,
            }
          : null,
        mall: data.localMall
          ? { id: null, name: data.localMall }
          : null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      };
    } catch (error) {
      this.logger.warn(
        `MCOM Central postcode resolver failed for ${postcode}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    } finally {
      clearTimeout(timeout);
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
        const clientApiKey = this.getClientApiKey();
        if (clientApiKey) {
          headers['X-API-Key'] = clientApiKey;
        }
        response = await fetch(
          `${this.baseUrl}/api/v1/auth/sso/entitlement?client_id=${encodeURIComponent(
            this.serviceId,
          )}&user_id=${encodeURIComponent(userId)}`,
          { headers },
        );
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        this.logger.warn(
          `MCOM Central entitlement introspection returned ${response.status} for userId=${userId} ` +
            `(client_id=${this.serviceId})${errorBody ? `: ${errorBody.slice(0, 200)}` : ''}`,
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
