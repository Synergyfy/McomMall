'use client';

import { useState } from 'react';
import { Voucher, VoucherProduct } from '@/service/vouchers/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  useInitiateVoucherPurchase,
  useVerifyVoucherPurchase,
} from '@/service/hooks/useVoucherService';
import { CURRENCY } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { InitiateVoucherPurchaseDto } from '@/service/vouchers/types';
import PayPalButtonWrapper from '@/components/PayPalButtonWrapper';
import { getPaymentErrorInfo, showPaymentError } from '@/lib/payment-errors';
import {
  buildPayPalReturnUrls,
  storePendingPayPalPurchase,
} from '@/lib/paypal-return';

interface VoucherPurchaseModalProps {
  product: VoucherProduct;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (voucher: Voucher) => void;
}

const stripePromise = loadStripe(
  (process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY || '')
);

const StripePaymentForm = ({
  onSuccess,
}: {
  onSuccess: (paymentIntentId: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setIsLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      // Handle other statuses if necessary
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="mt-4 w-full"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
};

export default function VoucherPurchaseModal({
  product,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: VoucherPurchaseModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmountInput, setCustomAmountInput] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<
    'stripe' | 'paypal' | 'mcom_wallet'
  >('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseDetails, setPurchaseDetails] =
    useState<InitiateVoucherPurchaseDto | null>(null);
  const hasAmountOptions =
    (product.fixedAmounts?.length ?? 0) > 0 || product.allowCustomAmount;

  const initiatePurchase = useInitiateVoucherPurchase();
  const verifyPurchase = useVerifyVoucherPurchase();

  const handleFixedAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmountInput('');
  };

  const handleCustomAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setCustomAmountInput(value);
    const numericValue = parseFloat(value);
    setSelectedAmount(isNaN(numericValue) ? null : numericValue);
  };

  const handleInitiatePurchase = async () => {
    if (!selectedAmount) {
      toast.error('Please select or enter a voucher amount.');
      return;
    }

    if (
      customAmountInput &&
      product.allowCustomAmount &&
      (selectedAmount < (product.minCustomAmount ?? 0) ||
        selectedAmount > (product.maxCustomAmount ?? Infinity))
    ) {
      toast.error(
        `Amount must be between ${CURRENCY}${product.minCustomAmount} and ${CURRENCY}${product.maxCustomAmount}`
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    const { returnUrl, cancelUrl } = buildPayPalReturnUrls();
    const details: InitiateVoucherPurchaseDto = {
      voucherProductId: product.id,
      amount: Number(selectedAmount),
      paymentProvider,
      returnUrl,
      cancelUrl,
      ...(recipientName.trim() ? { recipientName: recipientName.trim() } : {}),
      ...(recipientEmail.trim()
        ? { recipientEmail: recipientEmail.trim() }
        : {}),
      ...(personalMessage.trim()
        ? { personalMessage: personalMessage.trim() }
        : {}),
    };
    setPurchaseDetails(details);

    try {
      const response = await initiatePurchase.mutateAsync(details);
      if (response.provider === 'mcom_wallet' && response.transactionId) {
        const verifiedVoucher = await verifyPurchase.mutateAsync({
          paymentProvider: 'mcom_wallet',
          transactionId: response.transactionId,
          purchaseDetails: details,
        });
        onPurchaseSuccess(verifiedVoucher);
        resetForm();
      } else if (response.provider === 'stripe') {
        setClientSecret(response.clientSecret);
      } else {
        setPaypalOrderId(response.orderId);
        setPaypalApprovalUrl((response as any).approvalUrl ?? null);
        storePendingPayPalPurchase(
          'voucher',
          details as unknown as Record<string, unknown>,
        );
      }
    } catch (err) {
      setError(getPaymentErrorInfo(err).message);
      showPaymentError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyStripePayment = async (transactionId: string) => {
    if (!purchaseDetails) {
      toast.error('Purchase details are missing.');
      return;
    }
    setIsLoading(true);
    try {
      const verifiedVoucher = await verifyPurchase.mutateAsync({
        paymentProvider: 'stripe',
        transactionId,
        purchaseDetails,
      });
      onPurchaseSuccess(verifiedVoucher);
      resetForm();
    } catch (err) {
      setError(getPaymentErrorInfo(err).message);
      showPaymentError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalApprove = async (orderId: string) => {
    if (!purchaseDetails) {
      toast.error('Purchase details are missing.');
      return;
    }
    setIsLoading(true);
    try {
      const verifiedVoucher = await verifyPurchase.mutateAsync({
        paymentProvider: 'paypal',
        transactionId: orderId,
        purchaseDetails,
      });
      onPurchaseSuccess(verifiedVoucher);
      resetForm();
    } catch (err) {
      setError(getPaymentErrorInfo(err).message);
      showPaymentError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmountInput('');
    setRecipientName('');
    setRecipientEmail('');
    setPersonalMessage('');
    setPaymentProvider('stripe');
    setClientSecret(null);
    setPaypalOrderId(null);
    setPaypalApprovalUrl(null);
    setError(null);
    setPurchaseDetails(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Buy Voucher: {product.name}</DialogTitle>
        </DialogHeader>
        {!clientSecret && !paypalOrderId ? (
          <div className="grid gap-4 py-4">
            {/* Form fields */}
            {product.bonusThreshold && product.bonusAmount && (
                <div className="rounded-lg bg-green-50 p-4 text-green-700">
                    <p className="font-bold">Bonus Offer!</p>
                    <p>Buy a voucher for {CURRENCY}{product.bonusThreshold} or more and get an extra {CURRENCY}{product.bonusAmount} on us!</p>
                </div>
            )}
            <div className="space-y-2">
              <Label>Select Amount</Label>
              {!hasAmountOptions && (
                <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
                  This voucher does not have an online purchase amount yet.
                  Ask the business to add fixed amounts or a custom amount.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {product.fixedAmounts?.map(amount => (
                  <Button
                    key={amount}
                    type="button"
                    variant={
                      selectedAmount === amount && !customAmountInput
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => handleFixedAmountClick(amount)}
                  >
                    {CURRENCY}
                    {amount}
                  </Button>
                ))}
              </div>
              {product.allowCustomAmount && (
                <div className="pt-2">
                  <Label htmlFor="custom-amount">Or enter a custom amount</Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    value={customAmountInput}
                    onChange={handleCustomAmountChange}
                    placeholder={`Between ${CURRENCY}${product.minCustomAmount ?? 0} and ${CURRENCY}${product.maxCustomAmount ?? 'any'}`}
                    min={product.minCustomAmount ?? undefined}
                    max={product.maxCustomAmount ?? undefined}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalMessage">
                Personal Message (Optional)
              </Label>
              <Input
                id="personalMessage"
                value={personalMessage}
                onChange={e => setPersonalMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                defaultValue="stripe"
                value={paymentProvider}
                onValueChange={value => {
                  setPaymentProvider(
                    value as 'stripe' | 'paypal' | 'mcom_wallet'
                  );
                  setError(null);
                }}
                className="flex gap-4"
              >
                <Label
                  htmlFor="stripe"
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-2"
                >
                  <RadioGroupItem value="stripe" id="stripe" />
                  Card
                </Label>
                <Label
                  htmlFor="paypal"
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-2"
                >
                  <RadioGroupItem value="paypal" id="paypal" />
                  PayPal
                </Label>
                <Label
                  htmlFor="mcom_wallet"
                  className="flex cursor-pointer items-center gap-2 rounded-md border p-2"
                >
                  <RadioGroupItem value="mcom_wallet" id="mcom_wallet" />
                  MCOM Wallet
                </Label>
              </RadioGroup>
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm onSuccess={handleVerifyStripePayment} />
          </Elements>
        ) : (
          paypalOrderId && (
            <div className="flex w-full items-center justify-center py-4">
              <PayPalButtonWrapper
                orderId={paypalOrderId}
                approvalUrl={paypalApprovalUrl}
                onApprove={handlePayPalApprove}
              />
            </div>
          )
        )}

        <DialogFooter>
          {!clientSecret && !paypalOrderId && (
            <>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleInitiatePurchase}
                disabled={!selectedAmount || isLoading || !hasAmountOptions}
              >
                {isLoading ? 'Loading...' : 'Proceed to Payment'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}