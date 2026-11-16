import { ValueTransformer } from 'typeorm';

/**
 * Money is stored in the database as integer minor units (pence), while the
 * application (services, DTOs and the HTTP API) continues to work in pounds.
 *
 * Every money column must use one of the transformers below so the conversion
 * happens exactly once, at the persistence boundary. This keeps financial
 * values exact in Postgres (no floating point / rounding drift) without
 * changing the API contract consumed by the frontends.
 */
export const PENCE_PER_POUND = 100;

export function poundsToPence(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return null;
  }
  // `toPrecision` removes binary floating point artefacts (e.g.
  // 1.005 * 100 === 100.49999999999999) before rounding to the nearest penny.
  const scaled = Number((numeric * PENCE_PER_POUND).toPrecision(12));
  return Math.round(scaled);
}

export function penceToPounds(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return numeric / PENCE_PER_POUND;
}

/** Converts a raw pence aggregate (e.g. `SUM(amount)`) back to pounds. */
export function penceAggregateToPounds(
  value: number | string | null | undefined,
): number {
  return penceToPounds(value) ?? 0;
}

export const moneyTransformer: ValueTransformer = {
  // Keep `undefined` untouched so TypeORM can omit the column and let database
  // defaults apply. Only explicit values are converted.
  to: (value: number | string | null | undefined) =>
    value === undefined ? undefined : poundsToPence(value),
  from: (value: number | string | null | undefined) => penceToPounds(value),
};

export const moneyArrayTransformer: ValueTransformer = {
  to: (values: number[] | null | undefined) =>
    values === undefined
      ? undefined
      : Array.isArray(values)
        ? values.map((value) => poundsToPence(value))
        : values,
  from: (values: Array<number | string> | null | undefined) =>
    Array.isArray(values)
      ? values.map((value) => penceToPounds(value))
      : values,
};

/**
 * Money keys that can appear inside jsonb columns (product variants, service
 * variants/tiers and pricing rules). Everything else in those structures is
 * left untouched.
 */
const JSON_MONEY_KEYS = new Set([
  'price',
  'salePrice',
  'priceModifier',
  'nightSurcharge',
  'emergencySurcharge',
  'holidaySurcharge',
  'travelFee',
]);

function mapJsonMoney(
  node: any,
  convert: (value: number | string | null | undefined) => number | null,
): any {
  if (Array.isArray(node)) {
    return node.map((item) => mapJsonMoney(item, convert));
  }
  if (node && typeof node === 'object') {
    const mapped: Record<string, any> = {};
    for (const [key, value] of Object.entries(node)) {
      if (
        JSON_MONEY_KEYS.has(key) &&
        (typeof value === 'number' || typeof value === 'string')
      ) {
        mapped[key] = convert(value as number | string);
      } else if (value && typeof value === 'object') {
        mapped[key] = mapJsonMoney(value, convert);
      } else {
        mapped[key] = value;
      }
    }
    return mapped;
  }
  return node;
}

/** Converts known money keys inside a jsonb payload to/from pence. */
export const moneyJsonTransformer: ValueTransformer = {
  to: (value: any) =>
    value === null || value === undefined
      ? value
      : mapJsonMoney(value, poundsToPence),
  from: (value: any) =>
    value === null || value === undefined
      ? value
      : mapJsonMoney(value, penceToPounds),
};
