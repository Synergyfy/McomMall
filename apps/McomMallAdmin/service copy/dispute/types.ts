export type DisputeStatus = 'new' | 'under_review' | 'mediated' | 'resolved' | 'escalated';

export type DisputeReason = 'not_received' | 'not_as_described' | 'defective' | 'wrong_item' | 'seller_unresponsive' | 'other';

export interface Dispute {
    id: string;
    customerName: string;
    customerId: string;
    businessName: string;
    businessId: string;
    orderId: string;
    amount: number;
    reason: DisputeReason;
    description: string;
    status: DisputeStatus;
    evidence: string[];
    createdAt: string;
}

export interface DisputeStats {
    total: number;
    open: number;
    underReview: number;
    escalated: number;
}

export interface GetDisputesParams {
    search?: string;
    status?: DisputeStatus | 'under_review'; // Note: query param example had under_review
    reason?: DisputeReason;
    page?: number;
    limit?: number;
}

export interface GetDisputesResponse {
    data: Dispute[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface DashboardStats {
    pendingListings: number;
    newSignups24h: number;
    transactionsToday: number;
    revenueToday: number;
    activeUsers: number;
    totalBusinesses: number;
}

export interface AnalyticsPoint {
    date: string;
    value: number;
}

export interface DashboardAnalytics {
    signups: AnalyticsPoint[];
    revenue: AnalyticsPoint[];
    weeklySignups: number;
    weeklyRevenue: number;
}

export interface RecentActivity {
    type: string;
    message: string;
    timestamp: string;
}

export interface AdminDashboardResponse {
    stats: DashboardStats;
    analytics: DashboardAnalytics;
    recentActivity: RecentActivity[];
}
