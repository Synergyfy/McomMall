
'use client';

import { motion } from 'framer-motion';
import { InHouseBusiness } from '@/service/listings/types';
import { Button } from '@/components/ui/button';

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
      <h2 className="text-3xl font-bold mb-4 text-gray-800">About {listing.businessName}</h2>
      <p className="text-gray-600 mb-6">{listing.about}</p>
      <Button
        asChild
        className="bg-orange-600 text-white hover:bg-orange-700"
      >
        <a
          href={listing.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit our website
        </a>
      </Button>
    </motion.div>
  );
}
