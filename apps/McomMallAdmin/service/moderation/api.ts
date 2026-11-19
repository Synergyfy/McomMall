import api from '@/service/api';
import {
  ModerationListParams,
  ModerationListResponse,
  ModerationStatsResponse,
  ModeratedItem,
  ModeratedResource,
} from './types';

export const moderationApi = {
  getStats: async (): Promise<ModerationStatsResponse> => {
    const { data } = await api.get('/admin/moderation/stats');
    return data;
  },

  list: async (
    resource: ModeratedResource,
    params: ModerationListParams = {},
  ): Promise<ModerationListResponse> => {
    const { data } = await api.get(`/admin/moderation/${resource}`, {
      params,
    });
    return data;
  },

  approve: async (
    resource: ModeratedResource,
    id: string,
    reviewNote?: string,
  ): Promise<ModeratedItem> => {
    const { data } = await api.patch(
      `/admin/moderation/${resource}/${id}/approve`,
      { reviewNote },
    );
    return data;
  },

  reject: async (
    resource: ModeratedResource,
    id: string,
    reviewNote?: string,
  ): Promise<ModeratedItem> => {
    const { data } = await api.patch(
      `/admin/moderation/${resource}/${id}/reject`,
      { reviewNote },
    );
    return data;
  },

  delist: async (
    resource: ModeratedResource,
    id: string,
  ): Promise<ModeratedItem> => {
    const { data } = await api.patch(
      `/admin/moderation/${resource}/${id}/delist`,
    );
    return data;
  },

  republish: async (
    resource: ModeratedResource,
    id: string,
  ): Promise<ModeratedItem> => {
    const { data } = await api.patch(
      `/admin/moderation/${resource}/${id}/republish`,
    );
    return data;
  },
};
