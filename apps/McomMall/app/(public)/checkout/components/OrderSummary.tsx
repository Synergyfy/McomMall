'use client';

import { motion } from 'framer-motion';
import { Product } from '@/service/listings/types';
import { Cart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface OrderSummaryProps {
  product?: Product;
  cart?: Cart | null;
  fromCart: boolean;
  quantity: number;
  setQuantity: (quantity: number | ((prev: number) => number)) => void;
  discount: number;
  totalPrice: number;
}

export default function OrderSummary({
  product,
  cart,
  fromCart,
  quantity,
  setQuantity,
  discount,
  totalPrice,
}: OrderSummaryProps) {
  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const basePrice =
    (fromCart
      ? cart?.items.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        )
      : product
      ? product.price * quantity
      : 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-800">Order Summary</h2>
      {fromCart ? (
        <div className="space-y-4">
          {cart?.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className="relative w-20 h-20">
                <img
                  src={item.product.imageUrl || '/placeholder.svg'}
                  alt={item.product.title}
                  className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.product.title}
                </h3>
                <p className="text-gray-500">
                  £{item.product.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <p className="text-lg font-semibold text-gray-800">
                £{(item.product.price * item.quantity).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        product && (
          <>
            <div className="flex items-center space-x-6">
              <div className="relative w-28 h-28">
                <img
                  src={product.imageUrl || '/placeholder.svg'}
                  alt={product.title}
                  className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {product.title}
                </h3>
                <p className="text-lg text-gray-600">
                  £{product.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <p className="text-lg font-semibold text-gray-800">Quantity</p>
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="bg-gray-100 border-gray-300 hover:bg-gray-200"
                  >
                    <Minus className="h-5 w-5 text-gray-600" />
                  </Button>
                </motion.button>
                <span className="text-xl font-bold text-gray-800">
                  {quantity}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    className="bg-gray-100 border-gray-300 hover:bg-gray-200"
                  >
                    <Plus className="h-5 w-5 text-gray-600" />
                  </Button>
                </motion.button>
              </div>
            </div>
          </>
        )
      )}
      <div className="mt-8 border-t-2 border-gray-100 pt-6 space-y-3">
        <div className="flex items-center justify-between text-lg">
          <p className="text-gray-600">Subtotal</p>
          <p className="font-semibold text-gray-800">
            £{basePrice.toFixed(2)}
          </p>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-lg text-green-600">
            <p>Discount</p>
            <p className="font-semibold">-£{discount.toFixed(2)}</p>
          </div>
        )}
        <div className="flex items-center justify-between text-2xl font-bold text-gray-800 pt-2 border-t-2 border-gray-100 mt-2">
          <p>Total</p>
          <p>£{totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
}
