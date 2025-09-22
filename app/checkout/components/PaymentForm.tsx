'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet } from 'lucide-react';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/service/bookings/types';

interface PaymentFormProps {
  totalPrice: number;
  onPaymentSuccess: (orderId: string) => void;
  clientSecret?: string;
  orderID?: string;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export default function PaymentForm({
  totalPrice,
  onPaymentSuccess,
  clientSecret,
  orderID,
  setPaymentMethod,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    PaymentMethod.STRIPE
  );

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPaymentMethod(method);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-800">Payment Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => handleMethodChange(PaymentMethod.STRIPE)}
            variant={
              selectedMethod === PaymentMethod.STRIPE ? 'default' : 'outline'
            }
            className={`w-full h-20 text-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 ${
              selectedMethod === PaymentMethod.STRIPE
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white'
            }`}
          >
            <CreditCard className="h-7 w-7" />
            <span>Credit Card</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => handleMethodChange(PaymentMethod.PAYPAL)}
            variant={
              selectedMethod === PaymentMethod.PAYPAL ? 'default' : 'outline'
            }
            className={`w-full h-20 text-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 ${
              selectedMethod === PaymentMethod.PAYPAL
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white'
            }`}
          >
            <Wallet className="h-7 w-7" />
            <span>PayPal</span>
          </Button>
        </motion.div>
      </div>

      <div className="mt-6">
        {selectedMethod === PaymentMethod.STRIPE && clientSecret && (
          <motion.div
            key="stripe"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <StripeCheckoutForm clientSecret={clientSecret} />
          </motion.div>
        )}
        {selectedMethod === PaymentMethod.PAYPAL && orderID && (
          <motion.div
            key="paypal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PayPalCheckoutButton
              orderID={orderID}
              onSuccess={onPaymentSuccess}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
