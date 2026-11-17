'use client';

import { useMemo } from 'react';
import { useGetUserListings } from '@/service/listings/hook';
import { pickCentralBusiness } from '@/lib/central-business';

/**
 * Resolves the merchant's canonical business profile (the MCOM Central one
 * when multiple legacy listings exist).
 */
export const useBusinessId = () => {
  const query = useGetUserListings(1, 50);
  const listings = query.data?.data ?? [];
  const business = useMemo(() => pickCentralBusiness(listings), [listings]);

  return {
    ...query,
    business,
    businessId: business?.id,
    businessName: business?.businessName,
  };
};
