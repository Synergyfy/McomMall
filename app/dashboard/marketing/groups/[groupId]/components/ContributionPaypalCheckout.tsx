"use client";

import {
  PayPalScriptProvider,
  PayPalButtons,
} from '@paypal/react-paypal-js';
import { useVerifyContributionPayment } from '@/service/grouping/hooks';
import { PaymentMethod } from '@/service/membership/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ContributionPaypalCheckoutProps {
  groupId: string;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ContributionPaypalCheckout = ({
  groupId,
  orderId,
  onSuccess,
  onCancel,
}: ContributionPaypalCheckoutProps) => {
  const verifyPayment = useVerifyContributionPayment();
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  const handleApprove = async (data: { orderID: string }) => {
    verifyPayment.mutate(
      {
        groupId,
        dto: {
          paymentProvider: PaymentMethod.PAYPAL,
          transactionId: data.orderID,
        },
      },
      {
        onSuccess: () => {
          toast.success('Contribution paid successfully!');
          onSuccess();
        },
        onError: (error: ApiError) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred.';
          toast.error(`Payment verification failed: ${errorMessage}`);
        },
      }
    );
  };

  if (!paypalClientId) {
    return (
      <div className="text-red-500 text-center">
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

export default ContributionPaypalCheckout;