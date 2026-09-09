import { useState, useCallback, useEffect } from 'react';
import api from '@/service/api';

export interface DiscoverBusiness {
  id: string;
  businessName: string;
  shortDescription: string;
  heroImage?: string;
  category?: { name: string };
  sector?: { name: string };
  location?: {
    city?: string;
    postcode?: string;
    addressLine1?: string;
  };
  rating?: number;
  distance?: string;
  borough?: string;
  latitude?: number;
  longitude?: number;
}

export interface DiscoverPromotion {
  id: string;
  title: string;
  description: string;
  business?: { businessName: string };
  value?: string;
  expiryText?: string;
  startDate: string;
  endDate: string;
}

export interface DiscoverEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  borough?: string;
  image?: string;
  attendees?: number;
  latitude?: number;
  longitude?: number;
  business?: { businessName: string };
  isJoined?: boolean;
  isSaved?: boolean;
  category?: string;
}

export interface DiscoverReward {
  id: string;
  title: string;
  brand?: string;
  description: string;
  cost: number;
  expiryText: string;
  image?: string;
  badgeIcon?: string;
  rewardType?: string;
  isHot?: boolean;
  isLocked?: boolean;
}

export interface DiscoverHomeFeed {
  businesses: DiscoverBusiness[];
  promotions: DiscoverPromotion[];
  events: DiscoverEvent[];
  rewards: DiscoverReward[];
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export function useDiscoverHomeFeed() {
  const [data, setData] = useState<DiscoverHomeFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/discover/home');
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch discover feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDiscoverBusinesses(params?: {
  tab?: string;
  lat?: number;
  lng?: number;
  search?: string;
  page?: number;
  limit?: number;
  borough?: string;
}) {
  const [data, setData] = useState<PaginatedResponse<DiscoverBusiness> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/discover/businesses', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDiscoverEvents(params?: {
  tab?: string;
  lat?: number;
  lng?: number;
  borough?: string;
  page?: number;
  limit?: number;
  joinedIds?: string;
  savedIds?: string;
}) {
  const [data, setData] = useState<PaginatedResponse<DiscoverEvent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/discover/events', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDiscoverPromotions(params?: {
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<DiscoverPromotion> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/discover/promotions', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDiscoverRewards(params?: {
  tab?: string;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<DiscoverReward> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/discover/rewards', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useBoroughCampaigns(borough?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/discover/borough-campaigns', { params: { borough } });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch borough campaigns');
    } finally {
      setLoading(false);
    }
  }, [borough]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useHighStreet(borough?: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/discover/high-street', { params: { borough } });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch high street data');
    } finally {
      setLoading(false);
    }
  }, [borough]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}