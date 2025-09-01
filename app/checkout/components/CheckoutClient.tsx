'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import { useGetProductById } from '@/service/store/products/hook';

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const { data: product, isLoading } = useGetProductById(productId || '');
  const [quantity, setQuantity] = useState(1);

  if (!productId) {
    return <div>No product selected.</div>;
  }

  if (isLoading) {
    return <div>Loading product...</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <OrderSummary
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
          />
        </div>
        <div>
          <PaymentForm totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}
