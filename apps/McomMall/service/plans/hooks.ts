import { useQuery } from '@tanstack/react-query';
import { getPlans } from './api';

export const useGetPlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });
};
