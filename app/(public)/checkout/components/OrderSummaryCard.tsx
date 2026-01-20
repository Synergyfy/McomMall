'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/service/listings/types';
import { Cart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Ticket, Gift, Tag, Percent, Calendar } from 'lucide-react';
import { CURRENCY } from '@/lib/utils';
import { ServiceBookingDetailsDto } from '@/hooks/useCheckout';
import { format } from 'date-fns';
import { useCallback } from 'react';

interface OrderSummaryCardProps {
  product?: Product;
  cart?: Cart | null;
  fromCart: boolean;
  quantity: number;
  setQuantity: (quantity: number | ((prev: number) => number)) => void;
  basePrice: number;
  totalPrice: number;
  couponDiscount: number;
  giftCardDiscount: number;
  voucherDiscount: number;
  offerDiscount: number;
  serviceBookings?: ServiceBookingDetailsDto[] | null;
  selectedVariants?: Record<string, string>;
}

export default function OrderSummaryCard({
  product,
  cart,
  fromCart,
  quantity,
  setQuantity,
  basePrice,
  totalPrice,
  couponDiscount,
  giftCardDiscount,
  voucherDiscount,
  offerDiscount,
  serviceBookings,
  selectedVariants,
}: OrderSummaryCardProps) {
  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const calculatePrice = useCallback((itemProduct: any, variants?: Record<string, string>) => {
    let price = itemProduct.salePrice && itemProduct.salePrice < itemProduct.price ? itemProduct.salePrice : itemProduct.price;
    if (variants && itemProduct.variants) {
         (itemProduct.variants as any[]).forEach((v: any) => {
            const selectedOptionName = variants[v.name];
            if (selectedOptionName) {
                const option = v.options.find((o: any) => o.name === selectedOptionName);
                if (option) {
                    price += Number(option.priceModifier) || 0;
                }
            }
        });
    }
    return price;
  }, []);

  const renderDiscountLine = (
    label: string,
    amount: number,
    icon: React.ReactNode
  ) => {
    if (amount <= 0) return null;
    return (
      <div className="flex items-center justify-between text-green-600">
        <div className="flex items-center space-x-2">
          {icon}
          <p>{label}</p>
        </div>
        <p className="font-semibold">
          -{CURRENCY}
          {amount.toFixed(2)}
        </p>
      </div>
    );
  };

  const servicesTotal = serviceBookings
    ? serviceBookings.reduce((acc, booking) => acc + Number(booking?.price || 0), 0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
        Order Summary
      </h2>

      {/* Product/Cart Items */}
      {fromCart ? (
        <div className="space-y-4">
          {cart?.items.map((item, index) => {
            const itemPrice = calculatePrice(item.product, item.selectedVariants);
            return (
            <motion.div
              key={item.id}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center space-x-4"
            >
              <div className="relative w-16 h-16">
                <Image
                  src={item.product.imageUrl || (item.product.fileUrls && item.product.fileUrls[0]) || '/placeholder.svg'}
                  alt={item.product.title}
                  layout="fill"
                  className="object-cover rounded-lg shadow-sm"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {item.product.title}
                </h3>
                {item.selectedVariants && (
                   <div className="text-xs text-gray-500 mb-1">
                       {Object.entries(item.selectedVariants).map(([key, val]) => (
                           <span key={key} className="mr-2">{key}: {val as string}</span>
                       ))}
                   </div>
                )}
                <p className="text-sm text-gray-500">
                  {CURRENCY}
                  {itemPrice.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-800">
                {CURRENCY}
                {(itemPrice * item.quantity).toFixed(2)}
              </p>
            </motion.div>
          )})}
        </div>
      ) : (
        product && (
          <>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24">
                <Image
                  src={product.imageUrl || (product.fileUrls && product.fileUrls[0]) || '/placeholder.svg'}
                  alt={product.title}
                  layout="fill"
                  className="object-cover rounded-lg shadow-sm"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {product.title}
                </h3>
                {selectedVariants && Object.keys(selectedVariants).length > 0 && (
                   <div className="text-sm text-gray-500 mb-1">
                       {Object.entries(selectedVariants).map(([key, val]) => (
                           <span key={key} className="mr-2">{key}: {val}</span>
                       ))}
                   </div>
                )}
                <p className="text-md text-gray-600">
                  {CURRENCY}
                  {calculatePrice(product, selectedVariants).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-800">Quantity</p>
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="bg-gray-100 border-gray-300 hover:bg-gray-200 rounded-full w-8 h-8"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </Button>
                </motion.div>
                <span className="text-lg font-bold text-gray-800 w-10 text-center">
                  {quantity}
                </span>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    className="bg-gray-100 border-gray-300 hover:bg-gray-200 rounded-full w-8 h-8"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </>
        )
      )}

      {/* Booked Services */}
      {serviceBookings && serviceBookings.length > 0 && (
        <div className="space-y-4 border-t-2 border-gray-100 pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-800">Booked Services</h3>
          {serviceBookings.map((booking) => (
            <motion.div
              key={booking.serviceId}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{booking.name}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(booking.startTime), 'PPP, p')}
                </p>
              </div>
              <p className="font-semibold text-gray-800">
                {CURRENCY}
                {Number(booking.price).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Financial Breakdown */}
      <div className="mt-6 border-t-2 border-gray-100 pt-6 space-y-3 text-md">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Subtotal</p>
          <p className="font-semibold text-gray-800">
            {CURRENCY}
            {(basePrice + servicesTotal).toFixed(2)}
          </p>
        </div>

        {/* Discounts Section */}
        {renderDiscountLine(
          'Coupon Discount',
          couponDiscount,
          <Ticket className="h-5 w-5" />
        )}
        {renderDiscountLine(
          'Gift Card',
          giftCardDiscount,
          <Gift className="h-5 w-5" />
        )}
        {renderDiscountLine(
          'Voucher',
          voucherDiscount,
          <Percent className="h-5 w-5" />
        )}
        {renderDiscountLine(
          'Offer Applied',
          offerDiscount,
          <Tag className="h-5 w-5" />
        )}

        {/* Total */}
        <div className="flex items-center justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-100 mt-3">
          <p>Total</p>
          <p>
            {CURRENCY}
            {totalPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
