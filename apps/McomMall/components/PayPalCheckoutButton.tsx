'use client';

import {
  PayPalButtons,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { toast } from 'sonner';

interface PayPalCheckoutButtonProps {
  orderID: string;
  onPaymentSuccess: (transactionId: string) => void;
}

export function PayPalCheckoutButton({
  orderID,
  onPaymentSuccess,
}: PayPalCheckoutButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();

  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <PayPalButtons
          createOrder={(data, actions) => {
            return Promise.resolve(orderID);
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              if (details.id) {
                onPaymentSuccess(details.id);
              } else {
                toast.error('Transaction ID not found.');
              }
            }
          }}
          onError={err => {
            toast.error('An error occurred during the PayPal transaction.');
          }}
        />
      )}
    </div>
  );
}
