'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import api from '@/service/api';
import { PLATFORM_BUSINESS_ID } from '@/lib/platform-business';

interface AdminProductBusinessListing {
  id: string;
  centralBusinessId: string;
  businessName: string;
  industry?: string | null;
  centralCategory?: string | null;
  centralSubCategory?: string | null;
  sector: { id: string; name: string };
  category: { id: string; name: string };
  subCategory: { id: string; name: string };
  location?: { address?: string };
  sellingModes?: string[];
  productSellerProfile?: { sellingModes?: string[] };
}

/**
 * Business merchants inherit their MCOM Central business from `listings/mine`.
 * Admin users do not own a merchant listing, so the platform business is mapped
 * into the same shape the copied wizard already consumes. The ID is always the
 * configured platform business so admin-created products stay in their own
 * origin group even when the admin business list is unavailable.
 */
export function useAdminWizardBusiness() {
  const query = useGetAdminBusinesses({ page: 1, limit: 100 });

  const platformBusiness = query.data?.data.find(
    (business) => business.id === PLATFORM_BUSINESS_ID,
  );

  const listing: AdminProductBusinessListing = {
    id: PLATFORM_BUSINESS_ID,
    centralBusinessId: PLATFORM_BUSINESS_ID,
    businessName: platformBusiness?.name ?? 'MCOM Mall Admin',
    industry: platformBusiness?.sector,
    centralCategory: platformBusiness?.category,
    centralSubCategory: '',
    sector: {
      id: platformBusiness?.sector ?? '',
      name: platformBusiness?.sector ?? '',
    },
    category: {
      id: platformBusiness?.category ?? '',
      name: platformBusiness?.category ?? '',
    },
    subCategory: { id: platformBusiness?.category ?? '', name: '' },
    location: { address: platformBusiness?.address },
    sellingModes: ['pickup', 'shipping'],
    productSellerProfile: { sellingModes: ['pickup', 'shipping'] },
  };

  return {
    data: { data: [listing] },
    isLoading: query.isLoading,
  };
}

/** Wrap the existing product endpoint without changing backend behavior. */
export function useAddWizardProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/product', {
        ...payload,
        businessId: PLATFORM_BUSINESS_ID,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_PRODUCTS'] });
      queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_PRODUCT_STATS'] });
      queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
    },
  });
}
