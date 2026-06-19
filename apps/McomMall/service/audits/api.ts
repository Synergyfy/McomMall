import api from '../api';
import { Audit, SubmitAuditDto } from './types';

export const submitAudit = async (dto: SubmitAuditDto): Promise<Audit> => {
  const response = await api.post<Audit>('/business/audits', dto);
  return response.data;
};

export const getLatestAudit = async (businessId?: string): Promise<Audit> => {
  const response = await api.get<Audit>('/business/audits/latest', {
    params: { businessId },
  });
  return response.data;
};

export const getAuditHistory = async (businessId?: string): Promise<Audit[]> => {
  const response = await api.get<Audit[]>('/business/audits/history', {
    params: { businessId },
  });
  return response.data;
};
