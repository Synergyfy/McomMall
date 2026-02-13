import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import {
    AdminUserStats,
    GetAdminUsersParams,
    GetAdminUsersResponse,
    AdminBusinessStats,
    GetAdminBusinessesParams,
    GetAdminBusinessesResponse,
    BusinessListing,
    UpdateBusinessDto,
    BusinessDetail,
    CreateAdminUserDto
} from './types';
import { toast } from 'sonner';

// --- API Functions ---

const getUserStats = async (): Promise<AdminUserStats> => {
    const { data } = await api.get('/admin/users/stats');
    return data;
};

const getAdminUsers = async (params: GetAdminUsersParams): Promise<GetAdminUsersResponse> => {
    const { data } = await api.get('/admin/users', { params });
    return data;
};

const getBusinessStats = async (): Promise<AdminBusinessStats> => {
    const { data } = await api.get('/admin/businesses/stats');
    return data;
};

const getAdminBusinesses = async (params: GetAdminBusinessesParams): Promise<GetAdminBusinessesResponse> => {
    const { data } = await api.get('/admin/businesses', { params });
    return data;
};

const getBusinessListings = async (id: string): Promise<BusinessListing[]> => {
    const { data } = await api.get(`/admin/businesses/${id}/listings`);
    return data;
};

const getBusinessDetail = async (id: string): Promise<BusinessDetail> => {
    const { data } = await api.get(`/admin/businesses/${id}`);
    return data;
};

const updateBusiness = async ({ id, data }: { id: string; data: UpdateBusinessDto }): Promise<any> => {
    const res = await api.patch(`/admin/businesses/${id}`, data);
    return res.data;
};

const verifyBusiness = async (id: string): Promise<any> => {
    const res = await api.post(`/admin/businesses/${id}/verify`);
    return res.data;
};

const createAdminUser = async (data: CreateAdminUserDto): Promise<any> => {
    const res = await api.post('/users/admin/create', data);
    return res.data;
};

// --- Hooks ---

export const useGetUserStats = () => {
    return useQuery({
        queryKey: ['admin-user-stats'],
        queryFn: getUserStats,
    });
};

export const useGetAdminUsers = (params: GetAdminUsersParams) => {
    return useQuery({
        queryKey: ['admin-users', params],
        queryFn: () => getAdminUsers(params),
    });
};

export const useGetBusinessStats = () => {
    return useQuery({
        queryKey: ['admin-business-stats'],
        queryFn: getBusinessStats,
    });
};

export const useGetAdminBusinesses = (params: GetAdminBusinessesParams) => {
    return useQuery({
        queryKey: ['admin-businesses', params],
        queryFn: () => getAdminBusinesses(params),
    });
};

export const useGetBusinessListings = (id: string) => {
    return useQuery({
        queryKey: ['business-listings', id],
        queryFn: () => getBusinessListings(id),
        enabled: !!id,
    });
};

export const useGetBusinessDetail = (id: string) => {
    return useQuery({
        queryKey: ['admin-business-detail', id],
        queryFn: () => getBusinessDetail(id),
        enabled: !!id,
    });
};

export const useUpdateBusiness = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateBusiness,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-business-stats'] });
            toast.success('Business updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update business');
        }
    });
};

export const useVerifyBusiness = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: verifyBusiness,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            queryClient.invalidateQueries({ queryKey: ['admin-business-stats'] });
            toast.success('Business verification status updated');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update verification status');
        }
    });
};

export const useCreateAdminUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAdminUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            toast.success('User created successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create user');
        }
    });
};

