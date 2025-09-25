import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { GiftCardTemplate, CreateGiftCardTemplateDto } from './types';

// API Functions
const fetchGiftCardTemplates = async (): Promise<GiftCardTemplate[]> => {
  const { data } = await api.get<GiftCardTemplate[]>('/merchant/gift-cards/templates');
  return data;
};

const addGiftCardTemplate = async (templateData: CreateGiftCardTemplateDto): Promise<GiftCardTemplate> => {
  const { data } = await api.post<GiftCardTemplate>('/merchant/gift-cards/templates', templateData);
  return data;
};


// React Query Hooks
export const useGetGiftCardTemplates = () => {
  return useQuery<GiftCardTemplate[], Error>({
    queryKey: ['giftCardTemplates'],
    queryFn: fetchGiftCardTemplates,
  });
};

export const useAddGiftCardTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation<GiftCardTemplate, Error, CreateGiftCardTemplateDto>({
        mutationFn: addGiftCardTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['giftCardTemplates'] });
        },
    });
};