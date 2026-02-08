'use client';

import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';

const PAYPAL_CLIENT_ID =
  'AdMnk_v1AaH8-ntOEM6y58zDTWkb5VzOAn285XcoSwDxnecLJb0OcPFCSUYGmiRQHR8x2o97JHnYXPuJ';

interface PayPalButtonWrapperProps {
  paypalAmount: string;
  handleSuccess: () => void;
}

export default function PayPalButtonWrapper({
  paypalAmount,
  handleSuccess,
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
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'GBP',
                  value: paypalAmount,
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          console.log('Simulating PayPal payment approval');
          handleSuccess();
          return Promise.resolve();
        }}
      />
    </PayPalScriptProvider>
  );
}
