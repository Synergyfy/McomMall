'use client';

import { motion } from 'framer-motion';
import { InHouseBusiness } from '@/service/listings/types';
import { 
  MapPin, 
  Clock, 
  Share2, 
  Heart, 
  CheckCircle2,
  Calendar,
  Globe,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  listing: InHouseBusiness;
}

export default function HeroSection({ listing }: HeroSectionProps) {
  return (
    <div className="relative h-[60vh] min-h-[500px] w-full bg-[#1A1A1A] overflow-hidden">
      {/* Background Image with Parallax-like feel */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={listing.bannerUrl || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=80'}
          alt={listing.bannerAltText || listing.businessName}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFDFD] via-black/20 to-black/40" />
      </motion.div>

      {/* Banner Hotspots */}
      {listing.bannerHotspots?.map(hotspot => (
        <a
          key={hotspot.id}
          href={hotspot.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute w-8 h-8 rounded-full bg-[#f58220]/90 border-4 border-white/50 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-2xl hover:scale-125 hover:bg-[#f58220] transition-all z-20 group"
          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
        >
          <div className="w-2.5 h-2.5 bg-white rounded-full group-hover:scale-110 transition-transform"></div>
          <span className="absolute top-10 whitespace-nowrap bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest">
            Special Offer
          </span>
        </a>
      ))}

      {/* Main Content Area */}
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-[1600px] mx-auto w-full px-8 pb-12">
          <div className="flex flex-col md:flex-row items-end gap-8">
            {/* Logo/Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative -mb-16 md:mb-0"
            >
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white p-2 shadow-2xl border-4 border-white overflow-hidden">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gray-50">
                   <img
                    src={listing.logoUrl || 'https://via.placeholder.com/200?text=Logo'}
                    alt={listing.logoAltText || listing.businessName}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                <CheckCircle2 size={24} />
              </div>
            </motion.div>

            {/* Info Block */}
            <div className="flex-1 text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  {listing.categories?.map(cat => (
                    <span key={cat.id} className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/20">
                      {cat.name}
                    </span>
                  ))}
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-bold">
                    <Clock size={14} className="text-orange-400" /> Open Now
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-sm">
                  {listing.businessName}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-white/80 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-[#f58220]" />
                    {listing.location?.city}, {listing.location?.postcode}
                  </div>
                  {listing.website && (
                    <a href={listing.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                      <Globe size={18} className="text-[#f58220]" />
                      Official Website
                    </a>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Actions Block */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex items-center gap-3 pb-2"
            >
              <Button 
                size="lg" 
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="h-14 px-8 bg-[#f58220] hover:bg-[#e67a1d] text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/20 flex items-center gap-2"
              >
                <MessageSquare size={20} /> Send Message
              </Button>
              <Button variant="secondary" size="icon" className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-red-500 transition-all">
                <Heart size={24} />
              </Button>
              <Button variant="secondary" size="icon" className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-gray-100 hover:text-black transition-all">
                <Share2 size={24} />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}