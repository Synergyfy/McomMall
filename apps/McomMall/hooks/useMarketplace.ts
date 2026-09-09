import { useState, useCallback, useEffect } from 'react';
import api from '@/service/api';

export interface MarketplaceProduct {
  id: string;
  title: string;
  price: number;
  salePrice?: number;
  shortDescription?: string;
  description?: string;
  media: string[];
  category?: string;
  subCategory?: string;
  brand?: string;
  stock?: number;
  enableStockManagement?: boolean;
  business?: {
    id: string;
    businessName: string;
    logoUrl?: string;
  };
  averageRating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
}

export interface MarketplaceService {
  id: string;
  name: string;
  description?: string;
  pricingModel: string;
  fixedPrice?: number;
  pricePerHour?: number;
  pricePerUnit?: number;
  unitName?: string;
  category?: string;
  subcategory?: string;
  media: any;
  business?: {
    id: string;
    businessName: string;
    logoUrl?: string;
  };
  averageRating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  duration?: string;
}

export interface MarketplaceGiftCard {
  id: string;
  name: string;
  description?: string;
  backgroundImageUrl?: string;
  backgroundColor?: string;
  fixedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  expiryPeriodDays?: number;
  bonusThreshold?: number;
  bonusAmount?: number;
  owner?: {
    id: string;
    businessName: string;
    logoUrl?: string;
  };
}

export interface MarketplaceVoucher {
  id: string;
  name: string;
  description?: string;
  fixedAmounts: number[];
  allowCustomAmount: boolean;
  minCustomAmount?: number;
  maxCustomAmount?: number;
  usage: string;
  backgroundImage?: string;
  voucherType: string;
  valueType: string;
  value?: number;
  expiryDays?: number;
  user?: {
    id: string;
    businessName: string;
    logoUrl?: string;
  };
}

export interface MarketplaceCoupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountValue: number;
  discountType: string;
  status: string;
  startDate?: string;
  expiresAt?: string;
  business?: {
    id: string;
    businessName: string;
    logoUrl?: string;
  };
  usageLimit?: number;
  perUserLimit?: number;
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

export function useMarketplaceProducts(params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<MarketplaceProduct> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/product/public', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useMarketplaceServices(params?: {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<MarketplaceService> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/services/public', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useMarketplaceGiftCards(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<MarketplaceGiftCard> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/gift-cards/templates/public', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch gift cards');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useMarketplaceVouchers(params?: {
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<MarketplaceVoucher> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/vouchers/products/public', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useMarketplaceCoupons(params?: {
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PaginatedResponse<MarketplaceCoupon> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/coupons/list', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function usePublicPromotions(params?: {
  limit?: number;
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/promotions/active', { params });
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