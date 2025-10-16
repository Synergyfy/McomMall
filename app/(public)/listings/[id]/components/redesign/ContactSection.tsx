
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
  Mail,
  Phone,
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Contact Us</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Mail className="h-6 w-6 text-orange-600" />
            <a href={`mailto:${listing.businessEmail}`} className="text-gray-600 hover:text-orange-600">
              {listing.businessEmail}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-6 w-6 text-orange-600" />
            <a href={`tel:${listing.businessPhone}`} className="text-gray-600 hover:text-orange-600">
              {listing.businessPhone}
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Follow Us</h3>
          <div className="flex gap-4">
            {listing.socialLinks?.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-orange-600"
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
