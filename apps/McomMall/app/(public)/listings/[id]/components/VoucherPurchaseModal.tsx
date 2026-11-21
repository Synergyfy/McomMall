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
import { InitiateVoucherPurchaseDto } from '@/service/vouchers/types';
import PayPalButtonWrapper from '@/components/PayPalButtonWrapper';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { getPaymentErrorInfo, showPaymentError } from '@/lib/payment-errors';
import {
  buildPayPalReturnUrls,
  storePendingPayPalPurchase,
} from '@/lib/paypal-return';
import { usePaymentFlow } from '@mcommall/payments';

interface VoucherPurchaseModalProps {
  product: VoucherProduct;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (voucher: Voucher) => void;
}

type VoucherRail = 'stripe' | 'paypal' | 'mcom_wallet';

interface VoucherInitiation {
  response: {
    clientSecret?: string;
    orderId?: string;
    approvalUrl?: string | null;
    transactionId?: string;
    holdId?: string;
    expiresAt?: string;
    provider: VoucherRail;
  };
  details: InitiateVoucherPurchaseDto;
}

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
  const [paymentProvider, setPaymentProvider] =
    useState<VoucherRail>('stripe');
  const [error, setError] = useState<string | null>(null);
  const hasAmountOptions =
    (product.fixedAmounts?.length ?? 0) > 0 || product.allowCustomAmount;

  const initiatePurchase = useInitiateVoucherPurchase();
  const verifyPurchase = useVerifyVoucherPurchase();

  const resetForm = () => {
    setSelectedAmount(null);
    setCustomAmountInput('');
    setRecipientName('');
    setRecipientEmail('');
    setPersonalMessage('');
    setPaymentProvider('stripe');
    setError(null);
    flow.reset();
    onClose();
  };

  const flow = usePaymentFlow<VoucherInitiation, Voucher>({
    initiate: async () => {
      if (!selectedAmount) {
        throw new Error('Please select or enter a voucher amount.');
      }
      const { returnUrl, cancelUrl } = buildPayPalReturnUrls();
      const details: InitiateVoucherPurchaseDto = {
        voucherProductId: product.id,
        amount: Number(selectedAmount),
        paymentProvider,
        returnUrl,
        cancelUrl,
        ...(recipientName.trim()
          ? { recipientName: recipientName.trim() }
          : {}),
        ...(recipientEmail.trim()
          ? { recipientEmail: recipientEmail.trim() }
          : {}),
        ...(personalMessage.trim()
          ? { personalMessage: personalMessage.trim() }
          : {}),
      };
      const response = await initiatePurchase.mutateAsync(details);
      return { response: response as VoucherInitiation['response'], details };
    },
    confirm: async (transactionId, handle) => {
      return verifyPurchase.mutateAsync({
        paymentProvider: handle.details.paymentProvider,
        transactionId,
        purchaseDetails: handle.details,
      });
    },
    onSuccess: (voucher) => {
      onPurchaseSuccess(voucher);
      resetForm();
    },
    onError: (err) => {
      setError(getPaymentErrorInfo(err).message);
      showPaymentError(err);
    },
  });

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
    const handle = await flow.start();
    if (!handle) return;

    const { response, details } = handle;
    if (response.provider === 'mcom_wallet' && response.transactionId) {
      await flow.confirm(response.transactionId);
    } else if (response.provider === 'paypal') {
      storePendingPayPalPurchase(
        'voucher',
        details as unknown as Record<string, unknown>
      );
    }
  };

  const clientSecret = flow.handle?.response?.clientSecret;
  const paypalOrderId = flow.handle?.response?.orderId;
  const paypalApprovalUrl = flow.handle?.response?.approvalUrl ?? null;
  const isBusy = flow.isBusy;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Buy Voucher: {product.name}</DialogTitle>
        </DialogHeader>
        {!clientSecret && !paypalOrderId ? (
          <div className="grid gap-4 py-4">
            {product.bonusThreshold && product.bonusAmount && (
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                <p className="font-bold">Bonus Offer!</p>
                <p>
                  Buy a voucher for {CURRENCY}
                  {product.bonusThreshold} or more and get an extra {CURRENCY}
                  {product.bonusAmount} on us!
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Select Amount</Label>
              {!hasAmountOptions && (
                <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
                  This voucher does not have an online purchase amount yet. Ask
                  the business to add fixed amounts or a custom amount.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {product.fixedAmounts?.map((amount) => (
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
                  <Label htmlFor="custom-amount">
                    Or enter a custom amount
                  </Label>
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
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalMessage">
                Personal Message (Optional)
              </Label>
              <Input
                id="personalMessage"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                defaultValue="stripe"
                value={paymentProvider}
                onValueChange={(value) => {
                  setPaymentProvider(value as VoucherRail);
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
          <StripeCheckoutForm
            clientSecret={clientSecret}
            onPaymentSuccess={(paymentIntentId) =>
              flow.confirm(paymentIntentId)
            }
          />
        ) : (
          paypalOrderId && (
            <div className="flex w-full items-center justify-center py-4">
              <PayPalButtonWrapper
                orderId={paypalOrderId}
                approvalUrl={paypalApprovalUrl}
                onApprove={(orderId) => flow.confirm(orderId)}
              />
            </div>
          )
        )}

        <DialogFooter>
          {!clientSecret && !paypalOrderId && (
            <>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleInitiatePurchase}
                disabled={!selectedAmount || isBusy || !hasAmountOptions}
              >
                {isBusy ? 'Loading...' : 'Proceed to Payment'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
