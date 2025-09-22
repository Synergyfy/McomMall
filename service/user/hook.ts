import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { User, UpdateUserDto } from './types';

const USER_QUERY_KEY = 'my-user';

// Fetch user profile
const getUserProfile = async (): Promise<User> => {
  const { data } = await api.get<User>('/users/me');
  return data;
};

export const useGetUserProfile = () => {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: getUserProfile,
  });
};

// Update user profile
const updateUserProfile = async (updateData: UpdateUserDto): Promise<User> => {
  const { data } = await api.patch<User>('/users/me', updateData);
  return data;
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Invalidate and refetch the user query to get the latest data
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
    },
  });
};
