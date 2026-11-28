/**
 * TakeAds prices are entered and returned in GBP pounds, but stored as integer
 * pence. Keeping the conversion in one place prevents double-conversion in
 * admin responses, public responses and create/update writes.
 */
export function poundsToPence(value?: number | null): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value) * 100);
}

export function penceToPounds(value?: number | null): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value)) / 100;
}
