import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  ShippingAddress,
  CreateShippingAddressDto,
  UpdateShippingAddressDto,
  ShippingAddressListResponse,
} from './types';

const SHIPPING_ADDRESS_QUERY_KEY = 'shipping-addresses';
const MAIN_SHIPPING_ADDRESS_QUERY_KEY = 'main-shipping-address';

// 1. Get All Shipping Addresses
const getShippingAddresses = async (
  page = 1,
  limit = 10
): Promise<ShippingAddressListResponse> => {
  const { data } = await api.get<ShippingAddressListResponse>('/shipping-address', {
    params: { page, limit },
  });
  return data;
};

export const useGetShippingAddresses = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [SHIPPING_ADDRESS_QUERY_KEY, page, limit],
    queryFn: () => getShippingAddresses(page, limit),
  });
};

// 2. Get Main Shipping Address
const getMainShippingAddress = async (): Promise<ShippingAddress> => {
  const { data } = await api.get<ShippingAddress>('/shipping-address/main');
  return data;
};

export const useGetMainShippingAddress = () => {
  return useQuery({
    queryKey: [MAIN_SHIPPING_ADDRESS_QUERY_KEY],
    queryFn: getMainShippingAddress,
  });
};

// 3. Add New Shipping Address
const addShippingAddress = async (
  newAddress: CreateShippingAddressDto
): Promise<ShippingAddress> => {
  const { data } = await api.post<ShippingAddress>('/shipping-address', newAddress);
  return data;
};

export const useAddShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addShippingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MAIN_SHIPPING_ADDRESS_QUERY_KEY] });
    },
  });
};

// 4. Update Shipping Address
const updateShippingAddress = async ({
  id,
  ...updateData
}: {
  id: string;
} & UpdateShippingAddressDto): Promise<ShippingAddress> => {
  const { data } = await api.patch<ShippingAddress>(
    `/shipping-address/${id}`,
    updateData
  );
  return data;
};

export const useUpdateShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShippingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MAIN_SHIPPING_ADDRESS_QUERY_KEY] });
    },
  });
};

// 5. Set as Main Address
const setMainShippingAddress = async (id: string): Promise<ShippingAddress> => {
  const { data } = await api.patch<ShippingAddress>(
    `/shipping-address/${id}/set-main`
  );
  return data;
};

export const useSetMainShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setMainShippingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MAIN_SHIPPING_ADDRESS_QUERY_KEY] });
    },
  });
};

// 6. Delete Shipping Address
const deleteShippingAddress = async (id: string): Promise<void> => {
  await api.delete(`/shipping-address/${id}`);
};

export const useDeleteShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShippingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIPPING_ADDRESS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MAIN_SHIPPING_ADDRESS_QUERY_KEY] });
    },
  });
};
