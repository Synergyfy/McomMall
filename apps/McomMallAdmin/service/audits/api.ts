import api from '@/service/api';
import { StorefrontAudit, AuditStats } from './types';

const ENDPOINT = '/business/audits/admin';

export async function getAdminAudits(businessId?: string): Promise<StorefrontAudit[]> {
    const { data } = await api.get<StorefrontAudit[]>(`${ENDPOINT}/all`, {
        params: businessId ? { businessId } : undefined,
    });
    return data;
}

export async function getAdminAuditStats(): Promise<AuditStats> {
    const { data } = await api.get<AuditStats>(`${ENDPOINT}/stats`);
    return data;
}
