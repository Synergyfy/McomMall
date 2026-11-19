export interface OwnerStatsDto {
  totalAmountEarnedFromProductOrders: number;
  totalAmountEarnedFromGiftCard: number;
  totalOffersRedeemed: number;
  totalAmountSpentOnCoupon: number;
  totalAmountOfVoucherPurchased: number;
  totalAmountOfProduct: number;
  totalAmountOfService: number;
  totalAmountOfListing: number;
  totalWalletBalance: number;
}

export interface CustomerStatsDto {
  pointsBalance: number;
  totalAmountSpentOnProductOrdered: number;
  totalNumberOfProductOrdered: number;
  totalNumberOfServiceBooked: number;
  totalNumberOfPointsEarned: number;
  totalNumberOfPointsRedeemed: number;
  totalAmountSpentOnVoucher: number;
  totalAmountSpentOnGiftCards: number;
}

export interface SalesChartData {
  date: string;
  giftCardSales: number;
  voucherSales: number;
  orderSales: number;
  bookingPayments: number;
}

export interface SalesChartQuery {
  startDate?: string;
  endDate?: string;
  allTime?: boolean;
}

export interface ReportMetric {
  totalCustomers: number;
  totalPassersby: number;
  conversionRate: number;
  boroughRank: number;
  boroughRankChange: number;
  activeCampaigns: number;
  monthlyReach: number;
  engagementRate: number;
}

export interface TrafficTrendData {
  date: string;
  passersby: number;
  customers: number;
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  actionLink: string;
}

export interface StorefrontReportData {
  period: 'weekly' | 'monthly';
  trafficTrends: TrafficTrendData[];
  metrics: ReportMetric;
  suggestedActions: SuggestedAction[];
}
