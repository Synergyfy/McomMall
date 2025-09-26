import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  GiftCardTemplate,
  CreateGiftCardTemplateDto,
  InitiatePurchaseDto,
  VerifyPurchaseDto,
  InitiatePurchaseResponse,
  MyPurchase,
  GiftCardBalanceResponse,
  GiftCard,
} from './types';
import { GiftCard as AdminGiftCard } from '@/types/gift-card';

// API Functions
const fetchGiftCardTemplates = async (): Promise<GiftCardTemplate[]> => {
  const { data } = await api.get<GiftCardTemplate[]>('/merchant/gift-cards/templates');
  return data;
};

const getGiftCards = async (): Promise<AdminGiftCard[]> => {
    const { data } = await api.get('/merchant/gift-cards');
    return data;
  };

const addGiftCardTemplate = async (templateData: CreateGiftCardTemplateDto): Promise<GiftCardTemplate> => {
  const { data } = await api.post<GiftCardTemplate>('/merchant/gift-cards/templates', templateData);
  return data;
};

const initiatePurchase = async (purchaseData: InitiatePurchaseDto): Promise<InitiatePurchaseResponse> => {
  const { data } = await api.post<InitiatePurchaseResponse>('/gift-cards/purchase', purchaseData);
  return data;
};

const verifyPurchase = async (verificationData: VerifyPurchaseDto): Promise<GiftCard> => {
  const { data } = await api.post<GiftCard>('/gift-cards/purchase/verify', verificationData);
  return data;
};

const checkGiftCardBalance = async (code: string): Promise<GiftCardBalanceResponse> => {
  const { data } = await api.get<GiftCardBalanceResponse>(`/gift-cards/balance/${code}`);
  return data;
};


// React Query Hooks
export const useGetGiftCards = () => {
    return useQuery<AdminGiftCard[], Error>({
      queryKey: ['giftCards'],
      queryFn: getGiftCards,
    });
  };

export const useGetGiftCardTemplates = () => {
  return useQuery<GiftCardTemplate[], Error>({
    queryKey: ['giftCardTemplates'],
    queryFn: fetchGiftCardTemplates,
  });
};

const fetchBusinessGiftCardTemplates = async (businessId: string): Promise<GiftCardTemplate[]> => {
  const { data } = await api.get<GiftCardTemplate[]>(`/gift-cards/templates/${businessId}`);
  return data;
};

export const useGetBusinessGiftCards = (businessId: string) => {
  return useQuery<GiftCardTemplate[], Error>({
    queryKey: ['businessGiftCardTemplates', businessId],
    queryFn: () => fetchBusinessGiftCardTemplates(businessId),
    enabled: !!businessId,
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

export const useCheckGiftCardBalance = () => {
  return useMutation<GiftCardBalanceResponse, Error, string>({
    mutationFn: checkGiftCardBalance,
  });
};

const fetchMyPurchases = async (): Promise<MyPurchase[]> => {
  const { data } = await api.get<MyPurchase[]>('/gift-cards/my-purchases');
  return data;
};

export const useGetMyPurchases = () => {
  return useQuery<MyPurchase[], Error>({
    queryKey: ['myPurchases'],
    queryFn: fetchMyPurchases,
  });
};

export const useInitiatePurchase = () => {
  return useMutation<InitiatePurchaseResponse, Error, InitiatePurchaseDto>({
    mutationFn: initiatePurchase,
  });
};

export const useVerifyPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation<GiftCard, Error, VerifyPurchaseDto>({
    mutationFn: verifyPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
    },
  });
};

export const useMutateGiftCard = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (updatedCard: AdminGiftCard) => {
        // Here you would typically make an API call to update the gift card on the server
        // For now, we'll just update the cache optimistically.
        return Promise.resolve(updatedCard);
      },
      onSuccess: (data: AdminGiftCard) => {
        queryClient.setQueryData(['giftCards'], (oldData: AdminGiftCard[] | undefined) => {
          if (!oldData) return [];
          const index = oldData.findIndex(card => card.id === data.id);
          if (index !== -1) {
            const newData = [...oldData];
            newData[index] = data;
            return newData;
          }
          return oldData;
        });
      },
    });
  };