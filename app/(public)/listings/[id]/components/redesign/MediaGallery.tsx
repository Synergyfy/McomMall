
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface MediaGalleryProps {
  media: string[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
          Our <span className="text-orange-600">Gallery</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((url, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative h-72 w-full overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300" />
              <Image
                src={url}
                alt={`Gallery image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 border-4 border-transparent group-hover:border-orange-600 transition-all duration-300 animate-border-pulse"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
