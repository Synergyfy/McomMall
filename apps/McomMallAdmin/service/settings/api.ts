import api from '@/service/api';
import { IntegrationSettings, UpdateIntegrationSettingsDto, BillingSummary } from './types';

export async function getIntegrationSettings(businessId: string): Promise<IntegrationSettings> {
    const { data } = await api.get<IntegrationSettings>('/settings/integrations', {
        params: { businessId },
    });
    return data;
}

export async function updateIntegrationSettings(
    businessId: string,
    dto: UpdateIntegrationSettingsDto,
): Promise<IntegrationSettings> {
    const { data } = await api.put<IntegrationSettings>('/settings/integrations', dto, {
        params: { businessId },
    });
    return data;
}

export async function getBillingSummary(): Promise<BillingSummary> {
    const { data } = await api.get<BillingSummary>('/settings/billing');
    return data;
}
