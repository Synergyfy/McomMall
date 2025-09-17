import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { User, UpdateUserDto } from './types';

const USER_QUERY_KEY = 'user';

// Fetch user profile
const getUserProfile = async (id: string): Promise<User> => {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
};

export const useGetUserProfile = (id: string) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY, id],
    queryFn: () => getUserProfile(id),
    enabled: !!id, // Only run the query if the id is available
  });
};

// Update user profile
const updateUserProfile = async ({
  id,
  ...updateData
}: {
  id: string;
} & UpdateUserDto): Promise<User> => {
  const { data } = await api.patch<User>(`/users/${id}`, updateData);
  return data;
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Invalidate and refetch the user query to get the latest data
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, data.id] });
    },
  });
};
