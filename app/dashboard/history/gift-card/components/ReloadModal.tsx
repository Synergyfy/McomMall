"use client";

import { useState } from 'react';
import { MyPurchase } from '@/service/gift-card/types';
import { useInitiateReload, useVerifyReload } from '@/service/gift-card/hook';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface ReloadModalProps {
  purchase: MyPurchase;
  onClose: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const ReloadForm = ({ purchase, onClose }: ReloadModalProps) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paypal'>('stripe');
  const initiateReloadMutation = useInitiateReload();
  const verifyReloadMutation = useVerifyReload();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 1) {
      toast.error('Please enter a valid amount.');
      return;
    }

    initiateReloadMutation.mutate(
      { code: purchase.code, reloadData: { amount, paymentProvider } },
      {
        onSuccess: async (data) => {
          if (data.provider === 'stripe' && data.clientSecret && stripe && elements) {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) return;
            const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
              payment_method: { card: cardElement },
            });

            if (error) {
              toast.error(error.message || 'Payment failed.');
            } else if (paymentIntent) {
              verifyReloadMutation.mutate({
                code: purchase.code,
                verificationData: {
                  paymentProvider: 'stripe',
                  transactionId: paymentIntent.id,
                  reloadDetails: { amount },
                },
              }, {
                onSuccess: () => {
                  toast.success('Gift card reloaded successfully!');
                  onClose();
                },
                onError: (err) => toast.error(err.message || 'Failed to verify reload.'),
              });
            }
          } else if (data.provider === 'paypal') {
            // PayPal logic would go here
            toast.info('PayPal integration is not yet complete.');
          }
        },
        onError: (err) => toast.error(err.message || 'Failed to initiate reload.'),
      }
    );
  };

  return (
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
            onClick={() => setPaymentProvider('stripe')}
          >
            Stripe
          </Button>
          <Button
            type="button"
            variant={paymentProvider === 'paypal' ? 'default' : 'outline'}
            onClick={() => setPaymentProvider('paypal')}
            disabled
          >
            PayPal (Coming Soon)
          </Button>
        </div>
      </div>
      {paymentProvider === 'stripe' && (
        <div>
          <Label>Card Details</Label>
          <div className="p-2 border rounded-md">
            <CardElement />
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={initiateReloadMutation.isPending || verifyReloadMutation.isPending}>
          {initiateReloadMutation.isPending || verifyReloadMutation.isPending ? 'Processing...' : `Reload £${amount || '0.00'}`}
        </Button>
      </div>
    </form>
  );
};

const ReloadModal = ({ purchase, onClose }: ReloadModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reload Gift Card</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <Elements stripe={stripePromise}>
          <ReloadForm purchase={purchase} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
};

export default ReloadModal;