import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupportTickets, getSupportTicket, addTicketMessage, resolveTicket, closeTicket } from './api';

function errorMessage(error: unknown, fallback: string): string {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
    );
}

export function useGetSupportTickets() {
    return useQuery({ queryKey: ['support-tickets'], queryFn: getSupportTickets });
}

export function useGetSupportTicket(id: string | undefined) {
    return useQuery({
        queryKey: id ? ['support-ticket', id] : ['support-ticket', 'none'],
        queryFn: () => getSupportTicket(id as string),
        enabled: !!id,
    });
}

export function useAddTicketMessage(ticketId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (message: string) => addTicketMessage(ticketId as string, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
            if (ticketId) queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
            toast.success('Reply sent');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to send reply')),
    });
}

export function useResolveTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => resolveTicket(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
            toast.success('Ticket resolved');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to resolve ticket')),
    });
}

export function useCloseTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => closeTicket(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
            toast.success('Ticket closed');
        },
        onError: (e: unknown) => toast.error(errorMessage(e, 'Failed to close ticket')),
    });
}
