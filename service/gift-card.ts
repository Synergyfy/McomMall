import axios from 'axios';
import { GiftCard, GiftCardTemplate, CreateGiftCardTemplateDto, AdjustBalanceDto } from '@/types/gift-card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Merchant APIs
export const getMerchantGiftCards = (page = 1, limit = 10, search = ''): Promise<{ data: { data: GiftCard[], total: number } }> => {
  return axios.get(`${API_URL}/api/merchant/gift-cards`, {
    ...getAuthHeaders(),
    params: { page, limit, search },
  });
};

export const getMerchantGiftCardStats = () => {
  return axios.get(`${API_URL}/api/merchant/gift-cards/stats`, getAuthHeaders());
};

export const getMerchantGiftCardById = (id: string): Promise<{ data: GiftCard }> => {
  return axios.get(`${API_URL}/api/merchant/gift-cards/${id}`, getAuthHeaders());
};

export const adjustBalance = (id: string, data: AdjustBalanceDto) => {
  return axios.post(`${API_URL}/api/merchant/gift-cards/${id}/adjust-balance`, data, getAuthHeaders());
};

export const resendGiftCard = (id: string) => {
  return axios.post(`${API_URL}/api/merchant/gift-cards/${id}/resend`, {}, getAuthHeaders());
};

export const cancelGiftCard = (id: string) => {
  return axios.delete(`${API_URL}/api/merchant/gift-cards/${id}/cancel`, getAuthHeaders());
};

// Template APIs
export const getMerchantGiftCardTemplates = (): Promise<{ data: GiftCardTemplate[] }> => {
  return axios.get(`${API_URL}/api/merchant/gift-cards/templates`, getAuthHeaders());
};

export const createMerchantGiftCardTemplate = (data: CreateGiftCardTemplateDto) => {
  return axios.post(`${API_URL}/api/merchant/gift-cards/templates`, data, getAuthHeaders());
};

export const updateMerchantGiftCardTemplate = (id: string, data: CreateGiftCardTemplateDto) => {
  return axios.put(`${API_URL}/api/merchant/gift-cards/templates/${id}`, data, getAuthHeaders());
};

export const deleteMerchantGiftCardTemplate = (id: string) => {
  return axios.delete(`${API_URL}/api/merchant/gift-cards/templates/${id}`, getAuthHeaders());
};

// Consumer APIs
export const getGiftCardTemplatesByBusiness = (businessId: string): Promise<{ data: GiftCardTemplate[] }> => {
  return axios.get(`${API_URL}/api/gift-cards/templates/${businessId}`);
};

export const getGiftCardBalance = (code: string) => {
  return axios.get(`${API_URL}/api/gift-cards/balance/${code}`);
};