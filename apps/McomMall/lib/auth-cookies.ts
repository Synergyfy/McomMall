import Cookies from 'js-cookie';

/**
 * Shared auth cookie helpers for the MCOM Mall frontends.
 *
 * Cookie names are prefixed with `mcom_mall_` because cookies are scoped by
 * host, not port. MCOM Rewards (and other MCOM apps) run on the same host in
 * development, so generic `access`/`refresh` names caused each app to
 * overwrite and clear the other's session.
 */

export const ACCESS_TOKEN_COOKIE = 'mcom_mall_access';
export const REFRESH_TOKEN_COOKIE = 'mcom_mall_refresh';
export const USER_ID_COOKIE = 'mcom_mall_userId';
export const USER_ROLE_COOKIE = 'mcom_mall_userRole';
export const PACKAGE_INFO_COOKIE = 'mcom_mall_packageInfo';
export const IS_TRIAL_COOKIE = 'mcom_mall_is_trial';
export const MCOM_PLAN_COOKIE = 'mcom_mall_mcom_plan';

export const ACCESS_COOKIE_DAYS = 1;
export const REFRESH_COOKIE_DAYS = 7;
export const USER_COOKIE_DAYS = 7;

const isSecureContext = () =>
  typeof window !== 'undefined' && window.location.protocol === 'https:';

const cookieOptions = (days: number): Cookies.CookieAttributes => ({
  path: '/',
  sameSite: 'lax',
  secure: isSecureContext(),
  expires: days,
});

export interface UserMeta {
  userId?: string | null;
  userRole?: string | null;
  packageInfo?: { planType: string } | null;
  isTrial?: boolean;
  planId?: string | null;
}

/** Persist the access and/or refresh token for the mall session. */
export function setAuthTokens(
  accessToken?: string | null,
  refreshToken?: string | null
): void {
  if (typeof window === 'undefined') return;

  if (accessToken) {
    Cookies.set(
      ACCESS_TOKEN_COOKIE,
      accessToken,
      cookieOptions(ACCESS_COOKIE_DAYS)
    );
  }

  if (refreshToken) {
    Cookies.set(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      cookieOptions(REFRESH_COOKIE_DAYS)
    );
  }
}

/** Persist the non-token user cookies read back into the Redux store. */
export function setUserMeta(meta: UserMeta): void {
  if (typeof window === 'undefined') return;

  if (meta.userId) {
    Cookies.set(USER_ID_COOKIE, meta.userId, cookieOptions(USER_COOKIE_DAYS));
  }

  if (meta.userRole) {
    Cookies.set(
      USER_ROLE_COOKIE,
      meta.userRole,
      cookieOptions(USER_COOKIE_DAYS)
    );
  }

  if (typeof meta.isTrial === 'boolean') {
    Cookies.set(
      IS_TRIAL_COOKIE,
      meta.isTrial ? 'true' : 'false',
      cookieOptions(USER_COOKIE_DAYS)
    );
  }

  if (meta.planId) {
    Cookies.set(MCOM_PLAN_COOKIE, meta.planId, cookieOptions(USER_COOKIE_DAYS));
  }

  if (meta.packageInfo) {
    Cookies.set(
      PACKAGE_INFO_COOKIE,
      JSON.stringify(meta.packageInfo),
      cookieOptions(USER_COOKIE_DAYS)
    );
  }
}

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_COOKIE);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_COOKIE);
}

export function getUserId(): string | undefined {
  return Cookies.get(USER_ID_COOKIE);
}

export function getUserRole(): string | undefined {
  return Cookies.get(USER_ROLE_COOKIE);
}

export function getPackageInfo(): string | undefined {
  return Cookies.get(PACKAGE_INFO_COOKIE);
}

export function getIsTrial(): string | undefined {
  return Cookies.get(IS_TRIAL_COOKIE);
}

export function getPlanId(): string | undefined {
  return Cookies.get(MCOM_PLAN_COOKIE);
}

/** Remove only the mall's auth cookies; other MCOM apps keep theirs. */
export function clearAuthCookies(): void {
  const names = [
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    USER_ID_COOKIE,
    USER_ROLE_COOKIE,
    PACKAGE_INFO_COOKIE,
    IS_TRIAL_COOKIE,
    MCOM_PLAN_COOKIE,
  ];

  for (const name of names) {
    Cookies.remove(name, { path: '/' });
  }
}
