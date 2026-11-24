import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { baseURL } from '@/service/api';
import {
  AffiliatePerformance,
  PromotionalCatalogue,
  PromotionalOffer,
  PromotionalOfferPage,
  PromotionalOfferingType,
} from './types';

const cleanBase = () =>
  baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

/** Public click-through URL that records attribution before redirecting. */
export function getPromotionalClickUrl(
  offerId: string,
  options?: { businessId?: string; campaignId?: string; source?: string },
) {
  const params = new URLSearchParams();
  params.set('ref', options?.businessId || 'platform');
  if (options?.businessId) params.set('businessId', options.businessId);
  if (options?.campaignId) params.set('campaignId', options.campaignId);
  if (options?.source) params.set('source', options.source);
  const query = params.toString();
  return `${cleanBase()}/promotional-offers/click/${offerId}${query ? `?${query}` : ''}`;
}

const getPublicOffers = async (params: {
  offeringType?: PromotionalOfferingType;
  businessId?: string;
  search?: string;
  sector?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PromotionalOfferPage> => {
  const { data } = await api.get('/promotional-offers/public', { params });
  return data;
};

export const useGetPublicPromotionalOffers = (
  params: {
    offeringType?: PromotionalOfferingType;
    businessId?: string;
    search?: string;
    sector?: string;
    category?: string;
    page?: number;
    limit?: number;
  },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['public-promotional-offers', params],
    queryFn: () => getPublicOffers(params),
    enabled: options?.enabled ?? true,
  });
};

const getMyCatalogue = async (
  offeringType?: PromotionalOfferingType,
): Promise<PromotionalCatalogue> => {
  const { data } = await api.get('/promotional-offers/catalog', {
    params: offeringType ? { offeringType } : undefined,
  });
  return data;
};

export const useGetMyPromotionalCatalogue = (
  offeringType?: PromotionalOfferingType,
) => {
  return useQuery({
    queryKey: ['my-promotional-catalogue', offeringType],
    queryFn: () => getMyCatalogue(offeringType),
  });
};

const importOffer = async (offerId: string): Promise<PromotionalOffer> => {
  const { data } = await api.post(`/promotional-offers/${offerId}/import`);
  return data;
};

export const useImportPromotionalOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-promotional-catalogue'],
      });
      queryClient.invalidateQueries({
        queryKey: ['public-promotional-offers'],
      });
      queryClient.invalidateQueries({ queryKey: ['affiliate-performance'] });
    },
  });
};

const removeOffer = async (offerId: string) => {
  const { data } = await api.delete(`/promotional-offers/${offerId}/import`);
  return data;
};

export const useRemovePromotionalOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-promotional-catalogue'],
      });
      queryClient.invalidateQueries({
        queryKey: ['public-promotional-offers'],
      });
      queryClient.invalidateQueries({ queryKey: ['affiliate-performance'] });
    },
  });
};

const getMyPerformance = async (): Promise<AffiliatePerformance> => {
  const { data } = await api.get('/promotional-offers/performance');
  return data;
};

export const useGetMyAffiliatePerformance = () => {
  return useQuery({
    queryKey: ['affiliate-performance'],
    queryFn: getMyPerformance,
  });
};
