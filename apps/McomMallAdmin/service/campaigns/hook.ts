import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import { CreateCampaignDto, GetMarketingCampaignsParams, MarketingCampaign, MarketingCampaignPage } from './types';
import { ErrorResponse } from '../listings/hook';

export const useAddCampaign = () => {
  const create = async (payload: CreateCampaignDto) => {
    try {
      const response = await api.post('/campaigns', payload);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to create campaign'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: create,
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};

export const useGetMarketingCampaigns = (params: GetMarketingCampaignsParams = {}) => {
  const { page = 1, limit = 10 } = params;
  const fetch = async (): Promise<MarketingCampaignPage> => {
    try {
      const response = await api.get('/campaigns/marketing/list', { params: { page, limit } });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch marketing campaigns');
    }
  };

  return useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_MARKETING_CAMPAIGNS', page, limit],
  });
};

export const useGetMarketingCampaign = (id: string | undefined) => {
  const fetch = async (): Promise<MarketingCampaign> => {
    try {
      const response = await api.get(`/campaigns/marketing/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch campaign');
    }
  };

  return useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_MARKETING_CAMPAIGN', id],
    enabled: !!id,
  });
};

export const useGetMyCampaigns = () => {
  const fetch = async () => {
    try {
      const response = await api.get('/campaigns/mine');
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch campaigns'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_MY_CAMPAIGNS'],
  });

  return query;
};
