export interface AnalyticsMetric {
    value: string;
    change: string;
    changeType: 'up' | 'down';
}

export interface ChartItem {
    day: string;
    value: number;
}

export interface CategoryItem {
    name: string;
    value: string;
    change: string;
}

export interface FunnelItem {
    stage: string;
    value: number;
    pct: number;
}

export interface AdminAnalytics {
    visitors: AnalyticsMetric;
    signups: AnalyticsMetric;
    revenue: AnalyticsMetric;
    conversionRate: AnalyticsMetric;
    visitorChart: ChartItem[];
    revenueChart: ChartItem[];
    topCategories: CategoryItem[];
    topBusinesses: CategoryItem[];
    conversionFunnel: FunnelItem[];
}
