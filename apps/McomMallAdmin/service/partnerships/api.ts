import api from '@/service/api';
import { InstitutionalPartner, PartnerStats, CreatePartnerDto, UpdatePartnerDto } from './types';

const ENDPOINT = '/institutional-partners';

export async function getPartners(params?: { status?: string; search?: string }): Promise<InstitutionalPartner[]> {
    const { data } = await api.get<InstitutionalPartner[]>(ENDPOINT, { params });
    return data;
}

export async function getPartnerStats(): Promise<PartnerStats> {
    const { data } = await api.get<PartnerStats>(`${ENDPOINT}/stats`);
    return data;
}

export async function createPartner(dto: CreatePartnerDto): Promise<InstitutionalPartner> {
    const { data } = await api.post<InstitutionalPartner>(ENDPOINT, dto);
    return data;
}

export async function updatePartner(id: string, dto: UpdatePartnerDto): Promise<InstitutionalPartner> {
    const { data } = await api.patch<InstitutionalPartner>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deletePartner(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
