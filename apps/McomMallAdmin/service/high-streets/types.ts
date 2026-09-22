export type HighStreetStatus = 'active' | 'pending' | 'inactive';

export interface HighStreetBorough {
    id: string;
    name: string;
}

export interface HighStreet {
    id: string;
    name: string;
    description?: string;
    status: HighStreetStatus;
    latitude?: number;
    longitude?: number;
    hasPhysicalHub: boolean;
    hasVirtualHub: boolean;
    boroughId?: string | null;
    borough?: HighStreetBorough | null;
    created_at?: string;
    updated_at?: string;
}

export interface HighStreetStats {
    total: number;
    active: number;
    pending: number;
}

export interface CreateHighStreetDto {
    name: string;
    description?: string;
    status?: HighStreetStatus;
    latitude?: number;
    longitude?: number;
    hasPhysicalHub?: boolean;
    hasVirtualHub?: boolean;
    boroughId?: string;
}

export interface UpdateHighStreetDto {
    name?: string;
    description?: string;
    status?: HighStreetStatus;
    latitude?: number;
    longitude?: number;
    hasPhysicalHub?: boolean;
    hasVirtualHub?: boolean;
    boroughId?: string;
}

export interface WizardHighStreetInput {
    name: string;
    borough: string;
    description: string;
    hubType: string;
}
