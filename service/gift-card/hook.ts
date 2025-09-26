import {
  ValidateGiftCardDto,
  ValidateGiftCardResponse,
  GiftCardTemplate,
  Purchase,
  InitiatePurchaseDto,
  InitiatePurchaseResponse,
  VerifyPurchaseDto,
  GiftCard,
  CreateGiftCardTemplateDto,
} from './types';
import api from '../api';

export const useValidateGiftCard = () => {
  const validateGiftCard = async (
    validationData: ValidateGiftCardDto
  ): Promise<ValidateGiftCardResponse> => {
    const response = await api.post('/gift-card/validate', validationData);
    const data = response.data;
    return {
      ...data,
      balance: Number(data.balance),
    };
  };
  return validateGiftCard;
};

export const useGetBusinessGiftCards = (_businessId: string) => {
  // Placeholder function
  return { data: [] as GiftCardTemplate[], isPending: false, isError: false };
};

export const useInitiatePurchase = () => {
  // Placeholder function
  return {
    mutate: (
      _variables: InitiatePurchaseDto,
      _options?: {
        onSuccess?: (data: InitiatePurchaseResponse) => void;
        onError?: () => void;
      }
    ) => {},
    mutateAsync: async (
      _variables: InitiatePurchaseDto
    ): Promise<InitiatePurchaseResponse> => ({
      purchaseId: 'mock-id',
      clientSecret: 'mock-secret',
      provider: 'stripe',
      orderId: 'mock-order-id',
    }),
    isPending: false,
  };
};

export const useVerifyPurchase = () => {
  // Placeholder function
  return {
    mutate: (
      _variables: VerifyPurchaseDto,
      _options?: {
        onSuccess?: (data: GiftCard) => void;
        onError?: () => void;
      }
    ) => {},
    mutateAsync: async (_variables: VerifyPurchaseDto): Promise<GiftCard> => ({
      id: 'mock-giftcard-id',
      code: 'mock-code',
      balance: 100,
      initialBalance: 100,
      recipientEmail: 'mock@example.com',
    }),
    isPending: false,
  };
};

export const useAddGiftCardTemplate = () => {
  // Placeholder function
  return {
    mutate: (
      _variables: CreateGiftCardTemplateDto,
      _options?: { onSuccess?: () => void; onError?: (err: any) => void }
    ) => {},
    mutateAsync: async (_variables: CreateGiftCardTemplateDto) => ({}),
    isPending: false,
  };
};

export const useGetGiftCardTemplates = () => {
  // Placeholder function
  return { data: [] as GiftCardTemplate[], isPending: false, isError: false };
};

export const useGetMyPurchases = () => {
  // Placeholder function
  return { data: [] as Purchase[], isPending: false, isError: false };
};