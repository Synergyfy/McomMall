import { useQuery } from '@tanstack/react-query';
import { getAdminAudits, getAdminAuditStats } from './api';

export function useGetAdminAudits(businessId?: string) {
    return useQuery({
        queryKey: ['admin-audits', businessId ?? 'all'],
        queryFn: () => getAdminAudits(businessId),
    });
}

export function useGetAdminAuditStats() {
    return useQuery({ queryKey: ['admin-audits', 'stats'], queryFn: getAdminAuditStats });
}
