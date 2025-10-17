
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
      className="py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-10 rounded-lg shadow-lg border-t-8 border-orange-600">
          <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900">
            Get in <span className="text-orange-600">Touch</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-orange-100 rounded-full">
                <Mail className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Email Us</h3>
              <a
                href={`mailto:${listing.businessEmail}`}
                className="text-gray-600 hover:text-orange-600 text-lg"
              >
                {listing.businessEmail}
              </a>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-orange-100 rounded-full">
                <Phone className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Call Us</h3>
              <a
                href={`tel:${listing.businessPhone}`}
                className="text-gray-600 hover:text-orange-600 text-lg"
              >
                {listing.businessPhone}
              </a>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-orange-100 rounded-full">
                <Globe className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Follow Us
              </h3>
              <div className="flex gap-5">
                {listing.socialLinks?.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-orange-600 transform hover:scale-125 transition-transform"
                  >
                    {socialIconMap[link.platform as keyof typeof socialIconMap]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
