'use client';

import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  'AeHmWJvBfMkb15hjVIrL88K8mLO9zzaCVC_b53EXSQ-6c163aYzXuV05QZtMsENzoaXK_G0lqyIDDpAY';

interface PayPalButtonWrapperProps {
  orderId: string;
  onApprove: (orderId: string) => void;
}

export default function PayPalButtonWrapper({
  orderId,
  onApprove,
}: PayPalButtonWrapperProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: 'GBP',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical' }}
        createOrder={() => {
          return Promise.resolve(orderId);
        }}
        onApprove={async data => {
          console.log('PayPal payment approved for orderId:', data.orderID);
          onApprove(data.orderID);
        }}
        onError={err => {
          console.error('PayPal Checkout onError', err);
        }}
      />
    </PayPalScriptProvider>
  );
}
