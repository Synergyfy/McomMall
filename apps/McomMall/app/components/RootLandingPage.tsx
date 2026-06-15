'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Store, Flower2, Utensils, Coffee, Scissors, Wheat, Play, X, Sparkles, MapPin, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    url: '/images/slide_boutique.png',
    alt: 'Local Boutique Shopping'
  },
  {
    url: '/images/slide_cafe.png',
    alt: 'Local Cafe & Brews'
  },
  {
    url: '/images/slide_shopping.png',
    alt: 'Shopping Local Store'
  }
];

export default function RootLandingPage() {
  const router = useRouter();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Smooth scroll to selection section
  const scrollToSelection = () => {
    const el = document.getElementById('join-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Minimal Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 md:px-12 md:py-6 relative z-10 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tight text-slate-800">MCOM</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pb-12 w-full max-w-7xl mx-auto px-0 sm:px-6 md:px-8">
        
        {/* Split Hero Area (Mobile stacked, Desktop side-by-side) */}
        <div className="w-full relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16 mt-0 md:mt-12 lg:mt-16 mb-10 md:mb-20">
          
          {/* Desktop Text Side (Hidden on Mobile) */}
          <div className="hidden md:flex flex-col items-start w-full md:w-1/2 lg:w-5/12 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                <MapPin size={14} className="text-orange-500" />
                <span>Geographic Commerce Engine</span>
              </div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6 drop-shadow-sm">
                Your Local Mall,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Reimagined</span>
              </h1>
              <p className="text-slate-600 font-medium text-lg lg:text-xl leading-relaxed mb-8 max-w-lg">
                The ultimate proximity-driven ecosystem where everyone wins. Discover local shops, earn rewards, and grow your high street.
              </p>
              <button 
                onClick={scrollToSelection}
                className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-base hover:bg-orange-500 transition-all duration-300 shadow-xl shadow-slate-900/20 active:scale-95"
              >
                Join the Platform
                <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Image Area - Full width on mobile, half width on desktop */}
          <div className="w-full md:w-1/2 lg:w-7/12 relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-b-[2.5rem] md:rounded-3xl shadow-2xl md:shadow-slate-200/50 order-first md:order-last bg-slate-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={SLIDES[currentSlide].url}
                  alt={SLIDES[currentSlide].alt}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            {/* Mobile Gradient & Text - Hidden on md+ */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent md:hidden" />
            
            <div className="absolute bottom-0 left-0 w-full px-6 text-center pb-10 flex flex-col items-center md:hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-400/30 bg-orange-500/20 text-orange-300 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md mb-4">
                  <MapPin size={12} className="text-orange-400" />
                  <span>Geographic Commerce Engine</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-[1.1] mb-3 drop-shadow-sm">
                  Your Local Mall,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Reimagined</span>
                </h1>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Search & Login Section */}
        <div className="w-full px-6 pb-8 max-w-lg mx-auto text-center z-10">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-4 shadow-lg shadow-slate-100/50 rounded-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search local shops, deals or events..."
              className="w-full pl-12 pr-28 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-800 font-medium text-xs md:text-sm transition-all"
            />
            <div className="absolute left-4 text-slate-400">
              <Search size={18} />
            </div>
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-[10px] sm:text-xs shadow-md transition-all active:scale-95"
            >
              Search
            </button>
          </form>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/getstarted')}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/10 transition-all active:scale-95"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/signin')}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-slate-900/10 transition-all active:scale-95"
            >
              Login
            </button>
          </div>
        </div>

        {/* Explain MCOM Section */}
        <div className="w-full px-6 pt-10 md:pt-10 pb-6 md:pb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4 md:space-y-6 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2 md:gap-3">
              What is <span className="text-orange-500">MCOM?</span>
              <Sparkles size={24} className="text-orange-400 md:w-8 md:h-8" />
            </h2>
            <p className="text-slate-600 font-medium text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed md:leading-relaxed">
              MCOM is the ultimate geographic commerce intelligence platform. We're digitizing the high street, connecting vibrant local businesses with hyper-local communities, and building a proximity-driven ecosystem where everyone wins.
            </p>
          </motion.div>
        </div>

        {/* Video Preview Modal Trigger */}
        <div className="w-full px-6 pb-12 md:pb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full max-w-4xl mx-auto h-48 sm:h-64 md:h-[400px] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl shadow-slate-200/60"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <Image
              src="/images/root_landing_hero.png"
              alt="Video Thumbnail"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-300 mb-2 md:mb-4">
                <Play size={28} className="ml-1 md:w-8 md:h-8 fill-white" />
              </div>
              <span className="text-white font-bold text-xs md:text-sm tracking-widest uppercase drop-shadow-md">Watch Explainer</span>
            </div>
          </motion.div>
        </div>

        {/* Identity Selector */}
        <div id="join-section" className="w-full px-6 max-w-5xl mx-auto scroll-mt-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-orange-500/10 rounded-full blur-[50px] md:blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-slate-900/5 rounded-full blur-[50px] md:blur-[80px] pointer-events-none" />
            
            <h2 className="text-xl sm:text-3xl font-black text-center text-slate-800 mb-8 md:mb-12 tracking-tight relative z-10">
              Who are you joining as?
            </h2>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 relative z-10">
              {/* Customer Option */}
              <Link href="/customer" className="group flex-1">
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-colors rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row md:flex-col lg:flex-row items-start md:items-center lg:items-start gap-4 md:gap-6 shadow-lg shadow-orange-500/20 border border-orange-400/50 h-full"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-white">
                    <ShoppingBag size={28} className="md:w-8 md:h-8" />
                  </div>
                  <div className="text-left md:text-center lg:text-left text-white flex-1">
                    <h3 className="font-extrabold text-xl md:text-2xl mb-1 md:mb-2">I'm a Customer</h3>
                    <p className="text-xs sm:text-sm md:text-base font-medium text-orange-50 leading-relaxed">
                      Discover local shops, earn rewards, and explore your high street like never before.
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Business Option */}
              <Link href="/business" className="group flex-1">
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black transition-colors rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row md:flex-col lg:flex-row items-start md:items-center lg:items-start gap-4 md:gap-6 shadow-lg shadow-slate-900/20 border border-slate-700/50 h-full"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-white">
                    <Store size={28} className="md:w-8 md:h-8" />
                  </div>
                  <div className="text-left md:text-center lg:text-left text-white flex-1">
                    <h3 className="font-extrabold text-xl md:text-2xl mb-1 md:mb-2">I'm a Business</h3>
                    <p className="text-xs sm:text-sm md:text-base font-medium text-slate-300 leading-relaxed">
                      Open your storefront, run campaigns, and grow with your local community.
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Trusted By Strip */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full px-6 mt-16 md:mt-24 mb-8"
        >
          <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-6 md:mb-10">
            Trusted by the best local brands
          </p>
          <div className="flex justify-center flex-wrap items-center gap-8 md:gap-16 lg:gap-24 px-4 opacity-50 text-slate-600 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Minimal icons representing categories */}
            <div className="flex flex-col items-center gap-2 md:gap-3"><Flower2 size={24} className="md:w-10 md:h-10" /><span className="text-[9px] md:text-xs font-bold tracking-wider">BLOOME</span></div>
            <div className="flex flex-col items-center gap-2 md:gap-3"><Utensils size={24} className="md:w-10 md:h-10" /><span className="text-[9px] md:text-xs font-bold tracking-wider">TASTE</span></div>
            <div className="flex flex-col items-center gap-2 md:gap-3"><Coffee size={24} className="md:w-10 md:h-10" /><span className="text-[9px] md:text-xs font-bold tracking-wider">BREW</span></div>
            <div className="flex flex-col items-center gap-2 md:gap-3"><Scissors size={24} className="md:w-10 md:h-10" /><span className="text-[9px] md:text-xs font-bold tracking-wider">TRIM</span></div>
            <div className="flex flex-col items-center gap-2 md:gap-3"><Wheat size={24} className="md:w-10 md:h-10" /><span className="text-[9px] md:text-xs font-bold tracking-wider">GROCER</span></div>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full bg-slate-50 py-8 md:py-12 border-t border-slate-100 flex flex-col items-center justify-center gap-4 md:gap-6 text-xs md:text-sm font-bold text-slate-500">
        <div className="flex gap-4 sm:gap-6 md:gap-8">
          <Link href="/about" className="hover:text-orange-500 transition-colors">About</Link>
          <span className="text-slate-300">•</span>
          <Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link>
          <span className="text-slate-300">•</span>
          <Link href="/terms" className="hover:text-orange-500 transition-colors">Terms</Link>
          <span className="text-slate-300">•</span>
          <Link href="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
        </div>
        <p className="text-slate-400 font-semibold text-[11px] md:text-xs tracking-wide">© 2026 MCOM. All rights reserved.</p>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-video"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 md:top-6 right-4 md:right-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-black/50 hover:bg-orange-500 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/20"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>
              
              {/* YouTube iFrame (Placeholder) */}
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="MCOM Explainer Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
