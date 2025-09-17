import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Review, CreateReviewPayload } from './types';
import { useAuth } from '../auth/hook';

// Get all reviews for a business
export const useGetReviewsForBusiness = (businessId: string) => {
  return useQuery<Review[], Error>({
    queryKey: ['reviews', businessId],
    queryFn: async () => {
      const { data } = await api.get<Review[]>(
        `/reviews/business/${businessId}`
      );
      return data;
    },
    enabled: !!businessId,
  });
};

// Get all reviews for a user
export const useGetReviewsForUser = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<Review[], Error>({
    queryKey: ['reviews', 'user', userId],
    queryFn: async () => {
      const { data } = await api.get<Review[]>(`/reviews/user/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

// Create a new review
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, CreateReviewPayload>({
    mutationFn: async (payload: CreateReviewPayload) => {
      const { data } = await api.post<Review>('/reviews', payload);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate the query for the specific business's reviews
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.businessId],
      });
      // Optionally, invalidate the query for the user's reviews if they are on that page
      queryClient.invalidateQueries({
        queryKey: ['reviews', 'user'],
      });
    },
  });
};
