import api from '@/service/api';
import { Verification, VerificationStats, ReviewVerificationDto } from './types';

const ENDPOINT = '/verifications';

export async function getVerifications(params?: {
    status?: string;
    subjectType?: string;
}): Promise<Verification[]> {
    const { data } = await api.get<Verification[]>(ENDPOINT, { params });
    return data;
}

export async function getVerificationStats(): Promise<VerificationStats> {
    const { data } = await api.get<VerificationStats>(`${ENDPOINT}/stats`);
    return data;
}

export async function approveVerification(id: string, dto: ReviewVerificationDto): Promise<Verification> {
    const { data } = await api.patch<Verification>(`${ENDPOINT}/${id}/approve`, dto);
    return data;
}

export async function rejectVerification(id: string, dto: ReviewVerificationDto): Promise<Verification> {
    const { data } = await api.patch<Verification>(`${ENDPOINT}/${id}/reject`, dto);
    return data;
}
