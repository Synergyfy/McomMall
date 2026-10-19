import { SetMetadata } from '@nestjs/common';

export const REQUIRED_SERVICE_SCOPES_KEY = 'requiredServiceScopes';

/**
 * Declare the ecosystem scopes a partner route requires, e.g.
 * `@RequireServiceScopes(SERVICE_SCOPE_REWARDS_READ)`.
 * Enforced by the ServiceScopesGuard.
 */
export const RequireServiceScopes = (...scopes: string[]) =>
  SetMetadata(REQUIRED_SERVICE_SCOPES_KEY, scopes);
