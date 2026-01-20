'use client';

import React, { useState } from 'react';
import { CouponProduct } from '@/service/coupon-products/types';
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
import { useInitiateCouponPurchase, useVerifyCouponPurchase } from '@/service/my-coupons/hook';
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

interface PurchaseCouponModalProps {
  couponProduct: CouponProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseCouponModal: React.FC<PurchaseCouponModalProps> = ({
  couponProduct,
  isOpen,
  onClose,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const form = useForm<{ amount: number; paymentMethod: 'stripe' | 'paypal' }>({
    resolver: zodResolver(formSchema),
  });

  const initiatePurchase = useInitiateCouponPurchase();
  const verifyPurchase = useVerifyCouponPurchase();

  const onSubmit = (values: { amount: number; paymentMethod: 'stripe' | 'paypal' }) => {
    if (!couponProduct) return;

    initiatePurchase.mutate(
      { ...values, couponProductId: couponProduct.id },
      {
        onSuccess: (response) => {
          if (values.paymentMethod === 'stripe') {
            setClientSecret(response.data.clientSecret);
          } else {
            setOrderId(response.data.orderId);
          }
        },
        onError: () => {
          toast.error('Failed to initiate purchase.');
        },
      }
    );
  };

  const handlePaymentSuccess = (transactionId: string) => {
    if (!couponProduct) return;

    verifyPurchase.mutate(
      {
        transactionId,
        paymentProvider: form.getValues('paymentMethod'),
        purchaseDetails: {
          couponProductId: couponProduct.id,
          amount: form.getValues('amount'),
        },
      },
      {
        onSuccess: () => {
          toast.success('Coupon purchased successfully!');
          onClose();
        },
        onError: () => {
          toast.error('Failed to verify purchase.');
        },
      }
    );
  };

  if (!couponProduct) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Purchase Coupon</DialogTitle>
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
                clientSecret={clientSecret}
                onPaymentSuccess={handlePaymentSuccess}
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
