
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { InHouseBusiness } from '@/service/listings/types';

interface HeroSectionProps {
  listing: InHouseBusiness;
}

export default function HeroSection({ listing }: HeroSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative h-96 w-full"
    >
      <Image
        src={listing.bannerUrl || ''}
        alt={listing.bannerAltText || listing.businessName}
        layout="fill"
        objectFit="cover"
        className="rounded-lg"
      />
      {listing.bannerHotspots?.map(hotspot => (
        <a
            key={hotspot.id}
            href={hotspot.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute w-6 h-6 rounded-full bg-red-500/80 border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-xl hover:scale-125 transition-transform"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </a>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg" />
      <div className="absolute bottom-0 left-0 p-8 text-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <Image
            src={listing.logoUrl || ''}
            alt={listing.logoAltText || listing.businessName}
            width={100}
            height={100}
            className="rounded-full border-4 border-white"
          />
          <div>
            <h1 className="text-4xl font-bold">{listing.businessName}</h1>
            <p className="text-lg text-gray-200">{listing.shortDescription}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
