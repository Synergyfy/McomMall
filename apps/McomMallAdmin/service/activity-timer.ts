import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { toast } from 'sonner';
import {
    ActivityTimerType,
    PublishTaskDto,
    ActivityTimerDefinition
} from '@/app/admin/types/activity-timer';

const ACTIVITY_TIMER_API = '/activity-timer';

interface ErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

// --- Publish Task (Admin) ---
export const usePublishActivityTask = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            try {
                const response = await api.post(`${ACTIVITY_TIMER_API}/admin/publish`, data);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to publish task');
            }
        },
        onSuccess: (data) => {
            const count = data?.count || 0;
            const message = count > 0
                ? `Task published successfully to ${count} user${count === 1 ? '' : 's'}`
                : 'Task published successfully (No users matched criteria)';

            toast.success(message);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

// --- Get Published Definitions (Admin) ---
export const useGetActivityTimerDefinitions = () => {
    return useQuery({
        queryKey: ['FETCH_ACTIVITY_DEFINITIONS'],
        queryFn: async () => {
            try {
                const response = await api.get<ActivityTimerDefinition[]>(`${ACTIVITY_TIMER_API}/admin/definitions`);
                return response.data;
            } catch (error: any) {
                const err = error as ErrorResponse;
                throw new Error(err.response?.data?.message || err.message || 'Failed to fetch definitions');
            }
        },
    });
};
