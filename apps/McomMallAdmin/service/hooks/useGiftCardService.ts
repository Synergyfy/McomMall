import useSWR from 'swr';
import { GiftCardAsset } from '../gift-card/asset-types';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useGetGiftCardAssets = (templateId: string) => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const {
    data: assets,
    error,
    mutate,
  } = useSWR<GiftCardAsset[]>(
    token && templateId ? `/merchant/gift-cards/templates/${templateId}/assets` : null,
    fetcher
  );

  return {
    assets,
    isLoading: !error && !assets,
    isError: error,
    mutate,
  };
};
