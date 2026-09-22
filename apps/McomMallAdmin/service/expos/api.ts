import api from '@/service/api';
import { Expo, ExpoStats, CreateExpoDto, UpdateExpoDto } from './types';

const ENDPOINT = '/expos';

export async function getExpos(params?: { status?: string; boroughId?: string }): Promise<Expo[]> {
    const { data } = await api.get<Expo[]>(ENDPOINT, { params });
    return data;
}

export async function getExpoStats(): Promise<ExpoStats> {
    const { data } = await api.get<ExpoStats>(`${ENDPOINT}/stats`);
    return data;
}

export async function createExpo(dto: CreateExpoDto): Promise<Expo> {
    const { data } = await api.post<Expo>(ENDPOINT, dto);
    return data;
}

export async function updateExpo(id: string, dto: UpdateExpoDto): Promise<Expo> {
    const { data } = await api.patch<Expo>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteExpo(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
