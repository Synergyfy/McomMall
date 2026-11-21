const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://mcom-mall-api.vercel.app/api/v1';

/** API base including the `/api/v1` prefix. */
export const MALL_API_URL = RAW_API_URL.replace(/\/+$/, '');
/** API origin (no `/api/v1`), used for relative Next/API assets. */
export const MALL_API_ORIGIN = MALL_API_URL.replace(/\/api\/v1$/, '');

/** Central hosts uploads at `<host>/uploads/<path>`, gated behind a JWT. */
const CENTRAL_UPLOAD_PATTERN = /(?:^|\/)uploads\/(.+)$/i;

/**
 * Turn a stored business image URL into something the browser can actually
 * load.
 *
 * Central's `/uploads` requires a Bearer token, so those URLs are rewritten to
 * the Mall's public media proxy (`/api/v1/media/central?path=…`), which fetches
 * the bytes server-side over the RS256 service mesh. Cloudinary and other
 * absolute URLs pass through untouched.
 */
export function resolveBusinessImageUrl(raw?: string | null): string | null {
  if (!raw) return null;

  const value = String(raw).trim();
  if (!value) return null;

  const uploadMatch = value.match(CENTRAL_UPLOAD_PATTERN);
  if (uploadMatch) {
    return `${MALL_API_URL}/media/central?path=${encodeURIComponent(
      uploadMatch[1],
    )}`;
  }

  if (value.startsWith('//')) return `https:${value}`;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (value.startsWith('/')) return value; // Next.js public asset
  return `/${value}`;
}
