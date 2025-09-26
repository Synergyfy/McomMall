import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GetMerchantGiftCardsResponse } from '@/types/merchant-gift-card';

const getMerchantGiftCards = async (): Promise<GetMerchantGiftCardsResponse> => {
  const { data } = await api.get('/merchant/gift-cards');
  return data;
};

export const useGetMerchantGiftCards = () => {
  return useQuery<GetMerchantGiftCardsResponse, Error>({
    queryKey: ['merchantGiftCards'],
    queryFn: getMerchantGiftCards,
  });
};