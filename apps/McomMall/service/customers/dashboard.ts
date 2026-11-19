import { useQuery } from '@tanstack/react-query';
import api from '@/service/api';

/**
 * Customer dashboard data comes from the mall API, which resolves the
 * shopper's assigned Central borough and filters offers, campaigns, events and
 * businesses to that borough.
 */

export interface CustomerHomeLocation {
  borough: string | null;
  city: string | null;
  highStreet: string | null;
  localMall: string | null;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  source: 'profile' | 'postcode' | 'geolocation' | 'nearest' | 'none';
}

export interface CustomerHomeTrendingBusiness {
  id: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  shortDescription: string;
  distance?: string | null;
  tag?: string;
}

export interface CustomerHomeDeal {
  id: string;
  name: string;
  description: string;
  points: number;
  businesses: string[];
}

export interface CustomerHomeEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string | null;
  location: string;
  borough?: string | null;
  category: string;
  capacity: number;
  attendees: number;
  image?: string | null;
  businessName?: string | null;
  status: string;
}

export interface CustomerHomeActivity {
  businessId: string;
  businessName: string;
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
  }>;
}

export interface CustomerHomeResponse {
  user: {
    id: string;
    name: string;
    points: number;
  };
  location: CustomerHomeLocation;
  pointsBreakdown: {
    earned: number;
    used: number;
    pending: number;
  };
  liveOffersCount: number;
  newOffersCount: number;
  activeCampaignsCount: number;
  trending: CustomerHomeTrendingBusiness[];
  recentActivity: CustomerHomeActivity[];
  nearbyDeals: CustomerHomeDeal[];
  events: CustomerHomeEvent[];
}

export const useCustomerHome = (borough?: string) =>
  useQuery<CustomerHomeResponse>({
    queryKey: ['customer', 'home', borough ?? 'assigned'],
    queryFn: async () => {
      const { data } = await api.get<CustomerHomeResponse>('/customer/home', {
        params: borough ? { borough } : undefined,
      });
      return data;
    },
    staleTime: 60 * 1000,
  });

export interface CustomerReward {
  id: string;
  title: string;
  brand: string;
  category: string;
  cost: number;
  description: string;
  longDescription: string;
  image: string;
  badgeIcon: string;
  rewardType: string;
  usageCondition?: string;
  isHot: boolean;
  isLocked: boolean;
  pointsRequired: number;
  tier?: string | null;
  expiresAt?: string | null;
  expiryText: string;
}

export interface CustomerRewardsResponse {
  pointsBalance: number;
  pointsBreakdown: {
    earned: number;
    used: number;
    pending: number;
  };
  rewards: CustomerReward[];
  redeemed: Array<{
    id: string;
    rewardId: string;
    title: string;
    brand: string;
    cost: number;
    status: string;
    redeemedAt: string;
    issuedCode?: string | null;
  }>;
  expiring: CustomerReward[];
}

export const useCustomerRewards = () =>
  useQuery<CustomerRewardsResponse>({
    queryKey: ['customer', 'rewards'],
    queryFn: async () => {
      const { data } = await api.get<CustomerRewardsResponse>(
        '/customer/rewards',
      );
      return data;
    },
    staleTime: 60 * 1000,
  });
