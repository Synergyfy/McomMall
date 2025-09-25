import { useQuery } from '@tanstack/react-query';
import { getGiftCardTemplates } from './index';
import { GiftCardTemplate } from './types';

export const useGetGiftCardTemplates = () => {
  return useQuery<GiftCardTemplate[], Error>({
    queryKey: ['giftCardTemplates'],
    queryFn: getGiftCardTemplates,
  });
};