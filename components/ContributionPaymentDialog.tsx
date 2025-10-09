'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useInitiateContributionPayment,
  useVerifyContributionPayment,
} from '@/service/grouping/hooks';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { toast } from 'sonner';
import { SuccessDialog } from './SuccessDialog';
import { CURRENCY } from '@/lib/utils';

interface ContributionPaymentDialogProps {
  groupId: string;
  onPaymentSuccess: () => void;
}

const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const NEXT_PUBLIC_PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

export function ContributionPaymentDialog({
  groupId,
  onPaymentSuccess,
}: ContributionPaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<
    'stripe' | 'paypal' | null
  >(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const initiatePayment = useInitiateContributionPayment();
  const verifyPayment = useVerifyContributionPayment();

  const handleInitiatePayment = async (provider: 'stripe' | 'paypal') => {
    setPaymentProvider(provider);
    initiatePayment.mutate(
      { groupId, data: { paymentProvider: provider } },
      {
        onSuccess: (data) => {
          if (provider === 'stripe' && data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else if (provider === 'paypal' && data.orderId) {
            setOrderId(data.orderId);
          } else {
            toast.error('Failed to initialize payment.');
          }
        },
        onError: () => {
          toast.error('Failed to initialize payment.');
        },
      },
    );
  };

  const handleVerifyPayment = (transactionId: string) => {
    if (!paymentProvider) return;
    verifyPayment.mutate(
      {
        groupId,
        data: { paymentProvider, transactionId },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setIsSuccessDialogOpen(true);
          onPaymentSuccess();
        },
        onError: () => {
          toast.error('Payment verification failed. Please contact support.');
        },
      },
    );
  };

  const resetState = () => {
    setPaymentProvider(null);
    setClientSecret(null);
    setOrderId(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    setIsOpen(open);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>Pay Contribution</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Contribution</DialogTitle>
            <DialogDescription>
              Finalize your group membership by making your contribution.
            </DialogDescription>
          </DialogHeader>

          {!paymentProvider && (
            <div className="flex flex-col space-y-4">
              <p>
                To complete your membership, please pay the contribution amount.
                Select your preferred payment method below.
              </p>
              <Button
                onClick={() => handleInitiatePayment('stripe')}
                disabled={initiatePayment.isPending}
              >
                Pay with Stripe
              </Button>
              <Button
                onClick={() => handleInitiatePayment('paypal')}
                disabled={initiatePayment.isPending}
              >
                Pay with PayPal
              </Button>
            </div>
          )}

          {paymentProvider && initiatePayment.isPending && (
            <div className="flex justify-center items-center p-8">
              <p>Initializing Payment...</p>
            </div>
          )}

          {paymentProvider === 'stripe' && clientSecret && (
            <EmbeddedCheckoutProvider
              key={clientSecret}
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}

          {paymentProvider === 'paypal' && orderId && (
            <PayPalScriptProvider
              options={{
                clientId: NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                currency: 'GBP',
              }}
            >
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={async () => orderId}
                onApprove={async (data) => {
                  handleVerifyPayment(data.orderID);
                }}
                onError={() => {
                  toast.error(
                    'An error occurred with your PayPal payment. Please try again.',
                  );
                }}
              />
            </PayPalScriptProvider>
          )}

          {!clientSecret && !orderId && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        message="Your contribution has been successfully processed! Welcome to the group."
      />
    </>
  );
}