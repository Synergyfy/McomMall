import api from '@/service/api';
import { Borough, BoroughStats, CreateBoroughDto, UpdateBoroughDto, BoroughCampaignLink } from './types';

const ENDPOINT = '/boroughs';

export async function getBoroughs(): Promise<Borough[]> {
    const { data } = await api.get<Borough[]>(ENDPOINT);
    return data;
}

export async function getBoroughStats(): Promise<BoroughStats> {
    const { data } = await api.get<BoroughStats>(`${ENDPOINT}/stats`);
    return data;
}

export async function getBorough(id: string): Promise<Borough> {
    const { data } = await api.get<Borough>(`${ENDPOINT}/${id}`);
    return data;
}

export async function getBoroughCampaigns(id: string): Promise<BoroughCampaignLink[]> {
    const { data } = await api.get<BoroughCampaignLink[]>(`${ENDPOINT}/${id}/campaigns`);
    return data;
}

export async function createBorough(dto: CreateBoroughDto): Promise<Borough> {
    const { data } = await api.post<Borough>(ENDPOINT, dto);
    return data;
}

export async function updateBorough(id: string, dto: UpdateBoroughDto): Promise<Borough> {
    const { data } = await api.patch<Borough>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteBorough(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}

export async function getBoroughCampaignsAll(): Promise<BoroughCampaignLink[]> {
    const { data } = await api.get<BoroughCampaignLink[]>('/borough-campaigns');
    return data;
}
