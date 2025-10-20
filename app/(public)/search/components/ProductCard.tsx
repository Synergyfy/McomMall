'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  item: any;
}

export default function ProductCard({ item }: ProductCardProps) {
  const { addItemToCart } = useCart();
  const router = useRouter();
  const imageUrl = item.media?.[0] || 'https://via.placeholder.com/300';
  const title = item.title || item.name;
  const price = item.price || item.fixedPrice;
  const description = item.shortDescription || item.description;

  const handleAddToCart = () => {
    addItemToCart({ productId: item.id, quantity: 1, product: item });
  };

  const handleBuyNow = () => {
    addItemToCart({ productId: item.id, quantity: 1, product: item });
    router.push('/checkout');
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col justify-between">
      <div>
        <Image src={imageUrl} alt={title} width={300} height={200} className="object-cover rounded-md" />
        <h2 className="text-lg font-bold mt-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <p className="text-lg font-bold mt-2">${price}</p>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={handleAddToCart}>Add to Cart</Button>
        <Button onClick={handleBuyNow} variant="outline">Buy Now</Button>
      </div>
    </div>
  );
}
