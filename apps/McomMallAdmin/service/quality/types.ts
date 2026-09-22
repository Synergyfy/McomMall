export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface MissionBusiness {
    id: string;
    businessName?: string;
}

export interface QualityMission {
    id: string;
    businessId: string;
    business?: MissionBusiness | null;
    shopperName: string;
    status: MissionStatus;
    score?: number;
    notes?: string;
    scheduledFor?: string;
    created_at?: string;
    updated_at?: string;
}

export interface MissionStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    avgScore: number;
}

export interface CreateQualityMissionDto {
    businessId: string;
    shopperName: string;
    status?: MissionStatus;
    score?: number;
    notes?: string;
    scheduledFor?: string;
}

export interface UpdateQualityMissionDto {
    businessId?: string;
    shopperName?: string;
    status?: MissionStatus;
    score?: number;
    notes?: string;
    scheduledFor?: string;
}
