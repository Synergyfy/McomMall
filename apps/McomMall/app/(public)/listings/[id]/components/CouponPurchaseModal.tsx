'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CouponProduct } from '@/service/coupon-products/types';
import { useInitiateCouponPurchase, useVerifyCouponPurchase } from '@/service/coupon-products/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { toast } from 'sonner';
import { CURRENCY } from '@/lib/utils';
import { InProgressDialog } from '@/components/InProgressDialog';
import { Coupon } from '@/service/my-coupons/types';

interface CouponPurchaseModalProps {
  product: CouponProduct;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (coupon: Coupon) => void;
}

export default function CouponPurchaseModal({
  product,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: CouponPurchaseModalProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const initiatePurchase = useInitiateCouponPurchase();
  const verifyPurchase = useVerifyCouponPurchase();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value === '' ? '' : Number(value));
  };

  const handleInitiatePayment = () => {
    if (!amount) {
      toast.error('Please enter an amount.');
      return;
    }

    setIsProcessing(true);
    initiatePurchase.mutate(
      {
        couponProductId: product.id,
        amount: Number(amount),
        paymentMethod,
      },
      {
        onSuccess: (data) => {
          if (paymentMethod === 'stripe' && data.data.clientSecret) {
            setClientSecret(data.data.clientSecret);
          } else if (paymentMethod === 'paypal' && data.data.orderId) {
            setPaypalOrderId(data.data.orderId);
          }
        },
        onError: () => {
          toast.error('Failed to initiate payment. Please try again.');
        },
        onSettled: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setIsProcessing(true);
    verifyPurchase.mutate(
      {
        purchaseDetails: {
          couponProductId: product.id,
          amount: Number(amount),
        },
        paymentProvider: paymentMethod,
        transactionId,
      },
      {
        onSuccess: (data) => {
          onPurchaseSuccess(data.data);
        },
        onError: () => {
          toast.error('Failed to verify payment. Please contact support.');
        },
        onSettled: () => {
          setIsProcessing(false);
          setClientSecret(null);
          setPaypalOrderId(null);
        },
      }
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase {product.name}</DialogTitle>
            <DialogDescription>{product.description}</DialogDescription>
          </DialogHeader>
          {!clientSecret && !paypalOrderId && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ({CURRENCY})</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: 'stripe' | 'paypal') => setPaymentMethod(value)}
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
                </RadioGroup>
              </div>
              <Button onClick={handleInitiatePayment} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          )}

          {clientSecret && paymentMethod === 'stripe' && (
            <StripeCheckoutForm
              clientSecret={clientSecret}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}

          {paypalOrderId && paymentMethod === 'paypal' && (
            <PayPalCheckoutButton
              orderID={paypalOrderId}
              onPaymentSuccess={(transactionId) => handlePaymentSuccess(transactionId)}
            />
          )}
        </DialogContent>
      </Dialog>
      <InProgressDialog
        isOpen={isProcessing && (!!clientSecret || !!paypalOrderId)}
        message="Processing payment... Please do not close this page."
      />
    </>
  );
}
