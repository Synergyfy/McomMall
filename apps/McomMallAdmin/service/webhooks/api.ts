import api from '@/service/api';
import { Webhook, CreateWebhookDto, UpdateWebhookDto } from './types';

const ENDPOINT = '/webhooks';

export async function getWebhooks(): Promise<Webhook[]> {
    const { data } = await api.get<Webhook[]>(ENDPOINT);
    return data;
}

export async function createWebhook(dto: CreateWebhookDto): Promise<Webhook> {
    const { data } = await api.post<Webhook>(ENDPOINT, dto);
    return data;
}

export async function updateWebhook(id: string, dto: UpdateWebhookDto): Promise<Webhook> {
    const { data } = await api.patch<Webhook>(`${ENDPOINT}/${id}`, dto);
    return data;
}

export async function deleteWebhook(id: string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
}
