import api from '../api';
import { GiftCardTemplate, CreateGiftCardTemplateDto } from './types';

export const getGiftCardTemplates = async (): Promise<GiftCardTemplate[]> => {
  const response = await api.get('/merchant/gift-cards/templates');
  return response.data;
};

export const createGiftCardTemplate = async (data: CreateGiftCardTemplateDto): Promise<GiftCardTemplate> => {
  const response = await api.post('/merchant/gift-cards/templates', data);
  return response.data;
};