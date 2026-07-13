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
      process.env.MCOM_CENTRAL_BASE_URL || 'http://localhost:3010';
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
              pkg.platform?.toLowerCase() === 'mall' && pkg.status === 'active',
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
      const headers = this.getHmacHeaders();
      const response = await fetch(`${this.baseUrl}/health`, { headers });
      return response.ok;
    } catch {
      return false;
    }
  }
}
