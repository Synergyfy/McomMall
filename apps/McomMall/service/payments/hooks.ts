import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import api from '../api';
import { RootState } from '../store/store';
import {
  ConfirmWalletTopUpRequest,
  CreatePaypalOrderRequest,
  CreateStripeIntentRequest,
  InitiateMembershipPaymentRequest,
  InitiateMembershipPaymentResponse,
  InitiateWalletTopUpRequest,
  InitiateWalletTopUpResponse,
  PauseResumeTrialDto,
  RecordPaymentRequest,
  SubscriptionStatusResponse,
  SubscriptionStatusEnum,
  TrialAction,
  TrialStatusResponse,
  TrialTasks,
  WalletTopUpConfig,
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

const DEFAULT_TRIAL_TASKS: TrialTasks = {
  createdBusiness: false,
  createdProductOrService: false,
  createdPromotion: false,
  createdOffer: false,
  createdCoupon: false,
};

/**
 * Builds a TrialStatusResponse from the PlatformEntitlement captured during SSO
 * login. The entitlement is the authoritative trial source of truth, so the
 * dashboard can always show the trial state (and days remaining) even if the
 * server-to-server re-check on MCOM Central is unavailable.
 */
export function buildTrialStatusFromEntitlement(
  entitlement: any,
): TrialStatusResponse | null {
  if (!entitlement) return null;

  const trial = entitlement.trialContext;
  const accessType = entitlement.access?.accessType;
  const isTrial = Boolean(trial?.isInTrial) || accessType === 'TRIAL_PROGRAMME';
  if (!isTrial) return null;

  const now = Date.now();
  let expiresAt: string | undefined =
    trial?.trialExpiresAt || entitlement.plan?.expiresAt || undefined;

  if (
    !expiresAt &&
    typeof trial?.daysRemaining === 'number' &&
    trial.daysRemaining > 0
  ) {
    expiresAt = new Date(now + trial.daysRemaining * 24 * 60 * 60 * 1000).toISOString();
  }

  const end = expiresAt ? new Date(expiresAt).getTime() : now;
  const remainingTime = Math.max(0, end - now);

  return {
    isActive: remainingTime > 0,
    remainingTime,
    expiresAt,
    tasks: DEFAULT_TRIAL_TASKS,
    programmeTasks: trial?.programmeTasks || [],
    pauses: [],
    isPaused: false,
    remainingPauses: 0,
    isTrialPausable: false,
  };
}

export const useGetTrialStatus = () => {
  const entitlement = useSelector((state: RootState) => state.auth.entitlement);

  const fetchAndTransform = async (): Promise<TrialStatusResponse | null> => {
    // Entitlement resolved at SSO login — used as the primary/fallback source
    // so the trial state is always visible on the dashboard.
    const entitlementTrial = buildTrialStatusFromEntitlement(entitlement);

    try {
      const [statusRes, membershipRes] = await Promise.all([
        api.get<SubscriptionStatusResponse>('/payments/status'),
        api.get<Membership>('/membership/my').catch(() => ({ data: null })), 
      ]);

      const statusData = statusRes.data;
      const membership = membershipRes.data;

      const isTrial =
        statusData.status === SubscriptionStatusEnum.TRIAL_ACTIVE ||
        Boolean((membership as any)?.isTrial) ||
        (membership as any)?.accessType === 'TRIAL_PROGRAMME' ||
        Boolean(entitlementTrial);

      if (!isTrial && statusData.status !== SubscriptionStatusEnum.TRIAL_EXPIRED) {
        return entitlementTrial;
      }

      // Calculate expiresAt from Central entitlement / membership / status
      let expiresAt =
        (membership as any)?.entitlement?.trialContext?.trialExpiresAt ||
        membership?.expiresAt ||
        statusData.trialEndDate ||
        entitlementTrial?.expiresAt ||
        undefined;

      if (!expiresAt && membership && membership.created_at && membership.trialDuration) {
        const createdAt = new Date(membership.created_at);
        const durationMs = membership.trialDuration * 24 * 60 * 60 * 1000;
        expiresAt = new Date(createdAt.getTime() + durationMs).toISOString();
      }

      const now = new Date().getTime();
      const end = expiresAt ? new Date(expiresAt).getTime() : now;
      const remainingTime = Math.max(0, end - now);

      const programmeTasks =
        statusData.programmeTasks ||
        (membership as any)?.programmeTasks ||
        (membership as any)?.entitlement?.trialContext?.programmeTasks ||
        entitlementTrial?.programmeTasks ||
        [];

      return {
        isActive: isTrial && remainingTime > 0,
        remainingTime,
        expiresAt,
        tasks: statusData.tasks || entitlementTrial?.tasks || DEFAULT_TRIAL_TASKS,
        programmeTasks,
        pauses: [],
        isPaused: false,
        remainingPauses: 0,
        isTrialPausable: false,
      };
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      // Fall back to the entitlement captured at login before giving up.
      if (entitlementTrial) {
        return entitlementTrial;
      }
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
    queryKey: ['FETCH_TRIAL_STATUS', entitlement?.trialContext?.trialExpiresAt ?? null],
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
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      // Refresh membership state so the newly active plan disables
      // its card button on the membership page.
      queryClient.invalidateQueries({ queryKey: ['my-membership'] });
      queryClient.invalidateQueries({ queryKey: ['FETCH_SUBSCRIPTION_STATUS'] });
    },
  });

  return mutation;
};

export interface WalletBalance {
  success: boolean;
  linked?: boolean;
  balance?: number;
  availableBalance?: number;
  status?: string;
  currency?: string;
  topUpUrl?: string;
  message?: string;
}

export const useWalletBalance = (enabled = true) => {
  const fetch = async (): Promise<WalletBalance> => {
    const response = await api.get('/payments/wallet/balance');
    return response.data;
  };

  return useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_WALLET_BALANCE'],
    enabled,
    staleTime: 30_000,
  });
};

export const useWalletTopUpConfig = (enabled = true) => {
  const fetch = async (): Promise<WalletTopUpConfig> => {
    const response = await api.get('/payments/wallet/topup/config');
    return response.data;
  };

  return useQuery({
    queryFn: fetch,
    queryKey: ['FETCH_WALLET_TOPUP_CONFIG'],
    enabled,
    staleTime: 60_000,
  });
};

export const useInitiateWalletTopUp = () => {
  const create = async (payload: InitiateWalletTopUpRequest) => {
    try {
      const response = await api.post<InitiateWalletTopUpResponse>(
        '/payments/wallet/topup/initiate',
        payload,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to start card top-up';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return useMutation({
    mutationFn: create,
  });
};

export const useConfirmWalletTopUp = () => {
  const queryClient = useQueryClient();
  const create = async (payload: ConfirmWalletTopUpRequest) => {
    try {
      const response = await api.post('/payments/wallet/topup/confirm', payload);
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to confirm card top-up';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return useMutation({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['FETCH_WALLET_BALANCE'] });
    },
  });
};

export interface InitiateWalletHoldRequest {
  paymentProvider: 'mcom_wallet';
  tierId?: string;
  planVariantId?: string;
  planType?: string;
  idempotencyKey?: string;
}

export interface InitiateWalletHoldResponse {
  holdId: string;
  expiresAt: string;
  provider: string;
}

export const useInitiateWalletHold = () => {
  const create = async (payload: InitiateWalletHoldRequest) => {
    try {
      const response = await api.post<InitiateWalletHoldResponse>(
        '/membership/initiate-payment',
        payload,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to place wallet hold';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return useMutation({
    mutationFn: create,
  });
};

/**
 * Initiates a membership card/PayPal payment processed centrally by MCOM
 * Solutions. Stripe returns a clientSecret (confirm with Solutions'
 * publishable key); PayPal returns an orderId + approvalUrl to redirect to.
 */
export const useInitiateMembershipPayment = () => {
  const create = async (payload: InitiateMembershipPaymentRequest) => {
    try {
      const response = await api.post<InitiateMembershipPaymentResponse>(
        '/membership/initiate-payment',
        payload,
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to start payment';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return useMutation({
    mutationFn: create,
  });
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
