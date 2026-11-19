'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { toast } from 'sonner';

interface PayPalButtonWrapperProps {
  orderId?: string;
  approvalUrl?: string | null;
  onApprove: (orderId: string) => void;
  disabled?: boolean;
}

/**
 * PayPal entry point. Prefer MCOM Pay's official `approvalUrl` (Central owns
 * the PayPal merchant); the SDK path remains only for legacy callers.
 */
export default function PayPalButtonWrapper({
  orderId,
  approvalUrl,
  onApprove,
  disabled,
}: PayPalButtonWrapperProps) {
  if (approvalUrl) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          window.location.href = approvalUrl;
        }}
        className="w-full rounded-lg bg-[#0070ba] px-4 py-3 font-semibold text-white transition hover:bg-[#005ea6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue with PayPal
      </button>
    );
  }

  if (!orderId) {
    return (
      <p className="text-sm text-rose-600">
        PayPal is not available for this payment.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        disabled={disabled}
        createOrder={() => Promise.resolve(orderId)}
        // Never capture in the browser.
        onApprove={async (data) => {
          if (data.orderID) onApprove(data.orderID);
          else toast.error('PayPal order id missing.');
        }}
        onError={() => toast.error('PayPal could not complete the payment.')}
      />
    </PayPalScriptProvider>
  );
}
