'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useRedeemVoucherManual } from '@/service/hooks/useVoucherService';
import { RedeemVoucherDto } from '@/service/vouchers/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Voucher } from '@/service/vouchers/types';
import { CURRENCY } from '@/lib/utils';

const VoucherDetailsCard = ({ voucher }: { voucher: Voucher }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm"
  >
    <h3 className="mb-4 text-lg font-semibold text-green-800">
      Voucher Redeemed Successfully
    </h3>
    <div className="space-y-2">
      <p>
        <strong>Code:</strong> {voucher.code}
      </p>
      <p>
        <strong>Initial Value:</strong> {CURRENCY}
        {voucher.initialValue.toFixed(2)}
      </p>
      <p>
        <strong>New Balance:</strong> {CURRENCY}
        {voucher.balance.toFixed(2)}
      </p>
      <p>
        <strong>Status:</strong> {voucher.status.replace('_', ' ')}
      </p>
    </div>
  </motion.div>
);

export default function RedeemVoucherPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RedeemVoucherDto>();
  const redeemVoucher = useRedeemVoucherManual();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redeemedVoucher, setRedeemedVoucher] = useState<Voucher | null>(null);

  const onSubmit = async (data: RedeemVoucherDto) => {
    setIsSubmitting(true);
    setRedeemedVoucher(null);
    try {
      const result = await redeemVoucher(data);
      toast.success('Voucher redeemed successfully!');
      setRedeemedVoucher(result);
      reset();
    } catch (error) {
      let errorMessage = 'Failed to redeem voucher.';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } })
          .response?.data?.message === 'string'
      ) {
        errorMessage = (
          error as { response: { data: { message: string } } }
        ).response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            Redeem a Voucher
          </h1>
          <p className="mt-2 text-slate-500">
            Enter the customer&apos;s voucher code below to mark it as redeemed.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="code" className="text-lg">
                Voucher Code
              </Label>
              <Input
                id="code"
                {...register('code', { required: 'Voucher code is required' })}
                className="mt-2 text-lg"
                placeholder="e.g., A1B2-C3D4"
              />
              {errors.code && (
                <p className="mt-1 text-red-500">{errors.code.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-lg"
            >
              {isSubmitting ? 'Redeeming...' : 'Redeem Voucher'}
            </Button>
          </form>
        </motion.div>

        {redeemedVoucher && <VoucherDetailsCard voucher={redeemedVoucher} />}
      </main>
    </div>
  );
}