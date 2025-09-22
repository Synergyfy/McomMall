'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({
  onPaymentSuccess,
}: {
  onPaymentSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('Processing payment... Please do not close this page.');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message);
      setMessage(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setMessage('Payment successful!');
      onPaymentSuccess(paymentIntent.id);
      setIsLoading(false);
    } else {
      setMessage('Payment not successful. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10">
          <Loader className="animate-spin text-orange-600" size={48} />
          <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
        </div>
      )}
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white"
      >
        Pay Now
      </Button>
    </form>
  );
}

export default function StripeCheckoutForm({
  clientSecret,
  onPaymentSuccess,
}: {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}) {
  if (!clientSecret) {
    return <div>Could not initialize payment.</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
}
