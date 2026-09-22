import api from '@/service/api';
import { SupportTicket, SupportMessage } from './types';

const ENDPOINT = '/support-tickets';

export async function getSupportTickets(): Promise<SupportTicket[]> {
    const { data } = await api.get<SupportTicket[]>(ENDPOINT);
    return data;
}

export async function getSupportTicket(id: string): Promise<SupportTicket> {
    const { data } = await api.get<SupportTicket>(`${ENDPOINT}/${id}`);
    return data;
}

export async function addTicketMessage(id: string, message: string): Promise<SupportMessage> {
    const { data } = await api.post<SupportMessage>(`${ENDPOINT}/${id}/messages`, { message });
    return data;
}

export async function resolveTicket(id: string): Promise<SupportTicket> {
    const { data } = await api.patch<SupportTicket>(`${ENDPOINT}/${id}/resolve`);
    return data;
}

export async function closeTicket(id: string): Promise<SupportTicket> {
    const { data } = await api.patch<SupportTicket>(`${ENDPOINT}/${id}/close`);
    return data;
}
