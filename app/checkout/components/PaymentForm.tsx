'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet } from 'lucide-react';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';
import { Button } from '@/components/ui/button';

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
            onClick={() => setPaymentMethod('stripe')}
            variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
            className={`w-full h-20 text-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 ${
              paymentMethod === 'stripe'
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
            onClick={() => setPaymentMethod('paypal')}
            variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
            className={`w-full h-20 text-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-300 ${
              paymentMethod === 'paypal'
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
        {paymentMethod === 'stripe' && (
          <motion.div
            key="stripe"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <StripeCheckoutForm totalPrice={totalPrice} />
          </motion.div>
        )}
        {paymentMethod === 'paypal' && (
          <motion.div
            key="paypal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PayPalCheckoutButton
              totalPrice={totalPrice}
              onSuccess={onPaymentSuccess}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
