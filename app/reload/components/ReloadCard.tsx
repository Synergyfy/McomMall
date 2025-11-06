'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';
import { useGetMyPurchaseById } from '@/service/gift-card/hook';
import { useGetMyVoucherById } from '@/service/hooks/useVoucherService';
import { useGetCoupon } from '@/service/coupons/hook';
import { useInitiateFund } from '@/service/wallet/hooks/useInitiateFund';
import { useVerifyFund } from '@/service/wallet/hooks/useVerifyFund';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

interface ReloadCardProps {
  type: 'giftcard' | 'voucher' | 'coupon';
  cardId: string;
}

const ReloadCard: React.FC<ReloadCardProps> = ({ type, cardId }) => {
  const [amount, setAmount] = useState(0);
  const [provider, setProvider] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const initiateFund = useInitiateFund();
  const verifyFund = useVerifyFund();

  const { data: giftCard, isLoading: isLoadingGiftCard } = useGetMyPurchaseById(
    cardId,
    type === 'giftcard'
  );
  const { myVoucher, isLoading: isLoadingVoucher } = useGetMyVoucherById(
    cardId,
    type === 'voucher'
  );
  const { coupon, isLoading: isLoadingCoupon } = useGetCoupon(
    cardId,
    type === 'coupon'
  );

  const currentCard =
    type === 'giftcard' && giftCard
      ? {
          title: 'Gift Card',
          balance: giftCard.currentBalance,
          image: giftCard.template.backgroundImageUrl ?? '',
        }
      : type === 'voucher' && myVoucher
      ? {
          title: 'Voucher',
          balance: parseFloat(myVoucher.balance),
          image: myVoucher.voucherProduct?.backgroundImage ?? '',
        }
      : type === 'coupon' && coupon
      ? {
          title: 'Coupon',
          balance: parseFloat(coupon.couponAmount),
          image: coupon.widgetBackgroundUrl ?? '',
        }
      : null;

  const isLoading = isLoadingGiftCard || isLoadingVoucher || isLoadingCoupon;

  const handleInitiateFund = async () => {
    if (amount < 10) {
      toast.error('Minimum reload amount is 10 GBP');
      return;
    }
    initiateFund.mutate(
      { amount, paymentProvider: provider },
      {
        onSuccess: (data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
          if (data.orderId) {
            setOrderId(data.orderId);
          }
        },
        onError: (error) => {
          toast.error(`Error initiating reload: ${error.message}`);
        },
      }
    );
  };

  const handleVerifyFund = async (transactionId: string) => {
    setIsProcessing(true);
    verifyFund.mutate(
      { transactionId, amount, paymentProvider: provider },
      {
        onSuccess: () => {
          toast.success('Reload successful');
          setIsProcessing(false);
          // TODO: Invalidate queries to refetch card balance
        },
        onError: (error) => {
          toast.error(`Error verifying reload: ${error.message}`);
          setIsProcessing(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">Card not found</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10">
            <Loader className="animate-spin text-orange-600" size={48} />
            <p className="mt-4 text-lg font-semibold text-gray-700">
              Processing payment... Please do not close this page.
            </p>
          </div>
        )}
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Reload Your {currentCard.title}
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            You are reloading this {type}. Please enter the amount you would
            like to add and complete the payment below.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <img
            src={currentCard.image}
            alt={currentCard.title}
            className="w-64 h-auto"
          />
          <h3 className="text-2xl font-bold">{currentCard.title}</h3>
          <p className="text-xl">Balance: ₦{currentCard.balance}</p>
        </div>
        {!clientSecret && !orderId && (
          <>
            <div className="flex flex-col gap-3">
              <Label htmlFor="amount">Amount (GBP)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="provider">Payment Provider</Label>
              <Select
                onValueChange={(value: 'stripe' | 'paypal') =>
                  setProvider(value)
                }
                defaultValue={provider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a payment provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInitiateFund}
              disabled={initiateFund.isPending}
              className="w-full"
            >
              {initiateFund.isPending ? 'Processing...' : 'Continue'}
            </Button>
          </>
        )}

        {provider === 'stripe' && clientSecret && (
          <StripeCheckoutForm
            clientSecret={clientSecret}
            onPaymentSuccess={handleVerifyFund}
          />
        )}

        {provider === 'paypal' && orderId && (
          <PayPalCheckoutButton
            orderID={orderId}
            onPaymentSuccess={handleVerifyFund}
          />
        )}
      </div>
    </div>
  );
};

export default ReloadCard;
