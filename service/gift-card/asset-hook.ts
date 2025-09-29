import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { GiftCardAsset, CreateGiftCardAssetDto, UpdateGiftCardAssetDto } from './asset-types';

// API Functions
const fetchGiftCardAssets = async (): Promise<GiftCardAsset[]> => {
  const { data } = await api.get<GiftCardAsset[]>('/gift-card-assets/');
  return data;
};

const fetchGiftCardAssetById = async (id: string): Promise<GiftCardAsset> => {
  const { data } = await api.get<GiftCardAsset>(`/gift-card-assets/${id}`);
  return data;
};

const addGiftCardAsset = async (assetData: CreateGiftCardAssetDto): Promise<GiftCardAsset> => {
  const { data } = await api.post<GiftCardAsset>('/gift-card-assets/', assetData);
  return data;
};

const updateGiftCardAsset = async ({ id, assetData }: { id: string, assetData: Partial<UpdateGiftCardAssetDto> }): Promise<GiftCardAsset> => {
  const { data } = await api.patch<GiftCardAsset>(`/gift-card-assets/${id}`, assetData);
  return data;
};

const deleteGiftCardAsset = async (id: string): Promise<void> => {
  await api.delete(`/gift-card-assets/${id}`);
};

// React Query Hooks
export const useGetGiftCardAssets = () => {
  return useQuery<GiftCardAsset[], Error>({
    queryKey: ['giftCardAssets'],
    queryFn: fetchGiftCardAssets,
  });
};

export const useGetGiftCardAssetById = (id: string) => {
  return useQuery<GiftCardAsset, Error>({
    queryKey: ['giftCardAsset', id],
    queryFn: () => fetchGiftCardAssetById(id),
    enabled: !!id,
  });
};

export const useAddGiftCardAsset = () => {
  const queryClient = useQueryClient();
  return useMutation<GiftCardAsset, Error, CreateGiftCardAssetDto>({
    mutationFn: addGiftCardAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardAssets'] });
    },
  });
};

export const useUpdateGiftCardAsset = () => {
  const queryClient = useQueryClient();
  return useMutation<GiftCardAsset, Error, { id: string, assetData: Partial<UpdateGiftCardAssetDto> }>({
    mutationFn: updateGiftCardAsset,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['giftCardAssets'] });
      queryClient.invalidateQueries({ queryKey: ['giftCardAsset', id] });
    },
  });
};

export const useDeleteGiftCardAsset = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteGiftCardAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardAssets'] });
    },
  });
};