/**
 * Each merchant should have a single business profile owned by MCOM Central.
 * Prefer the Central-synced listing if legacy data contains more than one.
 */
export function pickCentralBusiness<
  T extends { centralBusinessId?: string | null },
>(listings?: T[] | null): T | undefined {
  return listings?.find(listing => Boolean(listing.centralBusinessId)) ?? listings?.[0];
}

/** Minimal shape needed to read the taxonomy mirrored from MCOM Central. */
export interface BusinessTaxonomySource {
  sectorId?: string | null;
  sector?: { id?: string | null; name?: string | null } | null;
  categoryId?: string | null;
  category?: { id?: string | null; name?: string | null } | null;
  centralCategory?: string | null;
  subCategoryId?: string | null;
  subCategory?: { id?: string | null; name?: string | null } | null;
  centralSubCategory?: string | null;
  industry?: string | null;
}

export interface BusinessTaxonomy {
  sectorId: string;
  sectorName: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
}

const clean = (value?: string | null): string => (value ?? '').trim();

/**
 * Products and services inherit their classification from the merchant's
 * MCOM Central business profile. The mall mirrors Central's category labels in
 * `centralCategory` / `centralSubCategory`; fall back to the linked taxonomy
 * rows for older listings.
 */
export function getBusinessTaxonomy(
  business?: BusinessTaxonomySource | null,
): BusinessTaxonomy {
  return {
    sectorId: clean(business?.sectorId || business?.sector?.id),
    sectorName: clean(business?.sector?.name || business?.industry),
    categoryId: clean(business?.categoryId || business?.category?.id),
    categoryName: clean(business?.centralCategory || business?.category?.name),
    subCategoryId: clean(business?.subCategoryId || business?.subCategory?.id),
    subCategoryName: clean(
      business?.centralSubCategory || business?.subCategory?.name,
    ),
  };
}
