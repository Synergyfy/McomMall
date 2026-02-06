import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { CreateProductDto, Product, UpdateProductDto } from './types';

const getMyProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('product/mine', {
    params: { page: 1, limit: 1000 },
  });
  // Handle both array and paginated response
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
};

export const useGetMyProducts = () => {
  return useQuery({
    queryKey: ['my-products'],
    queryFn: getMyProducts,
  });
};

const addProduct = async (productData: CreateProductDto) => {
  const { data } = await api.post('product', productData);
  return data;
};

export const useAddProduct = () => {
  return useMutation({
    mutationFn: addProduct,
  });
};

export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get(`product/${id}`);
  return data;
};

export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

const updateProduct = async (productData: UpdateProductDto) => {
  const { data } = await api.patch(`product/${productData.id}`, productData);
  return data;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
    },
  });
};

const getProductsByBusiness = async (
  businessId: string,
  page: number,
  limit: number
): Promise<{ data: Product[]; total: number; page: number; limit: number }> => {
  const { data } = await api.get(`product/business/${businessId}`, {
    params: { page, limit },
  });
  return data;
};

export const useGetProductsByBusiness = (
  businessId: string,
  page: number,
  limit: number
) => {
  return useQuery({
    queryKey: ['products', businessId, page, limit],
    queryFn: () => getProductsByBusiness(businessId, page, limit),
    enabled: !!businessId,
  });
};

const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`product/${id}`);
  return data;
};

//delete hook
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
  });
};
