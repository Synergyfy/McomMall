import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { CreatePartnershipDto, IPartnership } from './types';
import { User } from '../user/types';

// Fetch all partnerships for the current user
const getMyPartnerships = async (): Promise<IPartnership[]> => {
  const { data } = await api.get('/partnerships/my');
  return data;
};

export const useGetMyPartnerships = () => {
  return useQuery({
    queryKey: ['my-partnerships'],
    queryFn: getMyPartnerships,
  });
};

// Fetch all accepted partners for the current user
const getMyAcceptedPartners = async (): Promise<User[]> => {
    const { data } = await api.get('/partnerships/my/accepted-partners');
    return data;
};

export const useGetMyAcceptedPartners = () => {
    return useQuery({
        queryKey: ['my-accepted-partners'],
        queryFn: getMyAcceptedPartners,
    });
}

// Request a new partnership
const requestPartnership = async (partnershipData: CreatePartnershipDto) => {
  const { data } = await api.post('/partnerships/request', partnershipData);
  return data;
};

export const useRequestPartnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestPartnership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-partnerships'] });
    },
  });
};

// Accept a partnership request
const acceptPartnership = async (partnershipId: string) => {
  const { data } = await api.patch(`/partnerships/${partnershipId}/accept`);
  return data;
};

export const useAcceptPartnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptPartnership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-partnerships'] });
    },
  });
};

// Reject a partnership request
const rejectPartnership = async (partnershipId: string) => {
  const { data } = await api.patch(`/partnerships/${partnershipId}/reject`);
  return data;
};

export const useRejectPartnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectPartnership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-partnerships'] });
    },
  });
};

// Search for owners with service profiles
const searchOwners = async (params: { skills?: string[]; serviceArea?: string }): Promise<User[]> => {
    const { data } = await api.get('/users/search/owners-with-service-profiles', { params });
    return data;
};

export const useSearchOwners = () => {
    return useMutation({
        mutationFn: searchOwners,
    });
};