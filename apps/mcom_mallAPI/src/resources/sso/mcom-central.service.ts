import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class McomCentralService {
  private readonly logger = new Logger(McomCentralService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.MCOM_CENTRAL_BASE_URL || 'http://localhost:3010';
    this.apiKey = process.env.SSO_API_KEY || '';
  }

  async getUserMembership(userId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/data/user?userId=${encodeURIComponent(userId)}`,
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
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
              pkg.platformName === 'MCOM Mall' && pkg.status === 'active',
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

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: { 'X-Api-Key': this.apiKey },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
