'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductMediaGalleryProps {
  images: string[];
  productTitle: string;
}

export default function ProductMediaGallery({ images, productTitle }: ProductMediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[480px] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
        {selectedImage ? (
          <Image
            key={selectedImage}
            src={selectedImage}
            alt={productTitle}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {images?.map((url, index) => (
          <div
            key={index}
            className={cn(
              'rounded-lg overflow-hidden cursor-pointer border-2 transition-all',
              selectedImage === url ? 'border-red-500 shadow-md' : 'border-transparent hover:border-red-300'
            )}
            onClick={() => setSelectedImage(url)}
          >
            <Image
              src={url}
              alt={`${productTitle} thumbnail ${index + 1}`}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}