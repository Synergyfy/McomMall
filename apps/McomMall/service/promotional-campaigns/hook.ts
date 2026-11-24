import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  CampaignParticipationStatus,
  MyCampaignsResponse,
  PublicCampaignsResponse,
} from './types';

const getMine = async (): Promise<MyCampaignsResponse> => {
  const { data } = await api.get('/promotional-campaigns/mine');
  return data;
};

export const useGetMyCampaigns = () =>
  useQuery({
    queryKey: ['my-promotional-campaigns'],
    queryFn: getMine,
  });

const getPublicForBusiness = async (
  businessId: string,
): Promise<PublicCampaignsResponse> => {
  const { data } = await api.get(
    `/promotional-campaigns/public/${businessId}`,
  );
  return data;
};

export const useGetPublicCampaigns = (businessId?: string) =>
  useQuery({
    queryKey: ['public-promotional-campaigns', businessId],
    queryFn: () => getPublicForBusiness(businessId as string),
    enabled: !!businessId,
  });

const respond = async ({
  id,
  status,
  note,
}: {
  id: string;
  status: CampaignParticipationStatus;
  note?: string;
}) => {
  const { data } = await api.patch(`/promotional-campaigns/${id}/respond`, {
    status,
    note,
  });
  return data;
};

export const useRespondToCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: respond,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-promotional-campaigns'],
      });
      queryClient.invalidateQueries({
        queryKey: ['public-promotional-campaigns'],
      });
    },
  });
};
