'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import api from '@/service/api';
import {
  clearPendingPayPalPurchase,
  PayPalPurchasePurpose,
  readPendingPayPalPurchase,
} from '@/lib/paypal-return';
import { getPaymentErrorInfo } from '@/lib/payment-errors';

type Status = 'loading' | 'success' | 'error' | 'cancelled';

const PURPOSE_ENDPOINTS = {
  'gift-card': '/gift-cards/purchase/verify',
  voucher: '/vouchers/verify-purchase',
  coupon: '/coupons/verify-purchase',
} as const;

function PayPalReturnContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Finishing your purchase…');
  const [code, setCode] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<PayPalPurchasePurpose | null>(null);
  const [returnTo, setReturnTo] = useState('/dashboard');
  const [isOrderReturn, setIsOrderReturn] = useState(false);
  const token = searchParams.get('token');
  const cancelled = searchParams.get('cancel') === '1';
  const requestedReturnTo = searchParams.get('returnTo');
  const orderPaymentIntentId = searchParams.get('paymentIntentId');
  const isOrderCheckout = searchParams.get('purpose') === 'order';

  useEffect(() => {
    if (requestedReturnTo?.startsWith('/')) {
      setReturnTo(requestedReturnTo);
    }

    if (cancelled) {
      clearPendingPayPalPurchase();
      setStatus('cancelled');
      setMessage('PayPal checkout was cancelled.');
      return;
    }

    if (isOrderCheckout && orderPaymentIntentId) {
      setIsOrderReturn(true);
      setReturnTo('/dashboard/orders');
      if (!token) {
        setStatus('error');
        setMessage(
          'PayPal did not return an order reference. If you were charged, please contact support.',
        );
        return;
      }

      let active = true;
      api
        .post(`/order/payment-intent/${orderPaymentIntentId}/complete`, {
          orderId: token,
        })
        .then((response) => {
          if (!active) return;
          setCode((response.data as { id?: string })?.id ?? null);
          setStatus('success');
          setMessage('Payment received and your order has been placed.');
        })
        .catch((error: unknown) => {
          if (!active) return;
          setStatus('error');
          setMessage(
            getPaymentErrorInfo(error).message ||
              'We could not finish your order. Please contact support if PayPal shows the payment as completed.',
          );
        });
      return () => {
        active = false;
      };
    }

    if (!token) {
      setStatus('error');
      setMessage(
        'PayPal did not return an order reference. If you were charged, please contact support.',
      );
      return;
    }

    const pending = readPendingPayPalPurchase();
    if (!pending) {
      setStatus('error');
      setMessage(
        'We could not find the purchase this PayPal payment belongs to. Please check your purchases before trying again.',
      );
      return;
    }

    const endpoint = PURPOSE_ENDPOINTS[pending.purpose];
    if (!endpoint) {
      setStatus('error');
      setMessage('Unsupported PayPal purchase type.');
      return;
    }
    setPurpose(pending.purpose);

    const body = {
      paymentProvider: 'paypal',
      transactionId: token,
      purchaseDetails: {
        ...pending.purchaseDetails,
        paymentProvider: 'paypal',
      },
    };

    let active = true;
    api
      .post(endpoint, body)
      .then((response) => {
        if (!active) return;
        const data = response.data as { code?: string };
        setCode(data?.code ?? null);
        clearPendingPayPalPurchase();
        setStatus('success');
        setMessage('Payment received and your purchase has been issued.');
      })
      .catch((error: unknown) => {
        if (!active) return;
        const statusCode = (error as { response?: { status?: number } })
          ?.response?.status;
        setStatus('error');
        setMessage(
          statusCode === 401
            ? 'Please sign in to finish this purchase, then refresh this page.'
            : getPaymentErrorInfo(error).message,
        );
      });

    return () => {
      active = false;
    };
  }, [
    token,
    cancelled,
    requestedReturnTo,
    isOrderCheckout,
    orderPaymentIntentId,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              Confirming PayPal payment
            </h1>
            <p className="mt-2 text-gray-500">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              Payment successful
            </h1>
            <p className="mt-2 text-gray-500">{message}</p>
            {code && (
              <p className="mt-4 rounded-xl bg-gray-50 p-3 font-mono text-sm font-bold tracking-wider text-gray-900">
                {code}
              </p>
            )}
            <Link
              href={
                isOrderReturn ? '/dashboard/orders' : purchaseHistoryPath(purpose)
              }
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700"
            >
              {isOrderReturn ? 'View my orders' : 'View my purchase'}
            </Link>
            <Link
              href={returnTo}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-700 hover:bg-gray-50"
            >
              {isOrderReturn ? 'Back to checkout' : 'Back to the listing'}
            </Link>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <XCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              PayPal checkout cancelled
            </h1>
            <p className="mt-2 text-gray-500">{message}</p>
            <Link
              href={returnTo}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-bold text-white hover:bg-black"
            >
              Return to the listing
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              We could not complete the purchase
            </h1>
            <p className="mt-2 text-gray-500">{message}</p>
            <p className="mt-3 text-xs text-gray-400">
              If PayPal shows the payment as completed, keep this page open and
              contact support with the PayPal receipt. Do not pay again.
            </p>
            <Link
              href={returnTo}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-5 py-3 font-bold text-white hover:bg-black"
            >
              Return to the listing
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

function purchaseHistoryPath(purpose: PayPalPurchasePurpose | null) {
  if (purpose === 'gift-card') return '/dashboard/history/gift-card';
  if (purpose === 'voucher') return '/dashboard/history/my-vouchers';
  return '/dashboard/history/my-coupons';
}

export default function PayPalReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </main>
      }
    >
      <PayPalReturnContent />
    </Suspense>
  );
}
