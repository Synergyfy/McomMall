/**
 * Each merchant should have a single business profile owned by MCOM Central.
 * Prefer the Central-synced listing if legacy data contains more than one.
 */
export function pickCentralBusiness<
  T extends { centralBusinessId?: string | null },
>(listings?: T[] | null): T | undefined {
  return listings?.find(listing => Boolean(listing.centralBusinessId)) ?? listings?.[0];
}
