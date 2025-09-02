'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadStripe, PaymentIntent } from '@stripe/stripe-js';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('payment_intent_client_secret');
  const [status, setStatus] = useState('loading');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(
    null
  );

  useEffect(() => {
    if (!clientSecret) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        setStatus('error');
        return;
      }
      const { paymentIntent } = await stripe.retrievePaymentIntent(
        clientSecret
      );
      setPaymentIntent(paymentIntent || null);
      setStatus(paymentIntent?.status || 'error');
    };

    verifyPayment();
  }, [clientSecret]);

  if (status === 'loading') {
    return <div>Verifying your payment...</div>;
  }

  if (status === 'succeeded') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg mb-2">Thank you for your purchase.</p>
        {paymentIntent && (
          <p className="text-gray-600">
            Your payment of{' '}
            <strong>
              {(paymentIntent.amount / 100).toLocaleString('en-GB', {
                style: 'currency',
                currency: 'GBP',
              })}
            </strong>{' '}
            has been processed successfully.
          </p>
        )}
        <p className="text-gray-600 mt-2">
          A confirmation email has been sent to your address.
        </p>
        <Link href="/" passHref>
          <Button className="mt-8">Go back to Homepage</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        Payment Failed or Canceled
      </h1>
      <p className="text-lg mb-2">
        There was an issue with your payment.
      </p>
      <p className="text-gray-600">
        If you believe this is an error, please contact our support team.
      </p>
      <Link href="/checkout" passHref>
        <Button variant="outline" className="mt-8">
          Try Again
        </Button>
      </Link>
    </div>
  );
}
