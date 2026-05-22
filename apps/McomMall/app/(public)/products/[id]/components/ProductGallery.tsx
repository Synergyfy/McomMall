'use client';

import { useState, useEffect } from 'react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // When images list changes (e.g., a variant image is prepended),
  // reset to the first image so the customer sees the variant they selected.
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image - Increased height for 'large' look */}
      <div className="relative bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm w-full h-[300px] sm:h-[400px] lg:h-[500px]">
        <img src={images[currentImageIndex]} alt={title} className="absolute inset-0 w-full h-full object-contain p-2" />
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
              <img src={img} alt={`${title} view ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
