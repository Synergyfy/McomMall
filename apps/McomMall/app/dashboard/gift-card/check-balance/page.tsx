'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift, ArrowLeft, Loader2 } from 'lucide-react';
import { useCheckGiftCardBalance } from '@/service/gift-card/hook';

export default function CheckBalancePage() {
  const [cardNumber, setCardNumber] = useState('');
  const [result, setResult] = useState<{
    currentBalance: string;
    initialBalance: string;
    currency: string;
    expiryDate: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checkBalance = useCheckGiftCardBalance();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = cardNumber.trim().toUpperCase();
    if (!code) {
      setError('Enter a gift card number.');
      return;
    }
    setError(null);
    setResult(null);
    try {
      const data = await checkBalance.mutateAsync(code);
      setResult(data as any);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Gift card not found. Check the number and try again.'
      );
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/gift-card"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Check Balance</h1>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <Gift className="h-7 w-7 text-orange-600" />
          </div>
          <h2 className="text-center text-lg font-bold text-gray-900">
            Gift card balance
          </h2>
          <p className="mt-1 text-center text-sm text-gray-500">
            Enter the 16-character card number.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center font-mono text-sm uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={checkBalance.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {checkBalance.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                </>
              ) : (
                'Check balance'
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Available balance
              </p>
              <p className="mt-1 text-4xl font-bold text-emerald-700">
                {result.currency === 'GBP' ? '£' : ''}
                {Number(result.currentBalance).toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-emerald-700">
                Original balance:{' '}
                {result.currency === 'GBP' ? '£' : ''}
                {Number(result.initialBalance).toFixed(2)}
              </p>
              {result.expiryDate && (
                <p className="text-xs text-emerald-700">
                  Expires {new Date(result.expiryDate).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
