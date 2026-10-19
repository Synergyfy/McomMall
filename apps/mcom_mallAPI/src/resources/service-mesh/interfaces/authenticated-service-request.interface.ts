import { Request } from 'express';
import { JWTPayload } from 'jose';

/**
 * Claims carried by an MCOM ecosystem service token.
 *
 * - `typ: "service"`   → pure M2M: `sub` is the calling app's clientId.
 * - `typ: "delegated"` → user delegation: `sub` is the user id and
 *   `act.sub` is the calling app's clientId.
 */
export interface ServiceTokenClaims extends JWTPayload {
  typ?: string;
  scope?: string | string[];
  act?: { sub?: string };
  email?: string;
  role?: string;
  businessId?: string | null;
}

export interface ServiceCallerContext {
  /** Calling app's clientId (e.g. "mcom-rewards"). */
  callerAppId: string;
  /** True when the token was minted via RFC 8693 token exchange. */
  isDelegated: boolean;
  /** Present only for delegated calls — the user on whose behalf we act. */
  userId?: string;
  email?: string;
  /** Granted scopes parsed from the `scope` claim. */
  scopes: string[];
  payload: ServiceTokenClaims;
}

/** Express request augmented by the inbound ServiceAuthGuard. */
export interface AuthenticatedServiceRequest extends Request {
  serviceCaller?: ServiceCallerContext;
}

/** Shape of an entry in Central's public ecosystem registry. */
export interface EcosystemServiceEntry {
  clientId: string;
  name: string;
  platformSlug: string | null;
  baseUrl: string | null;
  appUrl: string | null;
  scopes: string[];
  /** Ingress policy — peers permitted to call this app. Empty = deny all; `*` = any. */
  allowedCallers: string[];
  isSystemApp: boolean;
}
