'use client';

import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID =
  'AdMnk_v1AaH8-ntOEM6y58zDTWkb5VzOAn285XcoSwDxnecLJb0OcPFCSUYGmiRQHR8x2o97JHnYXPuJ';

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
