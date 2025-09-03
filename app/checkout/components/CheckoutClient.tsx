'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import { useGetProductById } from '@/service/store/products/hook';
import { loadStripe } from '@stripe/stripe-js';
import { useCheckout } from '@/hooks/useCheckout';
import { PaymentMethod } from '@/hooks/useCheckout';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { mutate: checkout } = useCheckout();
  const totalPrice = product ? product.price * quantity : 0;

  const handlePaymentSuccess = useCallback(
    (transactionId: string, paymentMethod: PaymentMethod) => {
      if (!product) return;
      checkout(
        {
          payment: {
            paymentMethod,
            amount: totalPrice,
            transactionId,
          },
        },
        {
          onSuccess: () => {
            setSuccessModalOpen(true);
          },
        }
      );
    },
    [product, totalPrice, checkout]
  );

  useEffect(() => {
    if (stripeRedirect && clientSecret) {
      const verifyPayment = async () => {
        const stripe = await stripePromise;
        if (!stripe) return;
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          clientSecret
        );
        if (paymentIntent?.status === 'succeeded') {
          handlePaymentSuccess(paymentIntent.id, PaymentMethod.STRIPE);
        }
      };
      verifyPayment();
    }
  }, [stripeRedirect, clientSecret, handlePaymentSuccess]);

  if (!productId) {
    return <div>No product selected.</div>;
  }

  if (isLoading) {
    return <div>Loading product...</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

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
              onPaymentSuccess={(transactionId) =>
                handlePaymentSuccess(transactionId, PaymentMethod.PAYPAL)
              }
            />
          </div>
        </div>
      </div>
      <SuccessDialog
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          router.push('/dashboard/orders');
        }}
      />
    </>
  );
}
