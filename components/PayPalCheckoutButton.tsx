'use client';

import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import { usePayPalPayment } from '@/hooks/usePayPalPayment';
import { toast } from 'sonner';

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'; // Fallback to 'sb' for sandbox

interface PayPalCheckoutButtonProps {
  totalPrice: number;
}

export default function PayPalCheckoutButton({
  totalPrice,
}: PayPalCheckoutButtonProps) {
  const { createOrderMutation, captureOrderMutation } = usePayPalPayment();

  const createOrder = async () => {
    try {
      const data = await createOrderMutation.mutateAsync(totalPrice);
      return data.id;
    } catch (_error) {
      toast.error('Could not create PayPal order. Please try again.');
      return '';
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      await captureOrderMutation.mutateAsync(data.orderID);
      toast.success('Payment successful!');
      // TODO: Redirect to a success page or show a success message
    } catch (_error) {
      toast.error('Could not capture PayPal payment. Please try again.');
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: 'GBP',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={createOrder}
        onApprove={onApprove}
      />
    </PayPalScriptProvider>
  );
}
