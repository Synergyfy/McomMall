import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
  GiftCardTemplate,
  CreateGiftCardTemplateDto,
  InitiatePurchaseDto,
  VerifyPurchaseDto,
  InitiatePurchaseResponse,
  GiftCard,
  MyPurchase,
  GiftCardBalanceResponse,
  InitiateReloadDto,
  InitiateReloadResponse,
  VerifyReloadDto,
  GiftCardStatsDto,
  GiftCardChartDataDto,
} from './types';

// API Functions
const fetchGiftCardTemplates = async (): Promise<GiftCardTemplate[]> => {
  const { data } = await api.get<GiftCardTemplate[]>('/merchant/gift-cards/templates');
  return data;
};

const fetchGiftCardTemplateById = async (id: string): Promise<GiftCardTemplate> => {
  const { data } = await api.get<GiftCardTemplate>(`/merchant/gift-cards/templates/${id}`);
  return data;
};

const addGiftCardTemplate = async (templateData: CreateGiftCardTemplateDto): Promise<GiftCardTemplate> => {
  const { data } = await api.post<GiftCardTemplate>('/merchant/gift-cards/templates', templateData);
  return data;
};

const updateGiftCardTemplate = async ({ id, templateData }: { id: string, templateData: Partial<CreateGiftCardTemplateDto> }): Promise<GiftCardTemplate> => {
  const { data } = await api.put<GiftCardTemplate>(`/merchant/gift-cards/templates/${id}`, templateData);
  return data;
};

const deleteGiftCardTemplate = async (id: string): Promise<void> => {
  await api.delete(`/merchant/gift-cards/templates/${id}`);
};

const initiatePurchase = async (purchaseData: InitiatePurchaseDto): Promise<InitiatePurchaseResponse> => {
  const { data } = await api.post<InitiatePurchaseResponse>('/gift-cards/purchase', purchaseData);
  return data;
};

const verifyPurchase = async (verificationData: VerifyPurchaseDto): Promise<GiftCard> => {
  const { data } = await api.post<GiftCard>('/gift-cards/purchase/verify', verificationData);
  return data;
};

const initiateReload = async ({ code, reloadData }: { code: string, reloadData: InitiateReloadDto }): Promise<InitiateReloadResponse> => {
  const { data } = await api.post<InitiateReloadResponse>(`/gift-cards/${code}/initiate-reload`, reloadData);
  return data;
};

const verifyReload = async ({ code, verificationData }: { code: string, verificationData: VerifyReloadDto }): Promise<GiftCard> => {
  const { data } = await api.post<GiftCard>(`/gift-cards/${code}/verify-reload`, verificationData);
  return data;
};

const checkGiftCardBalance = async (code: string): Promise<GiftCardBalanceResponse> => {
  const { data } = await api.get<GiftCardBalanceResponse>(`/gift-cards/balance/${code}`);
  return data;
};

const getGiftCardStats = async (): Promise<GiftCardStatsDto> => {
  const { data } = await api.get<GiftCardStatsDto>('/merchant/gift-cards/stats');
  return data;
};

const getGiftCardChartData = async (): Promise<GiftCardChartDataDto> => {
  const { data } = await api.get<GiftCardChartDataDto>('/merchant/gift-cards/chart-data');
  return data;
};


// React Query Hooks
export const useGetGiftCardTemplates = () => {
  return useQuery<GiftCardTemplate[], Error>({
    queryKey: ['giftCardTemplates'],
    queryFn: fetchGiftCardTemplates,
  });
};

export const useGetGiftCardStats = () => {
  return useQuery<GiftCardStatsDto, Error>({
    queryKey: ['giftCardStats'],
    queryFn: getGiftCardStats,
  });
};

export const useGetGiftCardChartData = () => {
  return useQuery<GiftCardChartDataDto, Error>({
    queryKey: ['giftCardChartData'],
    queryFn: getGiftCardChartData,
  });
};

export const useGetGiftCardTemplateById = (id: string) => {
  return useQuery<GiftCardTemplate, Error>({
    queryKey: ['giftCardTemplate', id],
    queryFn: () => fetchGiftCardTemplateById(id),
    enabled: !!id,
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

export const useInitiateReload = () => {
  return useMutation<InitiateReloadResponse, Error, { code: string, reloadData: InitiateReloadDto }>({
    mutationFn: initiateReload,
  });
};

export const useVerifyReload = () => {
  const queryClient = useQueryClient();
  return useMutation<GiftCard, Error, { code: string, verificationData: VerifyReloadDto }>({
    mutationFn: verifyReload,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['giftCard', variables.code] });
      queryClient.invalidateQueries({ queryKey: ['myPurchases'] });
    },
  });
};

export const useUpdateGiftCardTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<GiftCardTemplate, Error, { id: string, templateData: Partial<CreateGiftCardTemplateDto> }>({
    mutationFn: updateGiftCardTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardTemplates'] });
    },
  });
};

export const useDeleteGiftCardTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteGiftCardTemplate,
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