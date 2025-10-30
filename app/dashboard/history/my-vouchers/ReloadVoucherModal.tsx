'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Voucher } from '@/service/vouchers/types';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  useInitiateVoucherReload,
  useVerifyVoucherReload,
} from '@/service/hooks/useVoucherService';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';

interface ReloadVoucherModalProps {
  voucher: Voucher;
  children: React.ReactNode;
}

interface ReloadVoucherFormData {
  amount: number;
  paymentProvider: 'stripe' | 'paypal';
}

export const ReloadVoucherModal: React.FC<ReloadVoucherModalProps> = ({
  voucher,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [reloadAmount, setReloadAmount] = useState<number>(0);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paypal' | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReloadVoucherFormData>();

  const initiateReload = useInitiateVoucherReload();
  const verifyReload = useVerifyVoucherReload();

  const onSubmit = async (data: ReloadVoucherFormData) => {
    try {
      const initiationResponse = await initiateReload(voucher.code, data);
      setReloadAmount(data.amount);
      setPaymentProvider(data.paymentProvider);
      if (initiationResponse.provider === 'stripe') {
        setClientSecret(initiationResponse.clientSecret);
      } else {
        setOrderId(initiationResponse.orderId);
      }
    } catch (error) {
      toast.error('Failed to initiate reload.');
    }
  };

  const onPaymentSuccess = async (transactionId: string) => {
    if (!paymentProvider) return;
    try {
      await verifyReload(voucher.code, {
        paymentProvider,
        transactionId,
        reloadDetails: {
          amount: reloadAmount,
        },
      });
      toast.success('Voucher reloaded successfully!');
      setIsOpen(false);
      reset();
      setClientSecret(null);
      setOrderId(null);
    } catch (error) {
      toast.error('Failed to verify reload.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reload Voucher</DialogTitle>
        </DialogHeader>
        {!clientSecret && !orderId ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Controller
                name="amount"
                control={control}
                rules={{ required: 'Amount is required', min: { value: 1, message: 'Amount must be at least 1' } }}
                render={({ field }) => (
                  <Input {...field} type="number" id="amount" />
                )}
              />
              {errors.amount && (
                <p className="text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="paymentProvider">Payment Provider</Label>
              <Controller
                name="paymentProvider"
                control={control}
                rules={{ required: 'Payment provider is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.paymentProvider && (
                <p className="text-red-500">
                  {errors.paymentProvider.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </form>
        ) : clientSecret ? (
          <StripeCheckoutForm clientSecret={clientSecret} onSuccess={onPaymentSuccess} />
        ) : orderId ? (
          <PayPalCheckoutButton orderId={orderId} onSuccess={onPaymentSuccess} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};