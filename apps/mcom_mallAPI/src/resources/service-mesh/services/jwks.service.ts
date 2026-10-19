import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { SERVICE_MESH_ISSUER } from '../constants';
import { ServiceTokenClaims } from '../interfaces/authenticated-service-request.interface';

/**
 * Verifies MCOM ecosystem service tokens OFFLINE using Central's public JWKS.
 *
 * The JWKS is fetched once from `{MCOM_SOLUTIONS_URL}/.well-known/jwks.json`
 * and cached/rotated in the background by jose. No request ever transits MCOM.
 */
@Injectable()
export class JwksService {
  private readonly logger = new Logger(JwksService.name);
  private readonly issuer: string;
  private jwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly configService: ConfigService) {
    this.issuer =
      this.configService.get<string>('MCOM_SERVICE_ISSUER') ||
      SERVICE_MESH_ISSUER;
  }

  private getSolutionsUrl(): string {
    const url =
      this.configService.get<string>('MCOM_SOLUTIONS_URL') ||
      'http://localhost:3010';
    return url.replace(/\/+$/, '');
  }

  private getJwks() {
    if (!this.jwks) {
      const jwksUrl = new URL(
        `${this.getSolutionsUrl()}/.well-known/jwks.json`,
      );
      this.jwks = createRemoteJWKSet(jwksUrl, {
        cooldownDuration: 30_000,
        cacheMaxAge: 600_000,
      });
      this.logger.log(`Service mesh JWKS set to ${jwksUrl.toString()}`);
    }
    return this.jwks;
  }

  /**
   * Verify signature, issuer and audience. Throws on any failure.
   * @param token raw JWT (no "Bearer " prefix)
   * @param audience this app's own clientId
   */
  async verifyServiceToken(
    token: string,
    audience: string,
  ): Promise<ServiceTokenClaims> {
    const { payload } = await jwtVerify(token, this.getJwks(), {
      issuer: this.issuer,
      audience,
      algorithms: ['RS256'],
    });
    return payload as ServiceTokenClaims;
  }
}
