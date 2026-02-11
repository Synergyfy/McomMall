import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { CreateProductDto, Product, UpdateProductDto, AdminProduct } from './types';

const getAllProducts = async (): Promise<AdminProduct[]> => {
  const { data } = await api.get('admin/products');
  return data;
};

export const useGetAllProducts = () => {
  return useQuery({
    queryKey: ['all-admin-products'],
    queryFn: getAllProducts,
  });
};

const getMyProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/product/mine');
  return data;
};

export const useGetMyProducts = () => {
  return useQuery({
    queryKey: ['my-products'],
    queryFn: getMyProducts,
  });
};

const addProduct = async (productData: CreateProductDto) => {
  const { data } = await api.post('/product', productData);
  return data;
};

export const useAddProduct = () => {
  return useMutation({
    mutationFn: addProduct,
  });
};

const getProductById = async (id: string): Promise<Product> => {
  const { data } = await api.get(`/product/${id}`);
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
  const { data } = await api.patch(`/product/${productData.id}`, productData);
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

const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/product/${id}`);
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
