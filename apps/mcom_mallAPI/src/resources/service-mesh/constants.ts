/**
 * MCOM Ecosystem Service Mesh constants.
 *
 * The mesh is a zero-hop / direct peer-to-peer model: MCOM Central issues
 * short-lived RS256 service tokens (control plane) which apps verify offline
 * via cached JWKS. MCOM is never in the data path.
 */
export const SERVICE_MESH_ISSUER = 'mcom-solutions';

/** How long the public ecosystem service registry is cached locally (ms). */
export const ECOSYSTEM_SERVICES_CACHE_TTL_MS = 60_000;

/** Refresh a service token when it is within this window of expiring (ms). */
export const SERVICE_TOKEN_SAFETY_MARGIN_MS = 60_000;

/** Fallback TTL if Central does not return `expires_in`. */
export const DEFAULT_SERVICE_TOKEN_TTL_SECONDS = 300;

/** Default ecosystem clientId for the MCOM Rewards peer. */
export const DEFAULT_REWARDS_CLIENT_ID = 'mcom-rewards';

// ─── Rewards peer scopes (scopes THIS app requests from Central) ─────────────
export const SERVICE_SCOPE_REWARDS_READ = 'rewards:read';
export const SERVICE_SCOPE_REWARDS_ISSUE = 'rewards:issue';

// ─── Mall peer scopes (scopes a caller requests to call THIS app) ────────────
// Declared on `mcom-mall` in the Central Console and mirrored by every caller
// (e.g. MCOM Rewards requests `mall:read` / `mall:write` when calling mall).
export const SERVICE_SCOPE_MALL_READ = 'mall:read';
export const SERVICE_SCOPE_MALL_WRITE = 'mall:write';
