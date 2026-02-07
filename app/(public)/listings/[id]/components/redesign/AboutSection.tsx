'use client';

import { motion } from 'framer-motion';
import { InHouseBusiness } from '@/service/listings/types';
import { 
  Building2, 
  Users2, 
  CalendarCheck, 
  Award,
  ArrowRight
} from 'lucide-react';

interface AboutSectionProps {
  listing: InHouseBusiness;
}

export default function AboutSection({ listing }: AboutSectionProps) {
  const stats = [
    { label: 'Established', value: listing.createdAt ? new Date(listing.createdAt).getFullYear() : '2023', icon: Building2 },
    { label: 'Community', value: 'Verified', icon: Users2 },
    { label: 'Service', value: listing.listingType.join(' & '), icon: Award },
    { label: 'Availability', value: 'Flexible', icon: CalendarCheck },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            Our Story & <span className="text-[#f58220]">Mission</span>
          </h2>
          <div className="prose prose-lg max-w-none text-gray-500 font-medium leading-relaxed">
            {listing.about?.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4">{paragraph}</p>
            )) || "Welcome to " + listing.businessName + ". We are dedicated to providing the highest quality products and services to our customers. Our team is committed to excellence and ensuring that every experience with us is exceptional."}
          </div>
        </div>

        {listing.website && (
          <a 
            href={listing.website} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-3 text-[#f58220] font-black text-lg hover:gap-5 transition-all"
          >
            Visit Our Official Website <ArrowRight size={20} />
          </a>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 mb-6">Business Highlights</h3>
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-orange-200 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f58220] group-hover:bg-[#f58220] group-hover:text-white transition-all">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-black text-gray-900 capitalize">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}