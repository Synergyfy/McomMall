'use client';

import React, { useState } from 'react';
import { Coupon } from '@/service/my-coupons/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useInitiateCouponReload, useVerifyCouponReload } from '@/service/my-coupons/hook';
import { toast } from 'sonner';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const formSchema = z.object({
  amount: z.coerce.number().min(1, {
    message: 'Amount must be at least 1.',
  }),
  paymentMethod: z.enum(['stripe', 'paypal']),
});

interface ReloadCouponModalProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReloadCouponModal: React.FC<ReloadCouponModalProps> = ({
  coupon,
  isOpen,
  onClose,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const form = useForm<{ amount: number; paymentMethod: 'stripe' | 'paypal' }>({
    resolver: zodResolver(formSchema),
  });

  const initiateReload = useInitiateCouponReload(coupon?.code || '');
  const verifyReload = useVerifyCouponReload(coupon?.code || '');

  const onSubmit = (values: { amount: number; paymentMethod: 'stripe' | 'paypal' }) => {
    initiateReload.mutate(values, {
      onSuccess: (response) => {
        if (values.paymentMethod === 'stripe') {
          setClientSecret(response.data.clientSecret);
        } else {
          setOrderId(response.data.orderId);
        }
      },
      onError: () => {
        toast.error('Failed to initiate reload.');
      },
    });
  };

  const handlePaymentSuccess = (transactionId: string) => {
    verifyReload.mutate(
      {
        transactionId,
        amount: form.getValues('amount'),
        paymentProvider: form.getValues('paymentMethod'),
      },
      {
        onSuccess: () => {
          toast.success('Coupon reloaded successfully!');
          onClose();
        },
        onError: () => {
          toast.error('Failed to verify reload.');
        },
      }
    );
  };

  if (!coupon) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reload Coupon</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {!clientSecret && !orderId && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <select {...field}>
                          <option value="stripe">Stripe</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Proceed to Payment</Button>
              </form>
            </Form>
          )}
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCheckoutForm
                onPaymentSuccess={handlePaymentSuccess}
                clientSecret={clientSecret}
              />
            </Elements>
          )}
          {orderId && (
            <PayPalCheckoutButton
              orderID={orderId}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
