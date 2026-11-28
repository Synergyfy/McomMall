import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/service/api';
import {
  CreateTakeadsOfferPayload,
  PagedTakeads,
  ResolveTakeadsLinkPayload,
  ResolveTakeadsLinkResult,
  TakeadsAction,
  TakeadsClickReport,
  TakeadsCoupon,
  TakeadsCouponFilters,
  TakeadsMcomClick,
  TakeadsMerchant,
  TakeadsMerchantDetail,
  TakeadsMerchantFilters,
  TakeadsOffer,
  TakeadsOfferFilters,
  TakeadsOfferPreview,
  TakeadsOverview,
  TakeadsProductPerformanceReport,
  TakeadsReportSummary,
  TakeadsSettings,
  TakeadsSyncRun,
  TakeadsSyncType,
  UpdateTakeadsOfferPayload,
} from './types';

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export const useGetTakeadsOverview = () =>
  useQuery({
    queryKey: ['takeads-overview'],
    queryFn: async (): Promise<TakeadsOverview> => {
      const { data } = await api.get('/admin/takeads/overview');
      return data;
    },
  });

export const useGetTakeadsSettings = () =>
  useQuery({
    queryKey: ['takeads-settings'],
    queryFn: async (): Promise<TakeadsSettings> => {
      const { data } = await api.get('/admin/takeads/settings');
      return data;
    },
  });

export const useGetTakeadsSyncRuns = () =>
  useQuery({
    queryKey: ['takeads-sync-runs'],
    queryFn: async (): Promise<TakeadsSyncRun[]> => {
      const { data } = await api.get('/admin/takeads/sync-runs');
      return data;
    },
  });

export const useTriggerTakeadsSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (type: TakeadsSyncType) => {
      const { data } = await api.post('/admin/takeads/sync', { type });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-overview'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-sync-runs'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-merchants'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-coupons'] });
      toast.success('TakeAds sync finished.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'TakeAds sync failed.')),
  });
};

export const useGetTakeadsMerchants = (filters: TakeadsMerchantFilters = {}) =>
  useQuery({
    queryKey: ['takeads-merchants', filters],
    queryFn: async (): Promise<PagedTakeads<TakeadsMerchant>> => {
      const { data } = await api.get('/admin/takeads/merchants', {
        params: filters,
      });
      return data;
    },
  });

export const useGetTakeadsMerchant = (id?: string) =>
  useQuery({
    queryKey: ['takeads-merchant', id],
    queryFn: async (): Promise<TakeadsMerchantDetail> => {
      const { data } = await api.get(`/admin/takeads/merchants/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useReviewTakeadsMerchant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        status: string;
        mcomSectorId?: string;
        mcomCategoryId?: string;
        mcomSubCategoryId?: string;
        reviewNote?: string;
      };
    }) => {
      const { data } = await api.patch(
        `/admin/takeads/merchants/${id}/review`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-merchants'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-merchant'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-overview'] });
      toast.success('Merchant review saved.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not save merchant review.')),
  });
};

export const useGetTakeadsCoupons = (filters: TakeadsCouponFilters = {}) =>
  useQuery({
    queryKey: ['takeads-coupons', filters],
    queryFn: async (): Promise<PagedTakeads<TakeadsCoupon>> => {
      const { data } = await api.get('/admin/takeads/coupons', {
        params: filters,
      });
      return data;
    },
  });

export const useGetTakeadsCoupon = (id?: string) =>
  useQuery({
    queryKey: ['takeads-coupon', id],
    queryFn: async (): Promise<TakeadsCoupon> => {
      const { data } = await api.get(`/admin/takeads/coupons/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useReviewTakeadsCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        approvalStatus?: string;
        publicationStatus?: string;
        adminDisabled?: boolean;
        reviewNote?: string;
      };
    }) => {
      const { data } = await api.patch(
        `/admin/takeads/coupons/${id}/review`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-coupon'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-overview'] });
      toast.success('Coupon updated.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not update coupon.')),
  });
};

export const useGetTakeadsOffers = (filters: TakeadsOfferFilters = {}) =>
  useQuery({
    queryKey: ['takeads-offers', filters],
    queryFn: async (): Promise<PagedTakeads<TakeadsOffer>> => {
      const { data } = await api.get('/admin/takeads/offers', {
        params: filters,
      });
      return data;
    },
  });

export const useGetTakeadsOffer = (id?: string) =>
  useQuery({
    queryKey: ['takeads-offer', id],
    queryFn: async (): Promise<TakeadsOffer> => {
      const { data } = await api.get(`/admin/takeads/offers/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useGetTakeadsOfferPreview = (id?: string) =>
  useQuery({
    queryKey: ['takeads-offer-preview', id],
    queryFn: async (): Promise<TakeadsOfferPreview> => {
      const { data } = await api.get(`/admin/takeads/offers/${id}/preview`);
      return data;
    },
    enabled: !!id,
  });

/**
 * Explicit Step 2 of the affiliate journey. It never creates an offer; it only
 * asks TakeAds for an eligible tracking URL and a subId for this placement.
 */
export const useResolveTakeadsLink = () =>
  useMutation({
    mutationFn: async (payload: ResolveTakeadsLinkPayload) => {
      const { data } = await api.post(
        '/admin/takeads/offers/resolve-url',
        payload,
      );
      return data as ResolveTakeadsLinkResult;
    },
    onSuccess: () => toast.success('Affiliate tracking link resolved.'),
    onError: (error: any) =>
      toast.error(errorMessage(error, 'TakeAds could not resolve this URL.')),
  });

export const useCreateTakeadsOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTakeadsOfferPayload) => {
      const { data } = await api.post('/admin/takeads/offers', payload);
      return data as TakeadsOffer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-offers'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-overview'] });
      toast.success('TakeAds offer created.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not create offer.')),
  });
};

export const useUpdateTakeadsOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTakeadsOfferPayload;
    }) => {
      const { data } = await api.patch(`/admin/takeads/offers/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-offers'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer-preview'] });
      toast.success('Offer saved.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not save offer.')),
  });
};

const offerAction = (
  id: string,
  action: 'approve' | 'publish' | 'pause' | 'withdraw',
) => api.patch(`/admin/takeads/offers/${id}/${action}`);

export const useTakeadsOfferAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: 'approve' | 'publish' | 'pause' | 'withdraw';
    }) => {
      const { data } = await offerAction(id, action);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-offers'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer-preview'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-overview'] });
      toast.success('Offer updated.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not update offer.')),
  });
};

export const useRejectTakeadsOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reviewNote,
    }: {
      id: string;
      reviewNote?: string;
    }) => {
      const { data } = await api.patch(`/admin/takeads/offers/${id}/reject`, {
        reviewNote,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-offers'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer-preview'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-overview'] });
      toast.success('Offer rejected.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not reject offer.')),
  });
};

export const useResolveTakeadsOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/admin/takeads/offers/${id}/resolve`);
      return data as TakeadsOffer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-offers'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-offer-preview'] });
      toast.success('Affiliate tracking link resolved.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not resolve the tracking link.')),
  });
};

export const useGetTakeadsReportSummary = (params: {
  from?: string;
  to?: string;
  merchantId?: string;
}) =>
  useQuery({
    queryKey: ['takeads-report-summary', params],
    queryFn: async (): Promise<TakeadsReportSummary> => {
      const { data } = await api.get('/admin/takeads/reports/summary', {
        params,
      });
      return data;
    },
  });

export const useGetTakeadsProductPerformance = (params: {
  from?: string;
  to?: string;
}) =>
  useQuery({
    queryKey: ['takeads-product-performance', params],
    queryFn: async (): Promise<TakeadsProductPerformanceReport> => {
      const { data } = await api.get('/admin/takeads/reports/products', {
        params,
      });
      return data;
    },
  });

export const useGetTakeadsActions = (params: {
  from?: string;
  to?: string;
  merchantId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['takeads-actions', params],
    queryFn: async (): Promise<PagedTakeads<TakeadsAction>> => {
      const { data } = await api.get('/admin/takeads/reports/actions', {
        params,
      });
      return data;
    },
  });

export const useGetTakeadsMcomClicks = (params: {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['takeads-mcom-clicks', params],
    queryFn: async (): Promise<PagedTakeads<TakeadsMcomClick>> => {
      const { data } = await api.get('/admin/takeads/reports/mcom-clicks', {
        params,
      });
      return data;
    },
  });

export const useGetTakeadsClickReports = (params: {
  from?: string;
  to?: string;
  merchantId?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['takeads-click-reports', params],
    queryFn: async (): Promise<PagedTakeads<TakeadsClickReport>> => {
      const { data } = await api.get('/admin/takeads/reports/takeads-clicks', {
        params,
      });
      return data;
    },
  });

export const useSyncTakeadsReports = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/admin/takeads/reports/sync');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['takeads-report-summary'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-actions'] });
      queryClient.invalidateQueries({ queryKey: ['takeads-click-reports'] });
      queryClient.invalidateQueries({
        queryKey: ['takeads-product-performance'],
      });
      toast.success('TakeAds reports synced.');
    },
    onError: (error: any) =>
      toast.error(errorMessage(error, 'Could not sync TakeAds reports.')),
  });
};
