import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { CreateGroupCircleDto, GroupCircle, GroupCirclesQueryParams, GroupCirclesResponse, UpdateGroupCircleDto, SendMessageDto, GroupCircleMessage, MessageQueryParams, MessagesResponse, AddMemberDto, InitiateContributionDto, InitiateContributionResponse, VerifyContributionDto, Contribution, DiscoverableCirclesResponse } from './types';

const GROUP_CIRCLE_QUERY_KEY = 'groupCircles';
const DISCOVERABLE_CIRCLES_QUERY_KEY = 'discoverableCircles';
const GROUP_CIRCLE_MESSAGES_QUERY_KEY = 'groupCircleMessages';

const fetchGroupCircles = async (params: GroupCirclesQueryParams): Promise<GroupCirclesResponse> => {
    const apiParams = {
        page: params.page || 1,
        limit: params.limit || 10,
    };
    const response = await api.get<GroupCirclesResponse>('/group-circles', { params: apiParams });
    return response.data;
};

const fetchDiscoverableCircles = async (): Promise<DiscoverableCirclesResponse> => {
    // This endpoint should return circles the user can join
    const response = await api.get<DiscoverableCirclesResponse>('/group-circles/discover');
    return response.data;
};

const joinGroupCircle = async (id: string): Promise<void> => {
    await api.post(`/group-circles/${id}/join`);
};

const createGroupCircle = async (data: CreateGroupCircleDto): Promise<GroupCircle> => {
    const response = await api.post<GroupCircle>('/group-circles', data);
    return response.data;
};

const updateGroupCircle = async ({ id, data }: { id: string; data: UpdateGroupCircleDto }): Promise<GroupCircle> => {
    const response = await api.patch<GroupCircle>(`/group-circles/${id}`, data);
    return response.data;
};

const removeGroupCircleMember = async ({ id, memberId }: { id: string; memberId: string }): Promise<void> => {
    await api.delete(`/group-circles/${id}/members/${memberId}`);
};

const fetchGroupCircleMessages = async (id: string, params: MessageQueryParams): Promise<MessagesResponse> => {
    const apiParams = {
        page: params.page || 1,
        limit: params.limit || 50,
        // Temporarily disabled as backend reports they should not exist
        // type: params.type,
        // memberId: params.memberId
    };
    const response = await api.get<MessagesResponse>(`/group-circles/${id}/messages`, { params: apiParams });
    return response.data;
};

const sendMessage = async ({ id, data }: { id: string; data: SendMessageDto }): Promise<GroupCircleMessage> => {
    const response = await api.post<GroupCircleMessage>(`/group-circles/${id}/messages`, data);
    return response.data;
};

const addCircleMember = async ({ id, data }: { id: string; data: AddMemberDto }): Promise<void> => {
    await api.post(`/group-circles/${id}/members`, data);
};

const initiateContribution = async ({ id, data }: { id: string; data: InitiateContributionDto }): Promise<InitiateContributionResponse> => {
    const response = await api.post<InitiateContributionResponse>(`/group-circles/${id}/contributions/initiate`, data);
    return response.data;
};

const verifyContribution = async ({ id, data }: { id: string; data: VerifyContributionDto }): Promise<Contribution> => {
    const response = await api.post<Contribution>(`/group-circles/${id}/contributions/verify`, data);
    return response.data;
};

export const useGetGroupCircles = (params: GroupCirclesQueryParams = {}) => {
    return useQuery({
        queryKey: [GROUP_CIRCLE_QUERY_KEY, params],
        queryFn: () => fetchGroupCircles(params),
    });
};

export const useCreateGroupCircle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createGroupCircle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
        },
    });
};

export const useUpdateGroupCircle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateGroupCircle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
        },
    });
};

export const useRemoveGroupCircleMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeGroupCircleMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
        },
    });
};

export const useGetGroupCircleMessages = (id: string | null, params: MessageQueryParams = {}) => {
    return useQuery({
        queryKey: [GROUP_CIRCLE_MESSAGES_QUERY_KEY, id, params],
        queryFn: () => fetchGroupCircleMessages(id!, params),
        enabled: !!id,
        refetchInterval: 5000, // Poll every 5 seconds for basic real-time
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendMessage,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_MESSAGES_QUERY_KEY, variables.id] });
        },
    });
};

export const useAddCircleMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addCircleMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
        },
    });
};

export const useInitiateGroupCircleContribution = () => {
    return useMutation({
        mutationFn: initiateContribution,
    });
};

export const useVerifyGroupCircleContribution = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: verifyContribution,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
        },
    });
};

export const useGetDiscoverableCircles = () => {
    return useQuery({
        queryKey: [DISCOVERABLE_CIRCLES_QUERY_KEY],
        queryFn: fetchDiscoverableCircles,
    });
};

export const useJoinGroupCircle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: joinGroupCircle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUP_CIRCLE_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [DISCOVERABLE_CIRCLES_QUERY_KEY] });
        },
    });
};
