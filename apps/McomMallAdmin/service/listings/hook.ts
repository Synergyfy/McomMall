import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '../api';
import {
  CreateBusinessPayload,
  GooglePlaceResult,
  GooglePlaceResults,
  InHouseBusinessResults,
  RecentListings,
  AdminListingStats,
  AdminListingsResponse,
} from './types';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export const useGetGoogleListings = ({
  lat,
  lng,
  queryText,
}: {
  lat: number;
  lng: number;
  queryText: string | null;
}) => {
  const fetch = async () => {
    try {
      const response = await api.get('google/google-business', {
        params: { lat, lng, queryText },
      });
      return response.data.results as GooglePlaceResults;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch businesses'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_GOOGLE_BUSINESSES', lat, lng, queryText],
    enabled: lat && lng ? true : false,
    refetchOnMount: false,
  });
  return query;
};

export const useGetRecentListings = () => {
  const fetch = async () => {
    try {
      const response = await api.get('listings/recent');
      return response.data as RecentListings;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch recent listings'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_RECENT_LISTINGS'],
  });
  return query;
};

export const useEditListing = () => {
  const router = useRouter();
  const edit = async ({
    listingId,
    payload,
  }: {
    listingId: string;
    payload: CreateBusinessPayload;
  }) => {
    try {
      const response = await api.patch(`listings/${listingId}`, { ...payload });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to edit listing'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: edit,
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  const remove = async (listingId: string) => {
    try {
      const response = await api.delete(`listings/${listingId}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to delete listing'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: remove,
    onSuccess: data => {
      toast.success(data.message || 'Listing deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['FETCH_USER_LISTINGS'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};

export const useGetBusinessData = ({ id }: { id: string }) => {
  const fetcher = async () => {
    try {
      const response = await api.get(`listings/${id}`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to fetch business'
      );
    }
  };

  const query = useQuery({
    queryFn: fetcher,
    queryKey: ['FETCH_BUSINESS_DATA', id],
    enabled: !!id,
  });

  return query;
};

export const useGetInHouseBusiness = ({
  queryText,
}: {
  queryText: string | null;
}) => {
  const fetcher = async () => {
    try {
      const response = await api.get('listings/search', {
        params: { queryText },
      });
      return response.data as InHouseBusinessResults;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch in-house businesses'
      );
    }
  };

  const query = useQuery({
    queryFn: fetcher,
    queryKey: ['FETCH_IN_HOUSE_BUSINESSES', queryText],
    enabled: !!queryText,
    refetchOnMount: false,
  });
  return query;
};

export const useAddListing = () => {
  const router = useRouter();
  const create = async (payload: CreateBusinessPayload) => {
    try {
      const response = await api.post('listings', { ...payload });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to create listing'
      );
    }
  };

  const mutation = useMutation({
    mutationFn: create,
    onSuccess: data => {
      toast.success(data.message || 'Listing created successfully!');
      router.push('/dashboard/my-listings');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};

export const useGetGoogleListing = ({ placeId }: { placeId: string }) => {
  const fetch = async () => {
    if (!placeId) {
      return null;
    }
    try {
      const response = await api.get(`google/google-business/${placeId}`);
      return (response.data.result as GooglePlaceResult) || null;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to fetch business'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_GOOGLE_BUSINESS', placeId],
    refetchOnMount: false,
    staleTime: Infinity,
    enabled: !!placeId,
  });
  return query;
};

export const useGetPlacePhoto = (photoReference: string) => {
  const fetch = async () => {
    try {
      const response = await api.get(`photos/photo/${photoReference}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to fetch photo'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_PLACE_PHOTO', photoReference],
    enabled: !!photoReference,
  });

  return query;
};

// --- Admin Listings Hooks ---

export const useGetAdminListingStats = () => {
  const fetch = async () => {
    try {
      const response = await api.get('admin/listings/stats');
      return response.data as AdminListingStats;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to fetch listing statistics'
      );
    }
  };

  return useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_ADMIN_LISTING_STATS'],
  });
};

export const useGetAdminListings = (params?: { page?: number; limit?: number }) => {
  const fetch = async () => {
    try {
      const response = await api.get('/admin/listings', { params });
      return response.data as AdminListingsResponse;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to fetch all listings'
      );
    }
  };

  return useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_ALL_ADMIN_LISTINGS', params],
  });
};

export const useToggleListingFeatured = () => {
  const queryClient = useQueryClient();
  const toggle = async (id: string) => {
    try {
      const response = await api.patch(`admin/listings/${id}/featured`);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message || err.message || 'Failed to toggle featured status'
      );
    }
  };

  return useMutation({
    mutationFn: toggle,
    onSuccess: (data) => {
      toast.success(data.message || 'Listing featured status updated');
      queryClient.invalidateQueries({ queryKey: ['FETCH_ALL_ADMIN_LISTINGS'] });
      queryClient.invalidateQueries({ queryKey: ['FETCH_ADMIN_LISTING_STATS'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useGetUserListings = () => {
  const fetch = async () => {
    try {
      const response = await api.get('listings/mine');
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch user listings'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_USER_LISTINGS'],
  });
  return query;
};
