'use client';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'sonner';

export interface PayPalCheckoutButtonProps {
  /** PayPal order id returned by the backend (legacy SDK flow). */
  orderID?: string;
  /**
   * Official PayPal approval URL returned by MCOM Pay. When present we redirect
   * to PayPal's own checkout page — the order belongs to MCOM Central's PayPal
   * merchant, so it must not be driven by the mall's SDK client id.
   */
  approvalUrl?: string | null;
  onPaymentSuccess?: (transactionId: string) => void;
  /** Alias used by older admin call sites. */
  onSuccess?: (transactionId: string) => void;
  disabled?: boolean;
}

/**
 * The one PayPal entry point used by every mall/admin payment flow.
 * Never capture in the browser: MCOM Pay confirms server-side.
 */
export function PayPalCheckoutButton({
  orderID,
  approvalUrl,
  onPaymentSuccess,
  onSuccess,
  disabled,
}: PayPalCheckoutButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const notify = onPaymentSuccess ?? onSuccess;

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

  if (!orderID || !notify) {
    return (
      <p className="text-sm text-rose-600">
        PayPal is not available for this payment. Please choose another method.
      </p>
    );
  }

  return (
    <div>
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <PayPalButtons
          disabled={disabled}
          createOrder={() => Promise.resolve(orderID)}
          onApprove={async (data) => {
            if (data.orderID) {
              notify(data.orderID);
            } else {
              toast.error('Transaction ID not found.');
            }
          }}
          onError={() => {
            toast.error('An error occurred during the PayPal transaction.');
          }}
        />
      )}
    </div>
  );
}
