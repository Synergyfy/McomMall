
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { promotionalItems } from '@/lib/listing-data';
import Image from 'next/image';
import Link from 'next/link';

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = promotionalItems.find((item) => item.id === parseInt(id as string));

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image src={product.image} alt={product.title} width={500} height={500} className="rounded-lg" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-lg text-gray-700 mb-4">
            This is a mock description for the product. More details about the product will be displayed here.
          </p>
          <Link href="/checkout">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
