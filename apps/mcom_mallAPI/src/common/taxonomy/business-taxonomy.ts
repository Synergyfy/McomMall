import type { Business } from '../../resources/listings/entities/listing.entity';

/**
 * Human-readable taxonomy mirrored from the merchant's MCOM Central business
 * profile. Products and services inherit these labels rather than accepting
 * arbitrary values from the client.
 */
export interface BusinessTaxonomyLabels {
  sector: string;
  category: string;
  subCategory: string;
}

const clean = (value?: string | null): string => (value ?? '').trim();

export function resolveBusinessTaxonomy(
  business?: Partial<Business> | null,
): BusinessTaxonomyLabels {
  return {
    sector: clean(business?.sector?.name || business?.industry),
    category: clean(
      business?.centralCategory || business?.category?.name,
    ),
    subCategory: clean(
      business?.centralSubCategory || business?.subCategory?.name,
    ),
  };
}
