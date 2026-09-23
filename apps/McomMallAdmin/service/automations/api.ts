import api from '@/service/api';
import { Automation, AutomationSummary, UpdateAutomationDto } from './types';

const ENDPOINT = '/automations';

export async function getAutomationsByBusiness(businessId: string): Promise<Automation[]> {
    const { data } = await api.get<Automation[]>(ENDPOINT, { params: { businessId } });
    return data;
}

export async function getAutomationSummary(businessId: string): Promise<AutomationSummary> {
    const { data } = await api.get<AutomationSummary>(`${ENDPOINT}/summary`, {
        params: { businessId },
    });
    return data;
}

export async function getAutomationById(id: string): Promise<Automation> {
    const { data } = await api.get<Automation>(`${ENDPOINT}/${id}`);
    return data;
}

export async function updateAutomation(id: string, dto: UpdateAutomationDto): Promise<Automation> {
    const { data } = await api.patch<Automation>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteAutomation(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
