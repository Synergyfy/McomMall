'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import api from '@/service/api';
import { PLATFORM_BUSINESS_ID } from '@/lib/platform-business';
import type { CreateServiceDto } from './types';

interface AdminServiceBusinessListing {
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
  sellingModes: string[];
}

/**
 * The business flow reads the signed-in merchant's MCOM Central business from
 * `listings/mine`. Admin users do not own a merchant listing, so the admin
 * version maps the platform business into the same shape the copied wizard
 * already understands.
 */
export function useAdminWizardBusiness() {
  const query = useGetAdminBusinesses({ page: 1, limit: 100 });

  const platformBusiness = query.data?.data.find(
    (business) => business.id === PLATFORM_BUSINESS_ID,
  );

  const listing: AdminServiceBusinessListing = {
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
  };

  return {
    data: { data: [listing] },
    isLoading: query.isLoading,
  };
}

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * The admin service endpoint keeps its existing narrow DTO. The wizard still
 * collects the full business-flow payload for identical validation and UX;
 * only the final request is reduced to the fields the admin API accepts.
 */
const toAdminServicePayload = (payload: CreateServiceDto, draft: boolean) => ({
  name: payload.name,
  businessId: PLATFORM_BUSINESS_ID,
  description: payload.description || payload.shortDescription,
  category: payload.category,
  fixedPrice: toNumber(payload.fixedPrice ?? payload.price) ?? 0,
  duration: toNumber(payload.duration) ?? 0,
  status: draft ? 'inactive' : 'active',
});

function useInvalidateAdminServices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_SERVICES'] });
    queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_SERVICE_STATS'] });
  };
}

interface UpdateWizardServiceArgs {
  id: string;
  payload: CreateServiceDto;
  draft: boolean;
}

export function useAddWizardService() {
  const invalidate = useInvalidateAdminServices();

  return useMutation({
    mutationFn: async (payload: CreateServiceDto) => {
      const { data } = await api.post(
        '/admin/services',
        toAdminServicePayload(payload, false),
      );
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useSaveWizardServiceDraft() {
  const invalidate = useInvalidateAdminServices();

  return useMutation({
    mutationFn: async (payload: CreateServiceDto) => {
      const { data } = await api.post(
        '/admin/services',
        toAdminServicePayload(payload, true),
      );
      return data;
    },
    onSuccess: invalidate,
  });
}

/**
 * Drafts were created through the admin endpoint, but there is no admin update
 * endpoint. The ownership-protected service endpoint accepts the same narrow
 * fields, so map to it without adding or changing any backend behavior.
 */
export function useUpdateWizardService() {
  const invalidate = useInvalidateAdminServices();

  return useMutation({
    mutationFn: async ({ id, payload, draft }: UpdateWizardServiceArgs) => {
      const { data } = await api.patch(
        `/services/${id}`,
        toAdminServicePayload(payload, draft),
      );
      return data;
    },
    onSuccess: invalidate,
  });
}
