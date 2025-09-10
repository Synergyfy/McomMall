import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Service } from './types';

export const useGetServicesByBusiness = (businessId: string) => {
  return useQuery<Service[], Error>({
    queryKey: ['services', businessId],
    queryFn: async () => {
      const { data } = await api.get(`/services/business/${businessId}`);
      return data;
    },
    enabled: !!businessId,
  });
};

export const useGetServiceById = (serviceId: string) => {
  return useQuery<Service, Error>({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data } = await api.get(`/services/${serviceId}`);
      return data;
    },
    enabled: !!serviceId,
  });
};
