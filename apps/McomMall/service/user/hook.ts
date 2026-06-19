import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { User, UpdateUserDto, CustomerStats } from './types';

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

// Fetch user profile by ID
const getUserById = async (userId: string): Promise<User> => {
  const { data } = await api.get<User>(`/users/${userId}`);
  return data;
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
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
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
    },
  });
};

const getCustomerStats = async (): Promise<CustomerStats> => {
  const { data } = await api.get('/stats');
  return data;
};

export const useGetCustomerStats = () => {
  return useQuery({
    queryKey: ['customerStats'],
    queryFn: getCustomerStats,
  });
};

// Change user password
const changePassword = async (payload: any): Promise<any> => {
  const { data } = await api.post('/users/change-password', payload);
  return data;
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};
