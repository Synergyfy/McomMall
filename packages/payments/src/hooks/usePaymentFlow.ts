'use client';

import { useCallback, useRef, useState } from 'react';

export type PaymentFlowStatus =
  | 'idle'
  | 'initiating'
  | 'awaiting_provider'
  | 'confirming'
  | 'done'
  | 'error';

export interface UsePaymentFlowOptions<THandle, TResult> {
  /** Create the provider handle (clientSecret / orderId / holdId). */
  initiate: () => Promise<THandle>;
  /**
   * Verify the provider result server-side and complete the purchase.
   * `transactionId` is what the Stripe/PayPal widget hands back.
   */
  confirm: (transactionId: string, handle: THandle) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

export interface UsePaymentFlowResult<THandle, TResult> {
  status: PaymentFlowStatus;
  handle: THandle | null;
  result: TResult | null;
  error: unknown;
  isBusy: boolean;
  start: () => Promise<THandle | null>;
  confirm: (transactionId: string) => Promise<TResult | null>;
  reset: () => void;
}

/**
 * The one payment state machine used by every product modal.
 *
 * It deliberately knows nothing about rails or endpoints: a caller passes its
 * own `initiate` and `confirm` callbacks. That keeps the domain endpoints
 * (gift-card, voucher, booking, membership, ...) while removing the duplicated
 * status/error handling from each modal.
 */
export function usePaymentFlow<THandle, TResult>(
  options: UsePaymentFlowOptions<THandle, TResult>,
): UsePaymentFlowResult<THandle, TResult> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [status, setStatus] = useState<PaymentFlowStatus>('idle');
  const [handle, setHandle] = useState<THandle | null>(null);
  const handleRef = useRef<THandle | null>(null);
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const busy = useRef(false);

  const start = useCallback(async () => {
    if (busy.current) return null;
    busy.current = true;
    setStatus('initiating');
    setError(null);
    setResult(null);
    try {
      const next = await optionsRef.current.initiate();
      handleRef.current = next;
      setHandle(next);
      setStatus('awaiting_provider');
      return next;
    } catch (err) {
      setError(err);
      setStatus('error');
      optionsRef.current.onError?.(err);
      return null;
    } finally {
      busy.current = false;
    }
  }, []);

  const confirm = useCallback(async (transactionId: string) => {
    if (busy.current) return null;
    const current = handleRef.current;
    if (current == null) {
      const err = new Error('No payment handle to confirm.');
      setError(err);
      setStatus('error');
      optionsRef.current.onError?.(err);
      return null;
    }
    busy.current = true;
    setStatus('confirming');
    setError(null);
    try {
      const next = await optionsRef.current.confirm(transactionId, current);
      setResult(next);
      setStatus('done');
      optionsRef.current.onSuccess?.(next);
      return next;
    } catch (err) {
      setError(err);
      setStatus('error');
      optionsRef.current.onError?.(err);
      return null;
    } finally {
      busy.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    busy.current = false;
    handleRef.current = null;
    setStatus('idle');
    setHandle(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    handle,
    result,
    error,
    isBusy: status === 'initiating' || status === 'confirming',
    start,
    confirm,
    reset,
  };
}
