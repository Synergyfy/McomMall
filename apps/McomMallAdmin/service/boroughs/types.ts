export interface BoroughCampaignLink {
    id: string;
    name: string;
    description: string;
    targetAudience: string;
    reach: number;
    impressions: number;
    daysLeft: number;
    merchantCount: number;
    progress: number;
    bannerUrl?: string;
    boroughId?: string | null;
    createdAt: string;
}

export interface Borough {
    id: string;
    name: string;
    activityLevel?: string;
    managerName?: string;
    isActive: boolean;
    campaigns?: BoroughCampaignLink[];
    created_at?: string;
    updated_at?: string;
}

export interface BoroughStats {
    total: number;
    active: number;
    inactive: number;
}

export interface CreateBoroughDto {
    name: string;
    activityLevel?: string;
    managerName?: string;
    isActive?: boolean;
}

export interface UpdateBoroughDto {
    name?: string;
    activityLevel?: string;
    managerName?: string;
    isActive?: boolean;
}
