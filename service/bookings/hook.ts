import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/service/api';
import { Booking } from './types';
import { toast } from 'sonner';

// --- API Functions ---

import { CreateBookingPayload } from './types';

const createBooking = async (bookingData: CreateBookingPayload): Promise<Booking> => {
  const { data } = await api.post('/bookings', bookingData);
  return data;
};

const getBusinessBookings = async (): Promise<Booking[]> => {
  const { data } = await api.get('/bookings/business');
  return data;
};

const getCustomerBookings = async (): Promise<Booking[]> => {
  const { data } = await api.get('/bookings/customer');
  return data;
};

const checkAvailability = async (payload: {
  businessId: string;
  startTime: string;
  endTime: string;
}): Promise<boolean> => {
  const { data } = await api.post('/bookings/check-availability', payload);
  return data;
};

const approveBooking = async (bookingId: string): Promise<Booking> => {
  const { data } = await api.put(`/bookings/${bookingId}/approve`);
  return data;
};

const declineBooking = async (bookingId: string): Promise<Booking> => {
  const { data } = await api.put(`/bookings/${bookingId}/decline`);
  return data;
};

const cancelBooking = async (bookingId: string): Promise<Booking> => {
    const { data } = await api.put(`/bookings/${bookingId}/cancel`);
    return data;
};

// --- Custom Hooks ---

export const useCreateBooking = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessBookings'] });
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      toast.success('Booking created successfully!');
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useGetBusinessBookings = () => {
  return useQuery({
    queryKey: ['businessBookings'],
    queryFn: getBusinessBookings,
  });
};

export const useGetCustomerBookings = () => {
  return useQuery({
    queryKey: ['customerBookings'],
    queryFn: getCustomerBookings,
  });
};

export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: checkAvailability,
    onSuccess: (data) => {
      if (data) {
        toast.success('Slot is available!');
      } else {
        toast.error('Slot is not available.');
      }
    }
  });
};

export const useApproveBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessBookings'] });
      toast.success('Booking approved successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to approve booking. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useDeclineBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: declineBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessBookings'] });
      toast.success('Booking declined successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to decline booking. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
            toast.success('Booking cancelled successfully!');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to cancel booking. Please try again.';
            toast.error(errorMessage);
        },
    });
};
