export type AuditType = 'short' | 'full' | 'storefront' | 'visibility';

export interface AuditBusiness {
    id: string;
    businessName?: string;
}

export interface AuditUser {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
}

export interface StorefrontAudit {
    id: string;
    type: AuditType;
    score: number;
    storefrontScore: number;
    revenueLift: number;
    responses: unknown;
    suggestions: { title?: string; description?: string }[] | unknown;
    userId: string;
    user?: AuditUser | null;
    businessId?: string;
    business?: AuditBusiness | null;
    created_at?: string;
}

export interface AuditStats {
    total: number;
    avgScore: number;
    avgStorefrontScore: number;
    byType: { type: string; count: number }[];
}
