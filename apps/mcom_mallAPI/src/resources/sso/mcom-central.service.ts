import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class McomCentralService {
  private readonly logger = new Logger(McomCentralService.name);
  private readonly baseUrl: string;
  private readonly serviceId: string;
  private readonly apiSecret: string;

  constructor() {
    this.baseUrl =
      process.env.MCOM_SOLUTIONS_BACKEND_URL || 'http://localhost:3010';
    this.serviceId = process.env.SSO_CLIENT_ID || 'mcom-mall';
    this.apiSecret = process.env.SSO_API_SECRET || '';
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
              ((pkg.platformName || pkg.platform)?.toLowerCase() === 'mcom mall' ||
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
      this.logger.error(
        'Failed to fetch membership from MCOM Central:',
        error,
      );
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

  async getUserPackages(
    userId: string,
  ): Promise<{ tierId: string | null; isActive: boolean; packages: any[] } | null> {
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

      // 1. Find the MCOM Mall package
      const mallPackage = Array.isArray(packages)
        ? packages.find(
            (pkg: any) =>
              (pkg.platformName || pkg.platform)?.toLowerCase() === 'mcom mall' ||
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

      // 2. Fallback: Check membership status from business profile (most reliable)
      const membershipStatus =
        userData.membershipStatus || userData.businessProfile?.membershipStatus;
      if (membershipStatus && membershipStatus.toLowerCase() === 'active') {
        const tierId =
          userData.tierId ||
          userData.businessProfile?.membershipLevel ||
          null;
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
