'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface MediaGalleryProps {
  media: string[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  
  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % media.length);
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + media.length) % media.length);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((url, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 0.98 }}
            className={`relative cursor-pointer overflow-hidden rounded-[2rem] group ${
              index === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-square'
            }`}
            onClick={() => openLightbox(index)}
          >
            <Image
              src={url}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Maximize2 size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-8 right-8 text-white/60 hover:text-white p-2 rounded-full bg-white/10"
              onClick={closeLightbox}
            >
              <X size={32} />
            </button>

            <button 
              className="absolute left-8 text-white/60 hover:text-white p-4 rounded-full bg-white/10 hidden md:block"
              onClick={showPrev}
            >
              <ChevronLeft size={40} />
            </button>

            <div className="relative w-full h-full max-w-5xl">
              <Image
                src={media[selectedImageIndex]}
                alt="Enlarged gallery image"
                fill
                className="object-contain"
              />
            </div>

            <button 
              className="absolute right-8 text-white/60 hover:text-white p-4 rounded-full bg-white/10 hidden md:block"
              onClick={showNext}
            >
              <ChevronRight size={40} />
            </button>

            <div className="absolute bottom-12 text-white/60 font-black text-sm uppercase tracking-[0.2em]">
              Image {selectedImageIndex + 1} of {media.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}