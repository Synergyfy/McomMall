import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from './category-types';

const fetchGiftCardCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/gift-card/categories');
  return data;
};

const addGiftCardCategory = async (categoryData: CreateCategoryDto): Promise<Category> => {
  const { data } = await api.post<Category>('/gift-card/categories', categoryData);
  return data;
};

const updateGiftCardCategory = async ({ id, categoryData }: { id: string, categoryData: Partial<UpdateCategoryDto> }): Promise<Category> => {
  const { data } = await api.patch<Category>(`/gift-card/categories/${id}`, categoryData);
  return data;
};

const deleteGiftCardCategory = async (id: string): Promise<void> => {
  await api.delete(`/gift-card/categories/${id}`);
};

export const useGetGiftCardCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['giftCardCategories'],
    queryFn: fetchGiftCardCategories,
  });
};

export const useAddGiftCardCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CreateCategoryDto>({
    mutationFn: addGiftCardCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardCategories'] });
    },
  });
};

export const useUpdateGiftCardCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { id: string, categoryData: Partial<UpdateCategoryDto> }>({
    mutationFn: updateGiftCardCategory,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCardCategories'] });
    },
  });
};

export const useDeleteGiftCardCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteGiftCardCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardCategories'] });
    },
  });
};