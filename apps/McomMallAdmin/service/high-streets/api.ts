import api from '@/service/api';
import { HighStreet, HighStreetStats, CreateHighStreetDto, UpdateHighStreetDto } from './types';

const ENDPOINT = '/high-streets';

export async function getHighStreets(params?: { status?: string; boroughId?: string }): Promise<HighStreet[]> {
    const { data } = await api.get<HighStreet[]>(ENDPOINT, { params });
    return data;
}

export async function getHighStreetStats(): Promise<HighStreetStats> {
    const { data } = await api.get<HighStreetStats>(`${ENDPOINT}/stats`);
    return data;
}

export async function createHighStreet(dto: CreateHighStreetDto): Promise<HighStreet> {
    const { data } = await api.post<HighStreet>(ENDPOINT, dto);
    return data;
}

export async function updateHighStreet(id: string, dto: UpdateHighStreetDto): Promise<HighStreet> {
    const { data } = await api.patch<HighStreet>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteHighStreet(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
