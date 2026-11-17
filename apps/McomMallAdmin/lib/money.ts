/**
 * Money helpers shared by the admin dashboard.
 *
 * The API and all DTOs use pounds (e.g. `12.5` means £12.50), while the
 * database stores integer pence. `formatMoney` is the one place UI code should
 * turn an API amount into a display string, and `toPence`/`fromPence` are
 * available for any screen that needs to work with minor units directly.
 */
export const CURRENCY = '£';
export const PENCE_PER_POUND = 100;

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(numeric) ? numeric : null;
}

/** Convert a pounds amount (API/DTO value) to integer pence. */
export function toPence(
  value: number | string | null | undefined,
): number | null {
  const numeric = toNumber(value);
  return numeric === null ? null : Math.round(numeric * PENCE_PER_POUND);
}

/** Convert integer pence to a pounds number. */
export function fromPence(
  value: number | string | null | undefined,
): number | null {
  const numeric = toNumber(value);
  return numeric === null ? null : numeric / PENCE_PER_POUND;
}

export interface FormatMoneyOptions {
  /** Prefix with the currency symbol. Defaults to true. */
  symbol?: boolean;
  /** Minimum fraction digits. Defaults to 2. */
  minimumFractionDigits?: number;
  /** Maximum fraction digits. Defaults to 2. */
  maximumFractionDigits?: number;
}

/** Format a pounds amount for display, e.g. `12.5` -> `£12.50`. */
export function formatMoney(
  value: number | string | null | undefined,
  options: FormatMoneyOptions = {},
): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return `${options.symbol === false ? '' : CURRENCY}0.00`;
  }
  const digits = {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  };
  const formatted = numeric.toLocaleString('en-GB', digits);
  return `${options.symbol === false ? '' : CURRENCY}${formatted}`;
}

/** Format an integer pence amount for display, e.g. `1250` -> `£12.50`. */
export function formatPence(
  value: number | string | null | undefined,
  options: FormatMoneyOptions = {},
): string {
  return formatMoney(fromPence(value), options);
}

/**
 * Parse a user-entered pounds string into a pounds number.
 * Accepts `£1,234.50`, `1234.5` and an empty string (returns 0).
 */
export function parseMoneyInput(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const numeric =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}
