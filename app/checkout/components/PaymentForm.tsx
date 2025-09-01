'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '@/service/api';
import PayPalButtonWrapper from '@/components/PayPalButtonWrapper';
import { toast } from 'sonner';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  totalPrice: number;
}

function StripeForm({ totalPrice }: { totalPrice: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const { data } = await api.post('/payment/create-payment-intent', {
          amount: totalPrice * 100, // amount in cents
          currency: 'gbp',
        });
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent', error);
        toast.error('Could not initialize payment. Please try again.');
      }
    };
    createPaymentIntent();
  }, [totalPrice]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (cardElement == null) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      toast.error(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!');
      // TODO: Redirect to a success page or show a success message
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <Button
        type="submit"
        disabled={!stripe || !clientSecret}
        className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white"
      >
        Pay Now
      </Button>
    </form>
  );
}

export default function PaymentForm({ totalPrice }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handlePaymentSuccess = () => {
    toast.success('Payment successful!');
    // TODO: Redirect to a success page or show a success message
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>
      <Tabs
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stripe">Card</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
        </TabsList>
        <TabsContent value="stripe">
          <div className="mt-4">
            <Elements stripe={stripePromise}>
              <StripeForm totalPrice={totalPrice} />
            </Elements>
          </div>
        </TabsContent>
        <TabsContent value="paypal">
          <div className="mt-4">
            <PayPalButtonWrapper
              paypalAmount={String(totalPrice)}
              handleSuccess={handlePaymentSuccess}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
