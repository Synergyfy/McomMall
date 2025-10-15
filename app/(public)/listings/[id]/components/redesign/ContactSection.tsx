
'use client';

import { motion } from 'framer-motion';
import { InHouseBusiness } from '@/service/listings/types';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
} from 'lucide-react';

interface ContactSectionProps {
  listing: InHouseBusiness;
}

const socialIconMap = {
  facebook: <Facebook />,
  twitter: <Twitter />,
  instagram: <Instagram />,
  linkedin: <Linkedin />,
  youtube: <Youtube />,
  website: <Globe />,
};

export default function ContactSection({ listing }: ContactSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.4 }}
      className="p-8 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <p className="text-gray-700 mb-2">
            <strong>Email:</strong> {listing.businessEmail}
          </p>
          <p className="text-gray-700">
            <strong>Phone:</strong> {listing.businessPhone}
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
          <div className="flex gap-4">
            {listing.socialLinks?.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500"
              >
                {socialIconMap[link.platform as keyof typeof socialIconMap]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
