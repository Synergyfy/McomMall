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

const ADMIN_USERS_QUERY_KEY = 'admin-users';

// Fetch all users (for admin)
const getAllUsers = async (): Promise<User[]> => {
  // This endpoint will be created in a later step
  const { data } = await api.get<User[]>('/admin/users');
  return data;
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY],
    queryFn: getAllUsers,
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
