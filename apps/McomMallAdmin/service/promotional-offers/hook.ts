import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { toast } from 'sonner';
import {
  AdminPromotionalOffer,
  AdminPromotionalOfferPage,
  AdminPromotionalOfferStats,
  AffiliateClickRow,
  AffiliateSummary,
  AffiliateTransactionRow,
  CreatePromotionalOfferPayload,
  PagedAffiliateRows,
  PromotionalOfferFilters,
} from './types';

const getStats = async (): Promise<AdminPromotionalOfferStats> => {
  const { data } = await api.get('/admin/promotional-offers/stats');
  return data;
};

export const useGetPromotionalOfferStats = () =>
  useQuery({
    queryKey: ['admin-promotional-offer-stats'],
    queryFn: getStats,
  });

const getOffers = async (
  filters: PromotionalOfferFilters,
): Promise<AdminPromotionalOfferPage> => {
  const { data } = await api.get('/admin/promotional-offers', {
    params: filters,
  });
  return data;
};

export const useGetPromotionalOffers = (
  filters: PromotionalOfferFilters = {},
) =>
  useQuery({
    queryKey: ['admin-promotional-offers', filters],
    queryFn: () => getOffers(filters),
  });

const getOffer = async (id: string): Promise<AdminPromotionalOffer> => {
  const { data } = await api.get(`/admin/promotional-offers/${id}`);
  return data;
};

export const useGetPromotionalOffer = (id?: string) =>
  useQuery({
    queryKey: ['admin-promotional-offer', id],
    queryFn: () => getOffer(id as string),
    enabled: !!id,
  });

const createOffer = async (
  payload: CreatePromotionalOfferPayload,
): Promise<AdminPromotionalOffer> => {
  const { data } = await api.post('/admin/promotional-offers', payload);
  return data;
};

export const useCreatePromotionalOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-promotional-offers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-promotional-offer-stats'],
      });
      toast.success('Promotional offer saved.');
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Could not save the promotional offer.',
      ),
  });
};

const updateOffer = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreatePromotionalOfferPayload>;
}): Promise<AdminPromotionalOffer> => {
  const { data } = await api.patch(
    `/admin/promotional-offers/${id}`,
    payload,
  );
  return data;
};

export const useUpdatePromotionalOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOffer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-promotional-offers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-promotional-offer', data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-promotional-offer-stats'],
      });
      toast.success('Promotional offer updated.');
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Could not update the promotional offer.',
      ),
  });
};

const deleteOffer = async (id: string) => {
  const { data } = await api.delete(`/admin/promotional-offers/${id}`);
  return data;
};

export const useDeletePromotionalOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-promotional-offers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-promotional-offer-stats'],
      });
      toast.success('Promotional offer archived.');
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Could not archive the promotional offer.',
      ),
  });
};

const getAffiliateSummary = async (): Promise<AffiliateSummary> => {
  const { data } = await api.get('/admin/affiliate/summary');
  return data;
};

export const useGetAffiliateSummary = () =>
  useQuery({
    queryKey: ['admin-affiliate-summary'],
    queryFn: getAffiliateSummary,
  });

const getClicks = async (params: {
  page?: number;
  limit?: number;
  businessId?: string;
  offerId?: string;
}): Promise<PagedAffiliateRows<AffiliateClickRow>> => {
  const { data } = await api.get('/admin/affiliate/clicks', { params });
  return data;
};

export const useGetAffiliateClicks = (params: {
  page?: number;
  limit?: number;
  businessId?: string;
  offerId?: string;
}) =>
  useQuery({
    queryKey: ['admin-affiliate-clicks', params],
    queryFn: () => getClicks(params),
  });

const getTransactions = async (params: {
  page?: number;
  limit?: number;
  businessId?: string;
  offerId?: string;
  status?: string;
}): Promise<PagedAffiliateRows<AffiliateTransactionRow>> => {
  const { data } = await api.get('/admin/affiliate/transactions', {
    params,
  });
  return data;
};

export const useGetAffiliateTransactions = (params: {
  page?: number;
  limit?: number;
  businessId?: string;
  offerId?: string;
  status?: string;
}) =>
  useQuery({
    queryKey: ['admin-affiliate-transactions', params],
    queryFn: () => getTransactions(params),
  });

const syncAwin = async (payload?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { data } = await api.post(
    '/admin/promotional-offers/affiliate/sync',
    payload || {},
  );
  return data;
};

export const useSyncAwin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncAwin,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-affiliate-summary'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-affiliate-transactions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-affiliate-clicks'],
      });
      toast.success(
        `Awin sync complete. ${data?.received ?? 0} transactions received.`,
      );
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Awin sync failed.',
      ),
  });
};
