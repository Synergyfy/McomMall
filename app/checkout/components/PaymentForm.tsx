'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';

interface PaymentFormProps {
  totalPrice: number;
  onPaymentSuccess: (orderId: string) => void;
}

export default function PaymentForm({
  totalPrice,
  onPaymentSuccess,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>
      <Tabs
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stripe">Card</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
        </TabsList>
        <TabsContent value="stripe">
          <div className="mt-4">
            <StripeCheckoutForm totalPrice={totalPrice} />
          </div>
        </TabsContent>
        <TabsContent value="paypal">
          <div className="mt-4">
            <PayPalCheckoutButton
              totalPrice={totalPrice}
              onSuccess={onPaymentSuccess}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
