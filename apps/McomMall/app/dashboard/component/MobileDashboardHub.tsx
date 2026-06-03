'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShoppingBag, 
  Briefcase, 
  Users, 
  Wallet, 
  History, 
  Settings, 
  MessageSquare,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  MapPin
} from 'lucide-react';

const SLIDES = [
  {
    title: "Grow Your Business",
    description: "List your products and services to reach thousands of customers daily.",
    icon: <Zap className="w-12 h-12 text-orange-500" />,
    bg: "bg-orange-50"
  },
  {
    title: "Global Marketplace",
    description: "Trade, barter, and sell in a truly connected global ecosystem.",
    icon: <Globe className="w-12 h-12 text-blue-500" />,
    bg: "bg-blue-50"
  },
  {
    title: "Verified Community",
    description: "Connect with verified businesses and build trusted partnerships.",
    icon: <ShieldCheck className="w-12 h-12 text-green-500" />,
    bg: "bg-green-50"
  }
];

const SHORTCUTS = [
  { title: "LocalMall", icon: MapPin, href: "/dashboard/localmall", color: "text-amber-600", bg: "bg-amber-100" },
  { title: "Listings", icon: PlusCircle, href: "/dashboard/my-listings", color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Store", icon: ShoppingBag, href: "/dashboard/store", color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Services", icon: Briefcase, href: "/dashboard/services", color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Wallet", icon: Wallet, href: "/dashboard/wallet", color: "text-green-600", bg: "bg-green-100" },
  { title: "Messages", icon: MessageSquare, href: "/dashboard/messages", color: "text-pink-600", bg: "bg-pink-100" },
  { title: "History", icon: History, href: "/dashboard/history/my-vouchers", color: "text-slate-600", bg: "bg-slate-100" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings", color: "text-gray-600", bg: "bg-gray-100" },
];

export const MobileDashboardHub: FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col space-y-6 pb-24">
      {/* Banner Slideshow */}
      <div className="relative h-48 w-full overflow-hidden rounded-3xl shadow-sm border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 p-6 flex items-center justify-between ${SLIDES[currentSlide].bg}`}
          >
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold text-gray-800 leading-tight">
                {SLIDES[currentSlide].title}
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-[180px]">
                {SLIDES[currentSlide].description}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4 transform scale-110">
              {SLIDES[currentSlide].icon}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-6 flex space-x-1.5">
          {SLIDES.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Shortcuts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-gray-800 tracking-tight">Quick Access</h3>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Everything you need</span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {SHORTCUTS.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className={`w-full aspect-square rounded-2xl ${item.bg} flex items-center justify-center transition-transform active:scale-90 group-hover:shadow-md`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 text-center truncate w-full">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Promotional Card */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-xl shadow-slate-200">
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest">Premium Access</h4>
            <p className="text-lg font-bold leading-tight">Unlock the full potential of McomMall.</p>
          </div>
          <Link href="/dashboard/my-subscription">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
              Upgrade Now
            </button>
          </Link>
        </div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-12 -mb-12 blur-2xl" />
      </div>
    </div>
  );
};
