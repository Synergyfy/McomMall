'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { PayPalCheckoutButton } from '@mcommall/payments';

interface PayPalButtonWrapperProps {
  orderId?: string;
  approvalUrl?: string | null;
  onApprove: (orderId: string) => void;
  disabled?: boolean;
}

/**
 * Legacy wrapper kept for call sites that are outside the app-level PayPal
 * provider. The button itself is the shared @mcommall/payments implementation.
 */
export default function PayPalButtonWrapper({
  orderId,
  approvalUrl,
  onApprove,
  disabled,
}: PayPalButtonWrapperProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        intent: 'capture',
      }}
    >
      <PayPalCheckoutButton
        orderID={orderId}
        approvalUrl={approvalUrl}
        onPaymentSuccess={onApprove}
        disabled={disabled}
      />
    </PayPalScriptProvider>
  );
}
