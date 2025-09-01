'use client';

import Image from 'next/image';
import { Product } from '@/service/listings/types';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface OrderSummaryProps {
  product: Product;
  quantity: number;
  setQuantity: (quantity: number | ((prev: number) => number)) => void;
}

export default function OrderSummary({
  product,
  quantity,
  setQuantity,
}: OrderSummaryProps) {
  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24">
          <Image
            src={product.imageUrl || '/placeholder.svg'}
            alt={product.title}
            layout="fill"
            className="object-cover rounded-md"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{product.title}</h3>
          <p className="text-gray-500">£{product.price.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6">
        <p className="font-semibold">Quantity</p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span>{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-6 border-t pt-4">
        <p className="text-lg font-bold">Total</p>
        <p className="text-lg font-bold">£{totalPrice.toFixed(2)}</p>
      </div>
    </div>
  );
}
