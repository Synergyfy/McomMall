import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { Service, IService } from './types';

const getMyServices = async (): Promise<Service[]> => {
  const { data } = await api.get('/services');
  return data;
};

export const useGetMyServices = () => {
  return useQuery({
    queryKey: ['my-services'],
    queryFn: getMyServices,
  });
};

const deleteService = async (id: string) => {
  const { data } = await api.delete(`/services/${id}`);
  return data;
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
    },
  });
};

const searchServices = async (term: string): Promise<IService[]> => {
  const { data } = await api.get('/services/search', {
    params: { term },
  });
  return data;
};

export const useSearchServices = () => {
  return useMutation({
    mutationFn: searchServices,
  });
};

const getServiceById = async (id: string): Promise<Service> => {
  const { data } = await api.get(`/services/${id}`);
  return data;
};

export const useGetServiceById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => getServiceById(id),
    enabled: enabled && !!id,
  });
};

const getServicesByBusiness = async (
  businessId: string,
  page: number,
  limit: number
): Promise<{ data: Service[], total: number, page: number, limit: number }> => {
  const { data } = await api.get(`/services/business/${businessId}`, {
    params: { page, limit },
  });
  return data;
};

export const useGetServicesByBusiness = (businessId: string, page: number, limit: number) => {
  return useQuery({
    queryKey: ['services-by-business', businessId, page, limit],
    queryFn: () => getServicesByBusiness(businessId, page, limit),
    enabled: !!businessId,
  });
};

import { CreateServiceDto } from './types';

const addService = async (serviceData: CreateServiceDto) => {
  const { data } = await api.post('/services', serviceData);
  return data;
};

import { UpdateServiceDto } from './types';
export const useAddService = () => {
  return useMutation({
    mutationFn: addService,
  });
};

const updateService = async (serviceData: UpdateServiceDto) => {
  const { data } = await api.patch(
    `/services/${serviceData.id}`,
    serviceData
  );
  return data;
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateService,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-services'] });
      queryClient.invalidateQueries({ queryKey: ['service', data.id] });
    },
  });
};
