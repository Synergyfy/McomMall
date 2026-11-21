'use client';

import { useState } from 'react';
import { MyPurchase } from '@/service/gift-card/types';
import { useInitiateReload, useVerifyReload } from '@/service/gift-card/hook';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { usePaymentFlow } from '@mcommall/payments';

interface ReloadModalProps {
  purchase: MyPurchase;
  onClose: () => void;
}

type ReloadRail = 'stripe' | 'paypal' | 'mcom_wallet';

interface ReloadInitiation {
  clientSecret?: string;
  orderId?: string;
  approvalUrl?: string | null;
  transactionId?: string;
  holdId?: string;
  provider: ReloadRail;
}

const ReloadModal = ({ purchase, onClose }: ReloadModalProps) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentProvider, setPaymentProvider] =
    useState<ReloadRail>('stripe');

  const initiateReloadMutation = useInitiateReload();
  const verifyReloadMutation = useVerifyReload();

  const flow = usePaymentFlow<ReloadInitiation, unknown>({
    initiate: async () => {
      return initiateReloadMutation.mutateAsync({
        code: purchase.code,
        reloadData: { amount: Number(amount), paymentProvider },
      }) as Promise<ReloadInitiation>;
    },
    confirm: async (transactionId) => {
      return verifyReloadMutation.mutateAsync({
        code: purchase.code,
        verificationData: {
          paymentProvider,
          transactionId,
          reloadDetails: { amount: Number(amount) },
        },
      });
    },
    onSuccess: () => {
      toast.success('Gift card reloaded successfully!');
      onClose();
    },
    onError: (err: any) =>
      toast.error(err?.message || 'Failed to complete the reload.'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount.');
      return;
    }

    const initiated = await flow.start();
    if (!initiated) return;

    if (paymentProvider === 'mcom_wallet') {
      if (!initiated.transactionId) {
        toast.error('MCOM Wallet did not return a payment reference.');
        return;
      }
      await flow.confirm(initiated.transactionId);
    } else if (paymentProvider === 'paypal') {
      if (!initiated.orderId) {
        toast.error('PayPal order could not be created.');
      }
    }
  };

  const clientSecret = flow.handle?.clientSecret;
  const orderId = flow.handle?.orderId;
  const approvalUrl = flow.handle?.approvalUrl ?? null;

  if (clientSecret) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Reload Gift Card</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>
          <StripeCheckoutForm
            clientSecret={clientSecret}
            onPaymentSuccess={(transactionId) => flow.confirm(transactionId)}
          />
        </div>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Reload Gift Card</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>
          <PayPalCheckoutButton
            orderID={orderId}
            approvalUrl={approvalUrl}
            onPaymentSuccess={(transactionId) => flow.confirm(transactionId)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reload Gift Card</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Reload Amount (£)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label>Payment Method</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={paymentProvider === 'stripe' ? 'default' : 'outline'}
                onClick={() => {
                  flow.reset();
                  setPaymentProvider('stripe');
                }}
              >
                Stripe
              </Button>
              <Button
                type="button"
                variant={paymentProvider === 'paypal' ? 'default' : 'outline'}
                onClick={() => {
                  flow.reset();
                  setPaymentProvider('paypal');
                }}
              >
                PayPal
              </Button>
              <Button
                type="button"
                variant={
                  paymentProvider === 'mcom_wallet' ? 'default' : 'outline'
                }
                onClick={() => {
                  flow.reset();
                  setPaymentProvider('mcom_wallet');
                }}
              >
                MCOM Wallet
              </Button>
            </div>
          </div>
          {paymentProvider === 'mcom_wallet' && (
            <p className="rounded-md border border-orange-100 bg-orange-50 p-3 text-sm text-orange-800">
              The reload amount will be debited from your MCOM Wallet when you
              continue.
            </p>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={flow.isBusy}>
              {flow.isBusy
                ? 'Processing...'
                : `Reload £${amount || '0.00'}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReloadModal;
