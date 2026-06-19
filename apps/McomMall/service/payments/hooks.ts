import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api';
import {
  CreatePaypalOrderRequest,
  CreateStripeIntentRequest,
  PauseResumeTrialDto,
  RecordPaymentRequest,
  SubscriptionStatusResponse,
  SubscriptionStatusEnum,
  TrialAction,
  TrialStatusResponse,
} from './types';
import { ErrorResponse } from '../listings/hook';
import { Membership } from '../membership/types';

export const useGetSubscriptionStatus = () => {
  const fetch = async (): Promise<SubscriptionStatusResponse> => {
    try {
      const response = await api.get('/payments/status');
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch subscription status'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_SUBSCRIPTION_STATUS'],
    enabled: true,
  });

  return query;
};

export const useGetTrialStatus = () => {
  const fetchAndTransform = async (): Promise<TrialStatusResponse | null> => {
    try {
      const [statusRes, membershipRes] = await Promise.all([
        api.get<SubscriptionStatusResponse>('/payments/status'),
        api.get<Membership>('/membership/my').catch(() => ({ data: null })), 
      ]);

      const statusData = statusRes.data;
      const membership = membershipRes.data;

      if (statusData.status !== SubscriptionStatusEnum.TRIAL_ACTIVE && statusData.status !== SubscriptionStatusEnum.TRIAL_EXPIRED) {
        return null;
      }

      // Calculate expiresAt from membership creation date + duration
      let expiresAt = statusData.trialEndDate || undefined;
      if (membership && membership.created_at && membership.trialDuration) {
        const createdAt = new Date(membership.created_at);
        const durationMs = membership.trialDuration * 24 * 60 * 60 * 1000;
        expiresAt = new Date(createdAt.getTime() + durationMs).toISOString();
      }

      const now = new Date().getTime();
      const end = expiresAt ? new Date(expiresAt).getTime() : now;
      const remainingTime = Math.max(0, end - now);

      return {
        isActive: statusData.status === SubscriptionStatusEnum.TRIAL_ACTIVE,
        remainingTime,
        expiresAt,
        tasks: statusData.tasks || {
            createdBusiness: false,
            createdProductOrService: false,
            createdPromotion: false,
            createdOffer: false,
            createdCoupon: false,
        },
        pauses: [],
        isPaused: false,
        remainingPauses: 0,
        isTrialPausable: false,
      };
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      // Don't throw an error for 404, it just means no trial exists
      if (err.response?.status === 404) {
        return null;
      }
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch trial status'
      );
    }
  };

  const query = useQuery({
    queryFn: fetchAndTransform,
    queryKey: ['FETCH_TRIAL_STATUS'],
    enabled: true,
  });

  return query;
};

export const useCreateStripeIntent = () => {
  const create = async (payload: CreateStripeIntentRequest) => {
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
  const create = async (payload: CreatePaypalOrderRequest) => {
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
  const create = async (payload: RecordPaymentRequest) => {
    try {
      const amount = payload.amount.toFixed(2);
      const response = await api.post('/payments/record', { ...payload, amount: parseFloat(amount) });
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

export const useGetPaymentHistory = () => {
  const fetch = async (): Promise<any[]> => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch payment history'
      );
    }
  };

  const query = useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_PAYMENT_HISTORY'],
    enabled: true,
  });

  return query;
};
