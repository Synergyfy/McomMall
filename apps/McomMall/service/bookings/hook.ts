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

const getBusinessBookings = async (days?: number): Promise<Booking[]> => {
  const { data } = await api.get('/bookings/business', { params: { days } });
  return data;
};

const getCustomerBookings = async (days?: number): Promise<Booking[]> => {
  const { data } = await api.get('/bookings/customer', { params: { days } });
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

const initiatePayment = async (payload: {
  bookingId: string;
  paymentProvider: 'stripe' | 'paypal';
}) => {
  const { data } = await api.post('/bookings/initiate-payment', payload);
  return data;
};

const verifyPayment = async (payload: {
  bookingId: string;
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
  transactionId: string;
}) => {
  const { data } = await api.post('/bookings/verify-payment', payload);
  return data;
};

const markBookingComplete = async (bookingId: string) => {
  const { data } = await api.put(`/bookings/${bookingId}/complete`);
  return data;
};

const refundBooking = async (bookingId: string) => {
  const { data } = await api.post(`/bookings/${bookingId}/refund`);
  return data;
};

const getAvailableSlots = async (serviceId: string, date: string): Promise<string[]> => {
  const { data } = await api.get('/bookings/available-slots', { params: { serviceId, date } });
  return data;
};


// --- Custom Hooks ---


export const useCreateBooking = ({ onSuccess }: { onSuccess?: (data: any) => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businessBookings'] });
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      toast.success('Booking created successfully!');
      onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useGetBusinessBookings = (days?: number) => {
  return useQuery({
    queryKey: ['businessBookings', days],
    queryFn: () => getBusinessBookings(days),
  });
};

export const useGetCustomerBookings = (days?: number) => {
  return useQuery({
    queryKey: ['customerBookings', days],
    queryFn: () => getCustomerBookings(days),
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

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: initiatePayment,
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to initiate payment. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useVerifyPayment = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessBookings'] });
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      toast.success('Payment verified successfully!');
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to verify payment. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useMarkBookingComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markBookingComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessBookings'] });
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      toast.success('Booking marked as complete!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to mark booking as complete. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useRefundBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refundBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessBookings'] });
      queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
      toast.success('Refund processed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to process refund. Please try again.';
      toast.error(errorMessage);
    },
  });
};

export const useGetAvailableSlots = (serviceId: string, date: string) => {
  return useQuery({
    queryKey: ['availableSlots', serviceId, date],
    queryFn: () => getAvailableSlots(serviceId, date),
    enabled: !!serviceId && !!date,
  });
};
