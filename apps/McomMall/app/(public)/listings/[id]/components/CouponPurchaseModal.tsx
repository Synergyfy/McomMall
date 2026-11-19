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
import { CURRENCY, stripHtmlText } from '@/lib/utils';
import { InProgressDialog } from '@/components/InProgressDialog';
import { Coupon } from '@/service/my-coupons/types';
import { getPaymentErrorInfo, showPaymentError } from '@/lib/payment-errors';
import {
  buildPayPalReturnUrls,
  storePendingPayPalPurchase,
} from '@/lib/paypal-return';

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
  const [paymentMethod, setPaymentMethod] = useState<
    'stripe' | 'paypal' | 'mcom_wallet'
  >('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePurchase = useInitiateCouponPurchase();
  const verifyPurchase = useVerifyCouponPurchase();
  const fixedAmounts = product.fixedAmounts ?? [];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value === '' ? '' : Number(value));
  };

  const handleInitiatePayment = () => {
    if (!amount) {
      toast.error('Please choose an amount.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    const { returnUrl, cancelUrl } = buildPayPalReturnUrls();
    initiatePurchase.mutate(
      {
        couponProductId: product.id,
        amount: Number(amount),
        paymentMethod,
        returnUrl,
        cancelUrl,
      },
      {
        onSuccess: (data) => {
          if (paymentMethod === 'mcom_wallet' && data.data.transactionId) {
            verifyPurchase.mutate(
              {
                purchaseDetails: {
                  couponProductId: product.id,
                  amount: Number(amount),
                },
                paymentProvider: 'mcom_wallet',
                transactionId: data.data.transactionId,
              },
              {
                onSuccess: (verified) => {
                  onPurchaseSuccess(verified.data);
                },
                onError: (err) => {
                  setError(getPaymentErrorInfo(err).message);
                  showPaymentError(err);
                },
                onSettled: () => {
                  setIsProcessing(false);
                },
              }
            );
            return;
          }
          if (paymentMethod === 'stripe' && data.data.clientSecret) {
            setClientSecret(data.data.clientSecret);
          } else if (paymentMethod === 'paypal' && data.data.orderId) {
            setPaypalOrderId(data.data.orderId);
            setPaypalApprovalUrl(data.data.approvalUrl ?? null);
            storePendingPayPalPurchase('coupon', {
              couponProductId: product.id,
              amount: Number(amount),
            });
          }
        },
        onError: (err) => {
          setError(getPaymentErrorInfo(err).message);
          showPaymentError(err);
        },
        onSettled: () => {
          setIsProcessing(false);
        },
      }
    );
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setError(null);
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
        onError: (err) => {
          setError(getPaymentErrorInfo(err).message);
          showPaymentError(err);
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
            <DialogDescription>{stripHtmlText(product.description)}</DialogDescription>
          </DialogHeader>
          {!clientSecret && !paypalOrderId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount ({CURRENCY})</Label>
                {fixedAmounts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {fixedAmounts.map((fixedAmount) => (
                      <Button
                        key={fixedAmount}
                        type="button"
                        variant={amount === fixedAmount ? 'default' : 'outline'}
                        onClick={() => setAmount(fixedAmount)}
                      >
                        {CURRENCY}
                        {fixedAmount}
                      </Button>
                    ))}
                  </div>
                )}
                {product.allowCustomAmount && (
                  <div>
                    <Label htmlFor="amount" className="text-xs text-gray-500">
                      Or enter a custom amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder={`Between ${CURRENCY}${product.minCustomAmount ?? 0} and ${CURRENCY}${product.maxCustomAmount ?? 'any'}`}
                      min={product.minCustomAmount ?? undefined}
                      max={product.maxCustomAmount ?? undefined}
                    />
                  </div>
                )}
                {fixedAmounts.length === 0 && !product.allowCustomAmount && (
                  <p className="text-sm text-rose-600">
                    This coupon is not currently purchasable online.
                  </p>
                )}
              </div>
              <div>
                <Label>Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: 'stripe' | 'paypal' | 'mcom_wallet') => {
                    setPaymentMethod(value);
                    setClientSecret(null);
                    setPaypalOrderId(null);
                    setError(null);
                  }}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe">Card</Label>
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
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button
                onClick={handleInitiatePayment}
                disabled={isProcessing || !amount}
              >
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
              approvalUrl={paypalApprovalUrl}
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
