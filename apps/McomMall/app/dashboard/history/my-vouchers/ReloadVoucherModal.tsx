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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Voucher } from '@/service/vouchers/types';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  useInitiateVoucherReload,
  useVerifyVoucherReload,
} from '@/service/hooks/useVoucherService';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { InProgressDialog } from '@/components/InProgressDialog';

interface ReloadVoucherModalProps {
  voucher: Voucher;
  children: React.ReactNode;
}

interface ReloadVoucherFormData {
  amount: number;
  paymentProvider: 'stripe' | 'paypal' | 'mcom_wallet';
}

export const ReloadVoucherModal: React.FC<ReloadVoucherModalProps> = ({
  voucher,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(
    null,
  );
  const [reloadAmount, setReloadAmount] = useState<number>(0);
  const [paymentProvider, setPaymentProvider] = useState<
    'stripe' | 'paypal' | 'mcom_wallet' | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReloadVoucherFormData>();

  const initiateReload = useInitiateVoucherReload(voucher.code);
  const verifyReload = useVerifyVoucherReload(voucher.code);

  const onSubmit = async (data: ReloadVoucherFormData) => {
    try {
      const numericAmount = Number(data.amount);
      if (isNaN(numericAmount) || numericAmount < 1) {
        toast.error('Please enter a valid amount.');
        return;
      }

      const payload = { ...data, amount: numericAmount };
      const initiationResponse = await initiateReload.mutateAsync(payload);
      setReloadAmount(numericAmount);
      setPaymentProvider(data.paymentProvider);
      if (initiationResponse.provider === 'mcom_wallet' && initiationResponse.transactionId) {
        setReloadAmount(numericAmount);
        setPaymentProvider('mcom_wallet');
        await verifyReload.mutateAsync({
          paymentProvider: 'mcom_wallet',
          transactionId: initiationResponse.transactionId,
          reloadDetails: { amount: numericAmount },
        });
        toast.success('Voucher reloaded successfully!');
        setIsOpen(false);
        reset();
        return;
      }
      if (initiationResponse.provider === 'stripe') {
        setClientSecret(initiationResponse.clientSecret);
      } else {
        setOrderId(initiationResponse.orderId);
        setPaypalApprovalUrl((initiationResponse as any).approvalUrl ?? null);
      }
    } catch (error) {
      toast.error('Failed to initiate reload.');
    }
  };

  const onPaymentSuccess = async (transactionId: string) => {
    if (!paymentProvider) return;
    setIsVerifying(true);
    try {
      await verifyReload.mutateAsync({
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
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
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
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe">Stripe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mcom_wallet" id="mcom_wallet" />
                      <Label htmlFor="mcom_wallet">MCOM Wallet</Label>
                    </div>
                  </RadioGroup>
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
          <StripeCheckoutForm clientSecret={clientSecret} onPaymentSuccess={onPaymentSuccess} />
        ) : orderId ? (
          <PayPalCheckoutButton
            orderID={orderId}
            approvalUrl={paypalApprovalUrl}
            onPaymentSuccess={onPaymentSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
      <InProgressDialog
        isOpen={isVerifying}
        message="Verifying payment, please do not close this page."
      />
    </>
  );
};