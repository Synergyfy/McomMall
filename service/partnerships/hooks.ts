import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  CreatePartnershipRequestDto,
  PartnershipRequest,
  RespondToPartnershipRequestDto,
} from './types';

// Create a new partnership request
const createPartnershipRequest = async (dto: CreatePartnershipRequestDto): Promise<PartnershipRequest> => {
  const { data } = await api.post('/partnerships/requests', dto);
  return data;
};

export const useCreatePartnershipRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<PartnershipRequest, Error, CreatePartnershipRequestDto>({
    mutationFn: createPartnershipRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-partnership-requests'] });
    },
  });
};

// Respond to a partnership request
const respondToPartnershipRequest = async ({
  id,
  dto,
}: {
  id: string;
  dto: RespondToPartnershipRequestDto;
}): Promise<PartnershipRequest> => {
  const { data } = await api.patch(`/partnerships/requests/${id}/respond`, dto);
  return data;
};

export const useRespondToPartnershipRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    PartnershipRequest,
    Error,
    { id: string; dto: RespondToPartnershipRequestDto }
  >({
    mutationFn: respondToPartnershipRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-partnership-requests'] });
    },
  });
};

// Get all partnership requests sent by the current user
const getSentPartnershipRequests = async (): Promise<PartnershipRequest[]> => {
  const { data } = await api.get('/partnerships/requests/sent');
  return data;
};

export const useGetSentPartnershipRequests = () => {
  return useQuery<PartnershipRequest[], Error>({
    queryKey: ['sent-partnership-requests'],
    queryFn: getSentPartnershipRequests,
  });
};

// Get all partnership requests received by the current user
const getReceivedPartnershipRequests = async (): Promise<PartnershipRequest[]> => {
  const { data } = await api.get('/partnerships/requests/received');
  return data;
};

export const useGetReceivedPartnershipRequests = () => {
  return useQuery<PartnershipRequest[], Error>({
    queryKey: ['received-partnership-requests'],
    queryFn: getReceivedPartnershipRequests,
  });
};