'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeoContext } from '@/context/GeoContext';
import dynamic from 'next/dynamic';
import { LocalCampaignsPanel } from '@/components/campaigns/LocalCampaignsPanel';
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
  MapPin,
  X
} from 'lucide-react';

const NearbyDiscovery = dynamic(() => import('@/components/marketplace/NearbyDiscovery'), { ssr: false });

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

// Mobile Dashboard Hub Component with dynamic proximity slides
export const MobileDashboardHub: FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isCampaignPanelOpen, setIsCampaignPanelOpen] = useState(false);

  const geoContext = useGeoContext();
  const nearestHighStreet = geoContext?.nearestHighStreet;
  const distanceToHighStreet = geoContext?.distanceToHighStreet;
  const badge = geoContext?.badge;

  const storedTier = typeof window !== 'undefined' ? localStorage.getItem('businessProximityTier') : null;
  const storedDistance = typeof window !== 'undefined' ? localStorage.getItem('businessProximityDistance') : null;

  const currentTier = badge ? {
    'HIGH_STREET': 'high_street',
    'HYPERLOCAL': 'hyper_local',
    'NEARBY': 'nearby',
    'REMOTE': 'national'
  }[badge] : storedTier;

  const currentDistance = distanceToHighStreet !== undefined && distanceToHighStreet !== null
    ? distanceToHighStreet
    : storedDistance ? parseFloat(storedDistance) : null;

  const highStreetName = nearestHighStreet?.name || "Peckham High Street";
  const distanceVal = currentDistance !== null
    ? `${currentDistance.toFixed(1)} miles`
    : "2.4 miles";

  const tierToShow = currentTier || 'high_street';

  // Dynamic First Slide details based on proximity badge
  let firstSlideTitle = `Hyperlocal Ecosystem: ${highStreetName}`;
  let firstSlideDesc = `You are ${distanceVal} from the high street. Activate radius targeting to reach nearby customers.`;
  let firstSlideBg = "bg-amber-50";
  let firstSlideIcon = <MapPin className="w-12 h-12 text-amber-500" />;
  let firstSlideButtons = true;

  if (tierToShow === 'high_street') {
    firstSlideTitle = `Welcome to ${highStreetName}`;
    firstSlideDesc = `You are a Premium High Street business. Access exclusive local expos and featured mall visibility.`;
    firstSlideBg = "bg-amber-50";
    firstSlideIcon = <MapPin className="w-12 h-12 text-amber-500" />;
    firstSlideButtons = true;
  } else if (tierToShow === 'hyper_local') {
    firstSlideTitle = `Hyperlocal Ecosystem: ${highStreetName}`;
    firstSlideDesc = `You are ${distanceVal} from the high street. Activate radius targeting to reach nearby customers.`;
    firstSlideBg = "bg-blue-50";
    firstSlideIcon = <MapPin className="w-12 h-12 text-blue-500" />;
    firstSlideButtons = true;
  } else if (tierToShow === 'nearby') {
    firstSlideTitle = `Nearby Region: ${highStreetName}`;
    firstSlideDesc = `Participate in broader regional campaigns and extend your commerce reach.`;
    firstSlideBg = "bg-emerald-50";
    firstSlideIcon = <MapPin className="w-12 h-12 text-emerald-500" />;
    firstSlideButtons = true;
  } else if (tierToShow === 'national') {
    firstSlideTitle = `Community Member`;
    firstSlideDesc = `You are ${distanceVal} from the nearest high street. Connect with the broader platform features.`;
    firstSlideBg = "bg-gray-50";
    firstSlideIcon = <Globe className="w-12 h-12 text-gray-500" />;
    firstSlideButtons = false;
  }

  const slides = [
    {
      title: firstSlideTitle,
      description: firstSlideDesc,
      icon: firstSlideIcon,
      bg: firstSlideBg,
      hasButtons: firstSlideButtons
    },
    {
      title: "Grow Your Business",
      description: "List your products and services to reach thousands of customers daily.",
      icon: <Zap className="w-12 h-12 text-orange-500" />,
      bg: "bg-orange-50",
      hasButtons: false
    },
    {
      title: "Global Marketplace",
      description: "Trade, barter, and sell in a truly connected global ecosystem.",
      icon: <Globe className="w-12 h-12 text-blue-500" />,
      bg: "bg-blue-50",
      hasButtons: false
    },
    {
      title: "Verified Community",
      description: "Connect with verified businesses and build trusted partnerships.",
      icon: <ShieldCheck className="w-12 h-12 text-green-500" />,
      bg: "bg-green-50",
      hasButtons: false
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
            className={`absolute inset-0 p-6 flex items-center justify-between ${slides[currentSlide].bg}`}
          >
            <div className="flex-1 space-y-1.5 min-w-0">
              <h2 className="text-lg font-bold text-gray-800 leading-tight break-words">
                {slides[currentSlide].title}
              </h2>
              <p className="text-xs text-gray-600 leading-snug break-words">
                {slides[currentSlide].description}
              </p>
              
              {slides[currentSlide].hasButtons && (
                <div className="flex gap-2 mt-2.5">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMapModalOpen(true);
                    }}
                    className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-xl text-[9px] font-bold transition-colors shadow-sm shrink-0"
                  >
                    <MapPin className="w-2.5 h-2.5" /> View Radius Map
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCampaignPanelOpen(true);
                    }}
                    className="flex items-center gap-1 bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 px-2.5 py-1 rounded-xl text-[9px] font-bold transition-colors shadow-sm shrink-0"
                  >
                    <Users className="w-2.5 h-2.5" /> Community Rewards
                  </button>
                </div>
              )}
            </div>
            <div className="flex-shrink-0 ml-4 transform scale-110">
              {slides[currentSlide].icon}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-6 flex space-x-1.5">
          {slides.map((_, i) => (
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
      {/* Modals & Panels */}
      <LocalCampaignsPanel 
        isOpen={isCampaignPanelOpen} 
        onOpenChange={setIsCampaignPanelOpen} 
      />

      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{highStreetName} Ecosystem</h3>
                <p className="text-sm text-gray-500">Interactive geographic clustering map</p>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative w-full">
              <NearbyDiscovery />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
