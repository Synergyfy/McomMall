import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import { Membership } from './types';

const getMyMembership = async (): Promise<Membership> => {
  const { data } = await api.get<Membership>('/membership/my');
  return data;
};

export const useGetMyMembership = () => {
  return useQuery({
    queryKey: ['my-membership'],
    queryFn: getMyMembership,
  });
};
