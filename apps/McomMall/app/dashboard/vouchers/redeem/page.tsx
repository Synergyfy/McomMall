'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Ticket } from 'lucide-react';
import { useRedeemVoucherManual } from '@/service/hooks/useVoucherService';
import { CURRENCY } from '@/lib/utils';

export default function RedeemVoucherPage() {
  const [code, setCode] = useState('');
  const [redeemed, setRedeemed] = useState<any>(null);
  const redeem = useRedeemVoucherManual();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      toast.error('Enter a voucher code.');
      return;
    }
    try {
      const result = await redeem.mutateAsync({ code: code.trim().toUpperCase() });
      setRedeemed(result);
      toast.success('Voucher redeemed.');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Could not redeem this voucher.'
      );
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/vouchers"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Redeem Voucher</h1>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <Ticket className="h-7 w-7 text-orange-600" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Voucher code"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center font-mono text-sm uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={redeem.isPending}
              className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {redeem.isPending ? 'Redeeming…' : 'Redeem voucher'}
            </button>
          </form>

          {redeemed && (
            <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">
                Voucher {redeemed.code} redeemed
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Remaining balance: {CURRENCY}
                {Number(redeemed.balance ?? 0).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
