'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-50 rounded-lg overflow-hidden aspect-[4/3] w-full border border-gray-100">
        <Image
          src={images[currentImageIndex]}
          alt={title}
          fill
          className="object-contain"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border transition-all ${
                currentImageIndex === index
                  ? 'border-orange-600 ring-2 ring-orange-50'
                  : 'border-transparent ring-1 ring-gray-200 hover:ring-gray-300'
              }`}
            >
              <Image
                src={img}
                alt={`${title} view ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
