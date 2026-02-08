'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ServiceGalleryProps {
  images: string[];
  title: string;
}

export default function ServiceGallery({ images, title }: ServiceGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm w-full h-[300px] sm:h-[400px] lg:h-[500px]">
        <Image
          src={images[currentImageIndex]}
          alt={title}
          fill
          className="object-contain p-2"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                currentImageIndex === index
                  ? 'border-orange-600 opacity-100 ring-1 ring-orange-200'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-200'
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
