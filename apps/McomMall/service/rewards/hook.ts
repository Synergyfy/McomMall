import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/service/api';
import {
  EligibleRewardsItem,
  EligibleRewardsResponse,
  EligibleRewardsServiceBooking,
  MyRewardsResponse,
} from './types';

export const fetchEligibleRewards = async (payload: {
  items: EligibleRewardsItem[];
  serviceBookings?: EligibleRewardsServiceBooking[];
}): Promise<EligibleRewardsResponse> => {
  const { data } = await api.post<EligibleRewardsResponse>(
    '/rewards/eligible',
    payload
  );
  return data;
};

export const useEligibleRewards = (
  items: EligibleRewardsItem[],
  serviceBookings?: EligibleRewardsServiceBooking[]
) => {
  const key = JSON.stringify({ items, serviceBookings: serviceBookings || [] });
  return useQuery<EligibleRewardsResponse>({
    queryKey: ['rewards', 'eligible', key],
    queryFn: () =>
      fetchEligibleRewards({
        items,
        serviceBookings:
          serviceBookings && serviceBookings.length > 0
            ? serviceBookings
            : undefined,
      }),
    enabled: items.length > 0,
    staleTime: 30_000,
  });
};

export const useMyRewards = () => {
  return useQuery<MyRewardsResponse>({
    queryKey: ['rewards', 'my'],
    queryFn: () => api.get('/rewards/my').then((res) => res.data),
  });
};

/** Manual re-check (e.g. after changing the cart). */
export const useRefreshEligibleRewards = () => {
  return useMutation({
    mutationFn: fetchEligibleRewards,
  });
};
