export interface GameBusiness {
    id: string;
    businessName?: string;
}

export interface PlatformGame {
    id: string;
    title: string;
    gameType: string;
    rewardType: string;
    rewardValue: string;
    rewardQty: number;
    status: string;
    totalParticipants: number;
    gamesPlayed: number;
    rewardsIssued: number;
    rewardsClaimed: number;
    businessId: string;
    business?: GameBusiness | null;
    created_at?: string;
}

export interface GamificationSummary {
    totalGames: number;
    activeGames: number;
    totalParticipants: number;
    gamesPlayed: number;
    rewardsIssued: number;
    rewardsClaimed: number;
}
