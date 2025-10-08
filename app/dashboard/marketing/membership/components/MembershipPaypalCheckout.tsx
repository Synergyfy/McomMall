"use client";

import {
  PayPalScriptProvider,
  PayPalButtons,
  OnApproveData,
} from '@paypal/react-paypal-js';
import { useVerifyMembershipPayment } from '@/service/membership/hooks';
import { MembershipTier, PaymentMethod } from '@/service/membership/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface MembershipPaypalCheckoutProps {
  orderId: string;
  tier: MembershipTier;
  onSuccess: () => void;
  onCancel: () => void;
}

const MembershipPaypalCheckout = ({
  orderId,
  tier,
  onSuccess,
  onCancel,
}: MembershipPaypalCheckoutProps) => {
  const verifyPayment = useVerifyMembershipPayment();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const handleApprove = async (data: OnApproveData) => {
    verifyPayment.mutate(
      {
        paymentProvider: PaymentMethod.PAYPAL,
        transactionId: data.orderID,
        purchaseDetails: { tier },
      },
      {
        onSuccess: () => {
          toast.success('Payment successful! Your membership is active.');
          onSuccess();
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || 'An unexpected error occurred.';
          toast.error(`Payment verification failed: ${errorMessage}`);
        },
      }
    );
  };

  if (!paypalClientId) {
    return (
      <div className="text-red-500">
        PayPal client ID is not configured. Please contact support.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: 'GBP',
      }}
    >
      <PayPalButtons
        key={orderId}
        style={{ layout: 'vertical', color: 'blue', shape: 'rect' }}
        createOrder={(data, actions) => {
          return Promise.resolve(orderId);
        }}
        onApprove={handleApprove}
        onError={(err) => {
          toast.error('An error occurred during the PayPal transaction.');
          console.error('PayPal error:', err);
        }}
        onCancel={() => {
          toast.info('You have cancelled the payment.');
          onCancel();
        }}
      />
      <Button variant="outline" className="w-full mt-2" onClick={onCancel}>
        Cancel
      </Button>
    </PayPalScriptProvider>
  );
};

export default MembershipPaypalCheckout;