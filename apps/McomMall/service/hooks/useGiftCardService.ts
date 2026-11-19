import useSWR from 'swr';
import { GiftCardAsset } from '../gift-cards/types';
import api from '../api';
const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useGetGiftCardAssets = (templateId: string) => {
  const {
    data: assets,
    error,
    mutate,
  } = useSWR<GiftCardAsset[]>(
    templateId ? `/gift-cards/templates/${templateId}/assets` : null,
    fetcher
  );

  return {
    assets,
    isLoading: !error && !assets,
    isError: error,
    mutate,
  };
};