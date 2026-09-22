export type PartnerStatus = 'active' | 'pending' | 'inactive';

export interface InstitutionalPartner {
    id: string;
    name: string;
    status: PartnerStatus;
    type?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    plaqueCount: number;
    businessCount: number;
    startDate?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PartnerStats {
    total: number;
    active: number;
    pending: number;
    totalPlaques: number;
    totalBusinesses: number;
}

export interface CreatePartnerDto {
    name: string;
    status?: PartnerStatus;
    type?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    plaqueCount?: number;
    businessCount?: number;
    startDate?: string;
}

export interface UpdatePartnerDto {
    name?: string;
    status?: PartnerStatus;
    type?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    plaqueCount?: number;
    businessCount?: number;
    startDate?: string;
}
