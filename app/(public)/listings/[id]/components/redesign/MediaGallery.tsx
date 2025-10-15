
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
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {media.map((url, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="relative h-64 w-full overflow-hidden rounded-lg shadow-lg"
          >
            <Image
              src={url}
              alt={`Gallery image ${index + 1}`}
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
