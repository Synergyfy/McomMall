'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface MediaGalleryProps {
  media: string[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

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

  // Keyboard navigation for lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedImageIndex === null) return;
    if (e.key === 'ArrowRight') showNext(e as any);
    if (e.key === 'ArrowLeft') showPrev(e as any);
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6 auto-rows-[150px] md:auto-rows-[200px]">
        {media.map((url, index) => {
          // Modern Bento Grid Logic
          const isFeatured = index === 0;
          const isLarge = index === 1 || index === 5;
          
          let gridClass = "col-span-1 row-span-1";
          if (isFeatured) gridClass = "col-span-2 row-span-2";
          else if (isLarge && media.length > 5) gridClass = "col-span-2 row-span-1";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className={`relative cursor-pointer overflow-hidden rounded-3xl group shadow-sm hover:shadow-xl transition-all duration-500 ${gridClass}`}
              onClick={() => openLightbox(index)}
            >
              {/* Shimmer Loading State */}
              {!loadedImages[index] && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <img Icon />
                </div>
              )}
              
              <img src={url} alt={`Gallery image ${index + 1}`} onLoadingComplete={() => handleImageLoad(index)} sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className={`absolute inset-0 w-full h-full ${`object-cover transition-all duration-700 group-hover:scale-110 ${
                  loadedImages[index] ? 'opacity-100' : 'opacity-0'
                }`}`} />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 scale-50 group-hover:scale-100 transition-transform duration-500">
                  <Maximize2 size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 outline-none"
            onClick={closeLightbox}
          >
            <motion.button 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-8 right-8 text-white/60 hover:text-white p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all z-20"
              onClick={closeLightbox}
            >
              <X size={28} />
            </motion.button>

            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-4 md:left-8 text-white/60 hover:text-white p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hidden md:block z-20"
              onClick={showPrev}
            >
              <ChevronLeft size={40} />
            </motion.button>

            <div className="relative w-full h-full max-w-6xl flex items-center justify-center">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="relative w-full h-full"
              >
                <img src={media[selectedImageIndex]} alt="Enlarged gallery image" sizes="100vw" className="absolute inset-0 w-full h-full object-contain" />
              </motion.div>
            </div>

            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-4 md:right-8 text-white/60 hover:text-white p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hidden md:block z-20"
              onClick={showNext}
            >
              <ChevronRight size={40} />
            </motion.button>

            <div className="absolute bottom-12 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white/80 font-black text-xs uppercase tracking-[0.3em]">
              {selectedImageIndex + 1} <span className="text-white/30 mx-2">/</span> {media.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}