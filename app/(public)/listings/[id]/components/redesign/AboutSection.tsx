
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
      className="py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-10 rounded-lg shadow-lg border-l-8 border-orange-600">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-900">
            About <span className="text-orange-600">{listing.businessName}</span>
          </h2>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            {listing.about}
          </p>
          {listing.website && (
            <Button
              asChild
              className="bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 px-8 py-4 text-lg font-bold rounded-full shadow-lg hover:shadow-xl"
            >
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Our Website
              </a>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
