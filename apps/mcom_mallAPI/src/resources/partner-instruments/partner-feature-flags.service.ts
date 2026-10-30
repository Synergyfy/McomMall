import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function asBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

/**
 * Feature flags for the Rewards partner surface.
 *
 * `MCOM_REWARDS_MESH_ENABLED` is the master switch: when it is false every
 * partner feature is disabled, regardless of the individual flags.
 */
@Injectable()
export class PartnerFeatureFlagsService {
  constructor(private readonly configService: ConfigService) {}

  isMeshEnabled(): boolean {
    const raw = this.configService.get<string>('MCOM_REWARDS_MESH_ENABLED');
    if (raw === undefined || raw === null || raw === '') return true;
    return String(raw).toLowerCase() !== 'false';
  }

  isTemplatesEnabled(): boolean {
    if (!this.isMeshEnabled()) return false;
    return asBool(
      this.configService.get<string>('MALL_PARTNER_TEMPLATES_ENABLED'),
      false,
    );
  }

  isScopedInstrumentsEnabled(): boolean {
    if (!this.isMeshEnabled()) return false;
    return asBool(
      this.configService.get<string>(
        'MALL_PARTNER_SCOPED_INSTRUMENTS_ENABLED',
      ),
      false,
    );
  }

  isGlobalCatalogEnabled(): boolean {
    if (!this.isMeshEnabled()) return false;
    return asBool(
      this.configService.get<string>('MALL_PARTNER_GLOBAL_CATALOG_ENABLED'),
      false,
    );
  }

  /**
   * Platform callers are allowed cross-tenant reads/writes. A delegated
   * business token (with a `businessId` claim) is never a platform caller.
   */
  isPlatformCaller(caller: {
    callerAppId?: string;
    payload?: {
      role?: string;
      businessId?: string | null;
      act?: { sub?: string };
    };
  }): boolean {
    const configured = (
      this.configService.get<string>('MCOM_PLATFORM_CALLERS') || ''
    )
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (configured.length > 0 && configured.includes(caller.callerAppId ?? '')) {
      return true;
    }

    const payload = caller.payload;
    if (!payload) return false;
    if (payload.role === 'admin' || payload.role === 'super_admin') {
      return true;
    }
    if ((payload as any).platformAdmin === true) return true;

    return false;
  }
}
