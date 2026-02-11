import api from '../api';
import {
  CashbackRule,
  CreateRulePayload,
  UpdateRulePayload,
  CashbackHistoryResponse,
  HistoryQueryParams,
} from './types';

export const cashbackApi = {
  // Configuration
  getEventTypes: async (): Promise<string[]> => {
    const response = await api.get('/cashback/events');
    return response.data;
  },

  getRules: async (): Promise<CashbackRule[]> => {
    const response = await api.get('/cashback/rules');
    return response.data;
  },

  createRule: async (payload: CreateRulePayload): Promise<CashbackRule> => {
    const response = await api.post('/cashback/rules', payload);
    return response.data;
  },

  updateRule: async (id: string, payload: UpdateRulePayload): Promise<CashbackRule> => {
    const response = await api.patch(`/cashback/rules/${id}`, payload);
    return response.data;
  },

  deleteRule: async (id: string): Promise<void> => {
    await api.delete(`/cashback/rules/${id}`);
  },

  // History & Reports
  getPlatformHistory: async (params?: HistoryQueryParams): Promise<CashbackHistoryResponse> => {
    const response = await api.get('/cashback/admin/history', { params });
    return response.data;
  },

  getGlobalHistory: async (params?: HistoryQueryParams): Promise<CashbackHistoryResponse> => {
    const response = await api.get('/cashback/admin/global-history', { params });
    return response.data;
  },

  // Stats
  getTotalCashbackGiven: async (): Promise<string> => {
    const response = await api.get('/cashback/balance');

    // Handle various potential response structures to avoid returning [object Object]
    const data = response.data;

    if (typeof data === 'object' && data !== null) {
        if ('balance' in data) return String(data.balance);
        if ('amount' in data) return String(data.amount);
        if ('total' in data) return String(data.total);
        if ('data' in data && typeof data.data === 'object') {
             // Handle nested { data: { balance: ... } }
             if (data.data && 'balance' in data.data) return String(data.data.balance);
             if (data.data && 'amount' in data.data) return String(data.data.amount);
        }
        // Fallback: try to stringify if it's an object but structure is unknown,
        // but better to return "0.00" than [object Object]
        console.warn('Unexpected response structure for cashback balance:', data);
        return "0.00";
    }

    return String(data || "0.00");
  }
};
