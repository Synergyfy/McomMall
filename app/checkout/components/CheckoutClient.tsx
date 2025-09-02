'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import { useGetProductById } from '@/service/store/products/hook';
import PaymentSuccessModal from '@/components/PaymentSuccessModal';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const stripeRedirect = searchParams.get('stripe_redirect');
  const clientSecret = searchParams.get('payment_intent_client_secret');

  const { data: product, isLoading } = useGetProductById(productId || '');
  const [quantity, setQuantity] = useState(1);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (stripeRedirect && clientSecret) {
      const verifyPayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) return;
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          clientSecret
        );
        if (paymentIntent?.status === 'succeeded') {
          setSuccessModalOpen(true);
        }
      };
      verifyPayment();
    }
  }, [stripeRedirect, clientSecret]);

  if (!productId) {
    return <div>No product selected.</div>;
  }

  if (isLoading) {
    return <div>Loading product...</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  const handlePaymentSuccess = () => {
    setSuccessModalOpen(true);
  };

  const totalPrice = product.price * quantity;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <OrderSummary
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
            />
          </div>
          <div>
            <PaymentForm
              totalPrice={totalPrice}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </div>
      <PaymentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </>
  );
}
