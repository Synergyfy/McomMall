import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';

export interface GiftCardTheme {
  id: string;
  name: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  previewSvg?: string | null;
  badgeText?: string | null;
  isPublic: boolean;
  ownerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const useGiftCardThemes = () =>
  useQuery<GiftCardTheme[]>({
    queryKey: ['giftCardThemes'],
    queryFn: async () => {
      const { data } = await api.get('/gift-cards/themes');
      return data;
    },
  });

export const useMyGiftCardThemes = () =>
  useQuery<GiftCardTheme[]>({
    queryKey: ['giftCardThemes', 'mine'],
    queryFn: async () => {
      const { data } = await api.get('/merchant/gift-cards/themes/mine');
      return data;
    },
  });

export const useCreateGiftCardTheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<GiftCardTheme>) => {
      const { data } = await api.post('/merchant/gift-cards/themes', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardThemes'] });
    },
  });
};

export const useUpdateGiftCardTheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<GiftCardTheme>) => {
      const { data } = await api.put(`/merchant/gift-cards/themes/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardThemes'] });
    },
  });
};

export const useDeleteGiftCardTheme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/merchant/gift-cards/themes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardThemes'] });
    },
  });
};
