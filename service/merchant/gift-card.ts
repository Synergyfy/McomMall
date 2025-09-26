import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GetMerchantGiftCardsResponse } from '@/types/merchant-gift-card';
import { GiftCardHistory } from '@/types/gift-card-history';

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

const getGiftCardHistory = async (
  code: string
): Promise<GiftCardHistory[]> => {
  const { data } = await api.get(`/gift-cards/${code}/history`);
  return data;
};

export const useGetGiftCardHistory = (code: string) => {
  return useQuery<GiftCardHistory[], Error>({
    queryKey: ['giftCardHistory', code],
    queryFn: () => getGiftCardHistory(code),
    enabled: !!code,
  });
};