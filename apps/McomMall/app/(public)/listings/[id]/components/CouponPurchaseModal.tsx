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
import {
  useInitiateCouponPurchase,
  useVerifyCouponPurchase,
} from '@/service/coupon-products/hooks';
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
import { usePaymentFlow } from '@mcommall/payments';

interface CouponPurchaseModalProps {
  product: CouponProduct;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (coupon: Coupon) => void;
}

type CouponRail = 'stripe' | 'paypal' | 'mcom_wallet';

interface CouponDetails {
  couponProductId: string;
  amount: number;
}

interface CouponInitiation {
  response: {
    data: {
      clientSecret?: string;
      orderId?: string;
      approvalUrl?: string | null;
      transactionId?: string;
      provider?: string;
    };
  };
  details: CouponDetails;
}

export default function CouponPurchaseModal({
  product,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: CouponPurchaseModalProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<CouponRail>('stripe');
  const [error, setError] = useState<string | null>(null);

  const initiatePurchase = useInitiateCouponPurchase();
  const verifyPurchase = useVerifyCouponPurchase();
  const fixedAmounts = product.fixedAmounts ?? [];

  const flow = usePaymentFlow<CouponInitiation, Coupon>({
    initiate: async () => {
      const details: CouponDetails = {
        couponProductId: product.id,
        amount: Number(amount),
      };
      const { returnUrl, cancelUrl } = buildPayPalReturnUrls();
      const response = await initiatePurchase.mutateAsync({
        ...details,
        paymentMethod,
        returnUrl,
        cancelUrl,
      });
      return { response, details };
    },
    confirm: async (transactionId, handle) => {
      const verified = await verifyPurchase.mutateAsync({
        purchaseDetails: handle.details,
        paymentProvider: paymentMethod,
        transactionId,
      });
      return verified.data;
    },
    onSuccess: (coupon) => onPurchaseSuccess(coupon),
    onError: (err) => {
      setError(getPaymentErrorInfo(err).message);
      showPaymentError(err);
    },
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value === '' ? '' : Number(value));
  };

  const handleInitiatePayment = async () => {
    if (!amount) {
      toast.error('Please choose an amount.');
      return;
    }

    setError(null);
    const initiated = await flow.start();
    if (!initiated) return;

    const data = initiated.response.data;
    if (paymentMethod === 'mcom_wallet' && data.transactionId) {
      await flow.confirm(data.transactionId);
    } else if (paymentMethod === 'paypal' && data.orderId) {
      storePendingPayPalPurchase('coupon', {
        couponProductId: product.id,
        amount: Number(amount),
      });
    }
  };

  const clientSecret =
    paymentMethod === 'stripe' ? flow.handle?.response?.data?.clientSecret : null;
  const paypalOrderId =
    paymentMethod === 'paypal' ? flow.handle?.response?.data?.orderId : null;
  const paypalApprovalUrl =
    flow.handle?.response?.data?.approvalUrl ?? null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase {product.name}</DialogTitle>
            <DialogDescription>
              {stripHtmlText(product.description)}
            </DialogDescription>
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
                  onValueChange={(value: CouponRail) => {
                    setPaymentMethod(value);
                    flow.reset();
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
                disabled={flow.isBusy || !amount}
              >
                {flow.isBusy ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          )}

          {clientSecret && paymentMethod === 'stripe' && (
            <StripeCheckoutForm
              clientSecret={clientSecret}
              onPaymentSuccess={(transactionId) =>
                flow.confirm(transactionId)
              }
            />
          )}

          {paypalOrderId && paymentMethod === 'paypal' && (
            <PayPalCheckoutButton
              orderID={paypalOrderId}
              approvalUrl={paypalApprovalUrl}
              onPaymentSuccess={(transactionId) =>
                flow.confirm(transactionId)
              }
            />
          )}
        </DialogContent>
      </Dialog>
      <InProgressDialog
        isOpen={flow.isBusy && (!!clientSecret || !!paypalOrderId)}
        message="Processing payment... Please do not close this page."
      />
    </>
  );
}
