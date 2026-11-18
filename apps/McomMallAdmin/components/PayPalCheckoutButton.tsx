'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';

interface PayPalCheckoutButtonProps {
  orderID?: string;
  approvalUrl?: string | null;
  onSuccess: (orderId: string) => void;
}

/**
 * Admin PayPal entry point. Prefer MCOM Pay's `approvalUrl` (Central's PayPal
 * merchant); never capture in the browser.
 */
export default function PayPalCheckoutButton({
  orderID,
  approvalUrl,
  onSuccess,
}: PayPalCheckoutButtonProps) {
  if (approvalUrl) {
    return (
      <button
        type="button"
        onClick={() => {
          window.location.href = approvalUrl;
        }}
        className="w-full rounded-lg bg-[#0070ba] px-4 py-3 font-semibold text-white transition hover:bg-[#005ea6]"
      >
        Continue with PayPal
      </button>
    );
  }

  if (!orderID) {
    return (
      <p className="text-sm text-rose-600">
        PayPal is not available for this payment.
      </p>
    );
  }

  return (
    <PayPalButtons
      createOrder={() => Promise.resolve(orderID)}
      onApprove={async (data) => {
        if (data.orderID) onSuccess(data.orderID);
        else toast.error('PayPal order id missing.');
      }}
      onError={() => toast.error('PayPal could not complete the payment.')}
    />
  );
}
