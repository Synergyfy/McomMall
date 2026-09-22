export type ExpoStatus = 'planning' | 'upcoming' | 'active' | 'ended' | 'cancelled';

export interface ExpoBorough {
    id: string;
    name: string;
}

export interface Expo {
    id: string;
    name: string;
    description?: string;
    venue?: string;
    status: ExpoStatus;
    startDate?: string;
    endDate?: string;
    boroughId?: string | null;
    borough?: ExpoBorough | null;
    created_at?: string;
    updated_at?: string;
}

export interface ExpoStats {
    total: number;
    planning: number;
    upcoming: number;
    active: number;
    ended: number;
}

export interface CreateExpoDto {
    name: string;
    description?: string;
    venue?: string;
    status?: ExpoStatus;
    startDate?: string;
    endDate?: string;
    boroughId?: string;
}

export interface UpdateExpoDto {
    name?: string;
    description?: string;
    venue?: string;
    status?: ExpoStatus;
    startDate?: string;
    endDate?: string;
    boroughId?: string;
}
