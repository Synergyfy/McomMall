// app/(public)/products/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { promotionalItems } from '@/lib/listing-data';

// Full product type, combining promotional item data with details
interface Product {
  id: number;
  title: string;
  image: string;
  category: string;
  price: number;
  discountedPrice?: number;
  description: string;
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      const productId = parseInt(id as string, 10);
      const foundProduct = promotionalItems.find((item) => item.id === productId);

      if (foundProduct) {
        setProduct({
          ...foundProduct,
          description: `This is a detailed description for ${foundProduct.title}. It highlights the key features and benefits of the product, ensuring customers have all the information they need.`,
        });
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-600 text-lg mb-4">{product.category}</p>
          <div className="flex items-center mb-6">
            {product.discountedPrice ? (
              <>
                <p className="text-2xl font-semibold text-red-600 mr-4">${product.discountedPrice.toFixed(2)}</p>
                <p className="text-xl font-medium text-gray-500 line-through">${product.price.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-blue-600">${product.price.toFixed(2)}</p>
            )}
          </div>
          <p className="text-gray-800 mb-6">{product.description}</p>

          <Link href={`/checkout?productId=${product.id}`}>
            <div className="w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Proceed to Checkout
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
