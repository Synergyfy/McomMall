'use client';

import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import { toast } from 'sonner';

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

interface PayPalCheckoutButtonProps {
  orderID: string;
  onSuccess: (orderId: string) => void;
}

export default function PayPalCheckoutButton({
  orderID,
  onSuccess,
}: PayPalCheckoutButtonProps) {
  const onApprove = async (data: { orderID: string }) => {
    onSuccess(data.orderID);
  };

  if (!orderID) {
    return <div>Loading PayPal button...</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: 'GBP',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={(_, actions) => {
          return Promise.resolve(orderID);
        }}
        onApprove={onApprove}
      />
    </PayPalScriptProvider>
  );
}
