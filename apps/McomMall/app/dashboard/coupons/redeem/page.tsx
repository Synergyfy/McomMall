'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Ticket } from 'lucide-react';
import { useRedeemCouponManual } from '@/service/coupons/hook';
import { CURRENCY } from '@/lib/utils';

export default function RedeemCouponPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const redeem = useRedeemCouponManual();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      toast.error('Enter a coupon code.');
      return;
    }
    try {
      const data = await redeem(code.trim().toUpperCase());
      setResult(data);
      toast.success('Coupon redeemed.');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Could not redeem this coupon.'
      );
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/coupons"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Redeem Coupon</h1>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
            <Ticket className="h-7 w-7 text-orange-600" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Coupon code"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-center font-mono text-sm uppercase tracking-wider"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Redeem coupon
            </button>
          </form>

          {result && (
            <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">
                {result.message || 'Coupon redeemed successfully.'}
              </p>
              {result.coupon && (
                <p className="mt-1 text-xs text-emerald-700">
                  {result.coupon.code} · {CURRENCY}
                  {Number(result.coupon.discountValue ?? 0).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
