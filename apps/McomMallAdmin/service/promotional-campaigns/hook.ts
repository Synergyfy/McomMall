import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { toast } from 'sonner';
import {
  CampaignFilters,
  CampaignPage,
  CampaignPayload,
  CampaignStats,
  PromotionalCampaign,
} from './types';

const getStats = async (): Promise<CampaignStats> => {
  const { data } = await api.get('/admin/promotional-campaigns/stats');
  return data;
};

export const useGetCampaignStats = () =>
  useQuery({
    queryKey: ['admin-campaign-stats'],
    queryFn: getStats,
  });

const getCampaigns = async (
  filters: CampaignFilters,
): Promise<CampaignPage> => {
  const { data } = await api.get('/admin/promotional-campaigns', {
    params: filters,
  });
  return data;
};

export const useGetCampaigns = (filters: CampaignFilters = {}) =>
  useQuery({
    queryKey: ['admin-campaigns', filters],
    queryFn: () => getCampaigns(filters),
  });

const getCampaign = async (id: string): Promise<PromotionalCampaign> => {
  const { data } = await api.get(`/admin/promotional-campaigns/${id}`);
  return data;
};

export const useGetCampaign = (id?: string) =>
  useQuery({
    queryKey: ['admin-campaign', id],
    queryFn: () => getCampaign(id as string),
    enabled: !!id,
  });

const createCampaign = async (
  payload: CampaignPayload,
): Promise<PromotionalCampaign> => {
  const { data } = await api.post('/admin/promotional-campaigns', payload);
  return data;
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-stats'] });
      toast.success('Campaign saved.');
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Could not save the campaign.',
      ),
  });
};

const updateCampaign = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CampaignPayload>;
}): Promise<PromotionalCampaign> => {
  const { data } = await api.patch(
    `/admin/promotional-campaigns/${id}`,
    payload,
  );
  return data;
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCampaign,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-stats'] });
      toast.success('Campaign updated.');
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Could not update the campaign.',
      ),
  });
};

const deleteCampaign = async (id: string) => {
  const { data } = await api.delete(`/admin/promotional-campaigns/${id}`);
  return data;
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-stats'] });
      toast.success('Campaign archived.');
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Could not archive the campaign.',
      ),
  });
};
