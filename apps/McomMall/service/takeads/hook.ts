import { useMutation, useQuery } from '@tanstack/react-query';
import api, { baseURL } from '@/service/api';
import {
  BusinessTakeadsOfferPage,
  PublicTakeadsFilters,
  PublicTakeadsOffer,
  PublicTakeadsOfferPage,
} from './types';

const cleanBase = () =>
  baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

/** Format a source-supplied price without inventing a currency. */
export function formatTakeadsPrice(price?: number | null, currency?: string) {
  if (price == null) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(price);
  } catch {
    return `${currency || ''} ${price.toFixed(2)}`.trim();
  }
}

/** Public click-through URL: records a click, then redirects to TakeAds. */
export function getTakeadsClickUrl(
  offerId: string,
  options?: { source?: string; placement?: string },
) {
  const params = new URLSearchParams();
  if (options?.source) params.set('source', options.source);
  if (options?.placement) params.set('placement', options.placement);
  const query = params.toString();
  return `${cleanBase()}/takeads/offers/${offerId}/click${query ? `?${query}` : ''}`;
}

const getOffers = async (
  params: PublicTakeadsFilters,
): Promise<PublicTakeadsOfferPage> => {
  const { data } = await api.get('/takeads/offers', { params });
  return data;
};

export const useGetPublicTakeadsOffers = (
  params: PublicTakeadsFilters = {},
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['public-takeads-offers', params],
    queryFn: () => getOffers(params),
    enabled: options?.enabled ?? true,
  });

const getDeals = async (
  params: PublicTakeadsFilters,
): Promise<PublicTakeadsOfferPage> => {
  const { data } = await api.get('/takeads/deals', { params });
  return data;
};

export const useGetPublicTakeadsDeals = (
  params: PublicTakeadsFilters = {},
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['public-takeads-deals', params],
    queryFn: () => getDeals(params),
    enabled: options?.enabled ?? true,
  });

const getOffer = async (id: string): Promise<PublicTakeadsOffer> => {
  const { data } = await api.get(`/takeads/offers/${id}`);
  return data;
};

export const useGetPublicTakeadsOffer = (id?: string) =>
  useQuery({
    queryKey: ['public-takeads-offer', id],
    queryFn: () => getOffer(id as string),
    enabled: !!id,
  });

/**
 * Plan-only deals are never returned by /takeads/deals. This authenticated
 * facade lets the business dashboard show only deals targeted to its plan.
 */
const getBusinessDeals = async (
  params: PublicTakeadsFilters,
): Promise<BusinessTakeadsOfferPage> => {
  const { data } = await api.get('/takeads/business/deals', { params });
  return data;
};

export const useGetBusinessTakeadsDeals = (
  params: PublicTakeadsFilters = {},
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: ['business-takeads-deals', params],
    queryFn: () => getBusinessDeals(params),
    enabled: options?.enabled ?? true,
  });

export interface BusinessTakeadsClickInput {
  id: string;
  source?: string;
  placement?: string;
}

/**
 * A plain anchor cannot authenticate with the API's Authorization header, so
 * business clicks are posted first and the returned tracked URL is opened
 * only after the click has been recorded.
 */
export const useRecordBusinessTakeadsClick = () =>
  useMutation({
    mutationFn: async ({
      id,
      source,
      placement,
    }: BusinessTakeadsClickInput): Promise<{ url: string }> => {
      const { data } = await api.post(`/takeads/business/deals/${id}/click`, {
        source,
        placement,
      });
      return data;
    },
  });
