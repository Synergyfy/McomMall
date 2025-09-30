import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { AssetCategory, CreateAssetCategoryDto, UpdateAssetCategoryDto } from './asset-category-types';

const fetchAssetCategories = async (): Promise<AssetCategory[]> => {
  const { data } = await api.get<AssetCategory[]>('/merchant/gift-card/asset-categories');
  return data;
};

const addAssetCategory = async (categoryData: CreateAssetCategoryDto): Promise<AssetCategory> => {
  const { data } = await api.post<AssetCategory>('/merchant/gift-card/asset-categories', categoryData);
  return data;
};

const updateAssetCategory = async ({ id, categoryData }: { id: string, categoryData: Partial<UpdateAssetCategoryDto> }): Promise<AssetCategory> => {
  const { data } = await api.patch<AssetCategory>(`/merchant/gift-card/asset-categories/${id}`, categoryData);
  return data;
};

const deleteAssetCategory = async (id: string): Promise<void> => {
  await api.delete(`/merchant/gift-card/asset-categories/${id}`);
};

export const useGetAssetCategories = () => {
  return useQuery<AssetCategory[], Error>({
    queryKey: ['assetCategories'],
    queryFn: fetchAssetCategories,
  });
};

export const useAddAssetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<AssetCategory, Error, CreateAssetCategoryDto>({
    mutationFn: addAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
    },
  });
};

export const useUpdateAssetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<AssetCategory, Error, { id: string, categoryData: Partial<UpdateAssetCategoryDto> }>({
    mutationFn: updateAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
    },
  });
};

export const useDeleteAssetCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetCategories'] });
    },
  });
};