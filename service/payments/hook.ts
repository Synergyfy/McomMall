import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import {
  PauseResumeTrialDto,
  RecordPaymentDto,
  SubscriptionStatusResponse,
  TrialAction,
} from './types';
import { ErrorResponse } from '../listings/hook';

export const useGetTrialStatus = () => {
  const fetch = async (): Promise<SubscriptionStatusResponse> => {
    try {
      const response = await api.get('/trial');
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch trial status'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_TRIAL_STATUS'],
    enabled: true,
  });

  return query;
};

export const useCreateStripeIntent = () => {
  const create = async (payload: { amount: number }) => {
    try {
      const response = await api.post('/payments/stripe/create-intent', payload);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create Stripe Payment Intent';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const mutation = useMutation({
    mutationFn: create,
  });

  return mutation;
};

export const useCreatePayPalOrder = () => {
  const create = async (payload: { amount: number }) => {
    try {
      const response = await api.post('/payments/paypal/create-order', payload);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create PayPal order';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const mutation = useMutation({
    mutationFn: create,
  });

  return mutation;
};

export const useRecordPayment = () => {
  const create = async (payload: RecordPaymentDto) => {
    try {
      const amount = payload.amount.toFixed(2);
      const response = await api.post('/payments/record', {...payload, amount: parseFloat(amount) });
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to record payment';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const mutation = useMutation({
    mutationFn: create,
  });

  return mutation;
};

export const usePauseOrPlay = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: PauseResumeTrialDto) => {
      const { action } = payload;
      const endpoint =
        action === TrialAction.PAUSE ? '/trial/pause' : '/trial/resume';
      return api.post(endpoint);
    },
    onSuccess: () => {
      toast.success('Trial status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['FETCH_TRIAL_STATUS'] });
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update trial status';
      toast.error(errorMessage);
    },
  });

  return mutation;
};
