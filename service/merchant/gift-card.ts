import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { GetMerchantGiftCardsResponse } from '@/types/merchant-gift-card';
import { GiftCardHistory } from '@/types/gift-card-history';

const getMerchantGiftCards = async ({ page = 1, limit = 10, search = '' }: { page?: number, limit?: number, search?: string }): Promise<GetMerchantGiftCardsResponse> => {
  const { data } = await api.get('/merchant/gift-cards', {
    params: { page, limit, search },
  });
  return data;
};

export const useGetMerchantGiftCards = ({ page, limit, search }: { page?: number, limit?: number, search?: string }) => {
  return useQuery<GetMerchantGiftCardsResponse, Error>({
    queryKey: ['merchantGiftCards', { page, limit, search }],
    queryFn: () => getMerchantGiftCards({ page, limit, search }),
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