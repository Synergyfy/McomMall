import api from '@/service/api';
import {
    LoyaltyRule,
    LoyaltySettings,
    LoyaltyStats,
    UpdateLoyaltyRuleDto,
    UpdateLoyaltySettingsDto,
} from './types';

export async function getLoyaltyStats(businessId: string): Promise<LoyaltyStats> {
    const { data } = await api.get<LoyaltyStats>('/loyalty/stats', { params: { businessId } });
    return data;
}

export async function getLoyaltyRules(businessId: string): Promise<LoyaltyRule[]> {
    const { data } = await api.get<LoyaltyRule[]>('/loyalty/rules', { params: { businessId } });
    return data;
}

export async function updateLoyaltyRule(id: string, dto: UpdateLoyaltyRuleDto): Promise<LoyaltyRule> {
    const { data } = await api.patch<LoyaltyRule>(`/loyalty/rules/${id}`, dto);
    return data;
}

export async function deleteLoyaltyRule(id: string): Promise<void> {
    await api.delete(`/loyalty/rules/${id}`);
}

export async function getLoyaltySettings(businessId: string): Promise<LoyaltySettings> {
    const { data } = await api.get<LoyaltySettings>('/loyalty/settings', { params: { businessId } });
    return data;
}

export async function updateLoyaltySettings(
    businessId: string,
    dto: UpdateLoyaltySettingsDto,
): Promise<LoyaltySettings> {
    const { data } = await api.put<LoyaltySettings>('/loyalty/settings', dto, {
        params: { businessId },
    });
    return data;
}
