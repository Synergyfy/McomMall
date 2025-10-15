
'use client';

import { motion } from 'framer-motion';
import { InHouseBusiness } from '@/service/listings/types';

interface AboutSectionProps {
  listing: InHouseBusiness;
}

export default function AboutSection({ listing }: AboutSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="p-8 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">About {listing.businessName}</h2>
      <p className="text-gray-700 mb-4">{listing.about}</p>
      <a
        href={listing.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        Visit our website
      </a>
    </motion.div>
  );
}
