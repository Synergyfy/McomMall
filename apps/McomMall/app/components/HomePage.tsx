'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Search, MapPin, ArrowRight, Heart, ArrowUp, Zap, Globe, ShieldCheck, Star, Users, 
  CreditCard, TrendingUp, Activity, Sparkles, Layers, Lock, RefreshCw, Play, BarChart2, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HeroImage from '@/public/hero.jpg';
import Image from 'next/image';
import { useGetRecentListings } from '@/service/listings/hook';
import { useGetCategories } from '@/service/taxonomy/hook';

// Dynamically import components using absolute path aliases
const McomFeatureSection = dynamic(() => import('@/app/homepage/components/McomFeatureSection').then(mod => mod.McomFeatureSection));
const SeasonalMarketingSection = dynamic(() => import('@/app/homepage/components/SeasonalMarketingSection').then(mod => mod.SeasonalMarketingSection));
const McomMallBrandsSection = dynamic(() => import('@/app/homepage/components/McomMallBrandsSection').then(mod => mod.McomMallBrandsSection));
const BusinessCategoriesSection = dynamic(() => import('@/app/homepage/components/BusinessCategoriesSection').then(mod => mod.BusinessCategoriesSection));
const McomEgiftCard = dynamic(() => import('@/app/homepage/components/McomEgiftCard').then(mod => mod.McomEgiftCard));
const VirtualCardCarousel = dynamic(() => import('@/app/homepage/components/VirtualCardCarousel'));
const HowItWorks = dynamic(() => import('@/app/homepage/components/HowItWorks'));
const AuditSection = dynamic(() => import('@/app/homepage/components/AuditSection').then(mod => mod.AuditSection));
const VCardFeaturesSection = dynamic(() => import('@/app/homepage/components/VCardFeatures'));
const McomSolutions = dynamic(() => import('@/app/homepage/components/McomSolutions'));
const LoyaltyProgramSection = dynamic(() => import('@/app/homepage/components/LoyaltyProgramSection'));
const Footer = dynamic(() => import('@/components/Footer'));

// --- Helper Components ---
const ScrollAnimatedSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 25 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Removed consumer blog posts

export default function HomePage() {
  const [currentCopyIndex, setCurrentCopyIndex] = useState(0);
  const solutionsUrl = process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'http://localhost:3000';
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searchError, setSearchError] = useState('');
  
  // Interactive Simulator States
  const [simPlaygroundTab, setSimPlaygroundTab] = useState('cashback');
  const [simSpend, setSimSpend] = useState(150);
  const [simCashbackRate, setSimCashbackRate] = useState(10);
  const [simCardTheme, setSimCardTheme] = useState('orange');
  const [simAuditCapacity, setSimAuditCapacity] = useState(65);
  
  const router = useRouter();
  const { data: recentListings, isLoading, isError } = useGetRecentListings(15);
  const { data: categories } = useGetCategories();

  const heroCopies = [
    {
      titleTop: "Discover the",
      titleHighlight: "Premium Pulse",
      titleBottom: "Of Your City",
      description: "Connect with the finest local businesses, products, and services. Empower your enterprise with seamless stock audits, loyalty engine optimization, and custom virtual card issuing."
    },
    {
      titleTop: "Elevate Your",
      titleHighlight: "Business Reach",
      titleBottom: "Globally",
      description: "Scale your local enterprise to global markets with our advanced multi-currency B2B exchange and dynamic customer retention networks."
    },
    {
      titleTop: "Unlock Instant",
      titleHighlight: "Cashback Rewards",
      titleBottom: "Everywhere",
      description: "Earn significant returns on daily operational spend. Reinvest B2B tokens into high-yield localized campaigns and grow exponentially."
    }
  ];

  const heroCardsData = [
    [
      {
        name: "Gourmet Steakhouse",
        location: "Mayfair, London",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop",
        type: "Steakhouse",
        reward: "15% Cashback",
        rating: "4.8"
      },
      {
        name: "The Artisan Coffee Club",
        location: "Chelsea, London",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=400&auto=format&fit=crop",
        type: "Cafe & Deli",
        reward: "10% Instant Reward",
        rating: "4.9"
      }
    ],
    [
      {
        name: "The Artisan Coffee Club",
        location: "Chelsea, London",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=400&auto=format&fit=crop",
        type: "Cafe & Deli",
        reward: "10% Instant Reward",
        rating: "4.9"
      },
      {
        name: "Luxe Boutique",
        location: "Soho, London",
        image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=400&auto=format&fit=crop",
        type: "Fashion",
        reward: "20% Cashback",
        rating: "5.0"
      }
    ],
    [
      {
        name: "Luxe Boutique",
        location: "Soho, London",
        image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=400&auto=format&fit=crop",
        type: "Fashion",
        reward: "20% Cashback",
        rating: "5.0"
      },
      {
        name: "Gourmet Steakhouse",
        location: "Mayfair, London",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=300&auto=format&fit=crop",
        type: "Steakhouse",
        reward: "15% Cashback",
        rating: "4.8"
      }
    ]
  ];

  // Rotate hero copy
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCopyIndex(
        prevIndex => (prevIndex + 1) % heroCopies.length
      );
    }, 6000);
    return () => clearInterval(timer);
  }, [heroCopies.length]);

  // Effect for back to top button visibility
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showBackToTop && window.pageYOffset > 400) {
        setShowBackToTop(true);
      } else if (showBackToTop && window.pageYOffset <= 400) {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showBackToTop]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter something to search for.');
      return;
    }
    setSearchError('');
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="bg-[#fafafa] text-slate-800 font-sans relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
      <main>
        
        {/* --- PREMIUM CREATIVE HERO WITH BACKGROUND SLIDES --- */}
        <section className="relative min-h-[92vh] flex items-center justify-center w-full overflow-hidden pt-24 pb-28 md:pb-32">
          
          {/* Static high-end cinematic background image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={HeroImage}
              fill
              className="object-cover"
              priority
              alt="McomMall cinematic backdrop"
            />
            {/* Overlay with a sophisticated dark-to-light gradient ensuring perfect text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-8 text-left text-white mt-12 lg:mt-0">
                
                {/* Glowing Notification Badge in Brand Color */}
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-450 text-xs font-bold tracking-wide backdrop-blur-md hover:border-orange-500/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                    <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                    <span>Mcom Terminal V3 is officially live</span>
                    <ArrowRight size={13} className="text-orange-400" />
                  </div>
                </motion.div>

                {/* Creative Main Title Slideshow */}
                <div className="min-h-[220px] md:min-h-[260px] lg:min-h-[280px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCopyIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.7 }}
                      className="space-y-4"
                    >
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
                        {heroCopies[currentCopyIndex].titleTop} <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">{heroCopies[currentCopyIndex].titleHighlight}</span> <br />
                        {heroCopies[currentCopyIndex].titleBottom}
                      </h1>
                      <p className="text-sm md:text-base lg:text-lg text-slate-200 max-w-xl font-normal leading-relaxed">
                        {heroCopies[currentCopyIndex].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Business CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="w-full max-w-2xl"
                >
                  <a href={`${solutionsUrl}/getstarted/business?source=mcommall`} className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/25 transition-all active:scale-95 text-sm md:text-base uppercase tracking-wider">
                    <span>Create Merchant Account</span>
                    <ArrowRight size={18} />
                  </a>
                </motion.div>

                {/* Sleek Trust Badges */}
                <motion.div 
                  className="flex flex-wrap items-center gap-6 sm:gap-8 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-orange-400" />
                    <span className="font-bold text-[10px] sm:text-xs tracking-widest text-slate-200">10K+ PARTNERS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-orange-400" />
                    <span className="font-bold text-[10px] sm:text-xs tracking-widest text-slate-200">GLOBAL STACKS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-orange-400" />
                    <span className="font-bold text-[10px] sm:text-xs tracking-widest text-slate-200">VERIFIED COMPLIANCE</span>
                  </div>
                </motion.div>

              </div>

              {/* Hero Right Content: Premium Creative Stack of Real Listing Cards */}
              <div className="lg:col-span-5 w-full relative flex justify-center mt-10 lg:mt-0 px-4 sm:px-8 lg:px-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-full max-w-[380px] h-[340px] md:h-[400px] flex items-center justify-center"
                >
                  {/* Glowing background halo */}
                  <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentCopyIndex}
                      initial={{ opacity: 0, x: 100, rotate: 10, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, rotate: -10, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      {/* Background Card */}
                      <div className="absolute w-[85%] h-[210px] md:h-[230px] bg-white border border-slate-200/50 rounded-3xl p-4 shadow-xl transform -rotate-6 -translate-y-8 -translate-x-3 opacity-60 hover:opacity-100 transition-all duration-300 pointer-events-auto">
                        <div className="relative h-24 md:h-28 w-full rounded-2xl overflow-hidden mb-3">
                          <Image 
                            src={heroCardsData[currentCopyIndex][0].image}
                            fill
                            className="object-cover"
                            alt={heroCardsData[currentCopyIndex][0].name}
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/85 text-white text-[8px] font-black uppercase tracking-wider">{heroCardsData[currentCopyIndex][0].type}</span>
                        </div>
                        <div className="space-y-1 text-left">
                          <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">{heroCardsData[currentCopyIndex][0].name}</h4>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-semibold">{heroCardsData[currentCopyIndex][0].location}</span>
                            <span className="font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">{heroCardsData[currentCopyIndex][0].reward}</span>
                          </div>
                        </div>
                      </div>

                      {/* Foreground Card */}
                      <div className="absolute w-[92%] h-[250px] md:h-[270px] bg-white border border-slate-250/70 rounded-3xl p-4 md:p-5 shadow-2xl transform rotate-3 translate-y-4 translate-x-3 hover:rotate-0 transition-all duration-350 z-20 pointer-events-auto">
                        <div className="relative h-32 md:h-36 w-full rounded-2xl overflow-hidden mb-3 md:mb-4">
                          <Image 
                            src={heroCardsData[currentCopyIndex][1].image}
                            fill
                            className="object-cover"
                            alt={heroCardsData[currentCopyIndex][1].name}
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-orange-500 text-white text-[8px] font-black uppercase tracking-wider shadow-md">{heroCardsData[currentCopyIndex][1].type}</span>
                          <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/85 text-orange-400 text-[9px] font-black uppercase tracking-wider shadow-md">{heroCardsData[currentCopyIndex][1].reward}</span>
                        </div>
                        <div className="space-y-1 md:space-y-1.5 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm md:text-base">{heroCardsData[currentCopyIndex][1].name}</h4>
                              <span className="text-[10px] md:text-[11px] text-slate-400 font-bold block">{heroCardsData[currentCopyIndex][1].location}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                              <Star size={11} className="fill-orange-500 text-orange-500" />
                              <span className="text-[9px] font-black text-slate-700">{heroCardsData[currentCopyIndex][1].rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Card 3: Floating Wallet Balance Overlay */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -bottom-6 -left-3 md:-left-6 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xl z-30 flex items-center gap-3 max-w-[190px] pointer-events-none"
                  >
                    <div className="w-8.5 h-8.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-650 shrink-0">
                      <Zap size={18} className="fill-orange-500 text-orange-500" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Cash Balance</span>
                      <span className="text-sm font-black text-slate-900 font-mono">£418.50</span>
                      <span className="text-[7.5px] font-bold text-emerald-500 block">✓ eGift Card Linked</span>
                    </div>
                  </motion.div>

                  {/* Card 4: Floating Verification Overlay */}
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}
                    className="absolute -top-10 -right-3 md:-right-6 bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xl z-30 flex items-center gap-2.5 max-w-[190px] pointer-events-none"
                  >
                    <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                      <Star size={12} className="fill-orange-500 text-orange-500" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-800 line-clamp-1">"Excellent organic blends!"</p>
                      <span className="text-[7px] font-bold text-slate-400 uppercase block">Chelsea Customer</span>
                    </div>
                  </motion.div>

                </motion.div>
              </div>

            </div>
          </div>

          {/* Elegant Wave transition at bottom to match the clean white content background */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[35px] md:h-[50px] fill-white">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,105.3,117.82,108,176.62,101.52,235.43,95,294.24,83.4,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>

        {/* --- HOW IT WORKS PIPELINE --- */}
        <HowItWorks />

        {/* --- INTERACTIVE PRODUCT PLAYGROUND (Brand Identity White & Orange theme) --- */}
        <ScrollAnimatedSection className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center space-y-3 mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-200 bg-orange-500/10 text-orange-650 text-xs font-bold tracking-wide">
                <Sparkles size={12} className="text-orange-500" />
                <span>INTERACTIVE PLAYGROUND</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                Simulate Your <span className="text-orange-500">MCOM Engine</span>
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Experience our core technologies live. Drag the sliders and toggle brand palettes below to see the computations update instantly.
              </p>
            </div>

            {/* Playground Box Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Tab Selector: Horizontal scrollable on mobile, stacks on desktop */}
              <div className="lg:col-span-4 flex flex-row lg:flex-col overflow-x-auto pb-4 lg:pb-0 gap-3 justify-start lg:justify-center hide-scrollbar">
                
                {/* Tab Button 1 */}
                <button
                  onClick={() => setSimPlaygroundTab('cashback')}
                  className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 shrink-0 min-w-[240px] lg:min-w-0 group cursor-pointer ${
                    simPlaygroundTab === 'cashback'
                      ? 'border-orange-500 bg-white shadow-xl shadow-orange-500/5 text-slate-900'
                      : 'border-slate-200 bg-white/60 hover:border-slate-300 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl border transition-all shrink-0 ${
                    simPlaygroundTab === 'cashback' ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:text-slate-650'
                  }`}>
                    <TrendingUp size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm">Cashback & Loyalty Engine</h3>
                    <p className="text-[10px] text-slate-400 leading-snug">Calculate incentives and merchant rewards.</p>
                  </div>
                </button>

                {/* Tab Button 2 */}
                <button
                  onClick={() => setSimPlaygroundTab('egift')}
                  className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 shrink-0 min-w-[240px] lg:min-w-0 group cursor-pointer ${
                    simPlaygroundTab === 'egift'
                      ? 'border-orange-500 bg-white shadow-xl shadow-orange-500/5 text-slate-900'
                      : 'border-slate-200 bg-white/60 hover:border-slate-300 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl border transition-all shrink-0 ${
                    simPlaygroundTab === 'egift' ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:text-slate-650'
                  }`}>
                    <Layers size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm">Branded eGift Cards</h3>
                    <p className="text-[10px] text-slate-400 leading-snug">Design dynamic customizable card layouts.</p>
                  </div>
                </button>

                {/* Tab Button 3 */}
                <button
                  onClick={() => setSimPlaygroundTab('vcard')}
                  className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 shrink-0 min-w-[240px] lg:min-w-0 group cursor-pointer ${
                    simPlaygroundTab === 'vcard'
                      ? 'border-orange-500 bg-white shadow-xl shadow-orange-500/5 text-slate-900'
                      : 'border-slate-200 bg-white/60 hover:border-slate-300 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl border transition-all shrink-0 ${
                    simPlaygroundTab === 'vcard' ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:text-slate-650'
                  }`}>
                    <CreditCard size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm">Virtual Business Cards</h3>
                    <p className="text-[10px] text-slate-400 leading-snug">Verify dynamic VCards and balances.</p>
                  </div>
                </button>

                {/* Tab Button 4 */}
                <button
                  onClick={() => setSimPlaygroundTab('audit')}
                  className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 shrink-0 min-w-[240px] lg:min-w-0 group cursor-pointer ${
                    simPlaygroundTab === 'audit'
                      ? 'border-orange-500 bg-white shadow-xl shadow-orange-500/5 text-slate-900'
                      : 'border-slate-200 bg-white/60 hover:border-slate-300 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl border transition-all shrink-0 ${
                    simPlaygroundTab === 'audit' ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' : 'border-slate-200 bg-slate-50 text-slate-400 group-hover:text-slate-650'
                  }`}>
                    <BarChart2 size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-sm">Interactive Auditing</h3>
                    <p className="text-[10px] text-slate-400 leading-snug">Simulate workflow capacity metrics.</p>
                  </div>
                </button>

              </div>

              {/* Panel Render Shell (Responsive padding) */}
              <div className="lg:col-span-8 border border-slate-200/80 bg-white p-5 sm:p-7.5 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
                
                {simPlaygroundTab === 'cashback' && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />}
                {simPlaygroundTab === 'egift' && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />}
                {simPlaygroundTab === 'vcard' && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />}
                {simPlaygroundTab === 'audit' && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />}

                <AnimatePresence mode="wait">
                  
                  {/* CASHBACK PANEL */}
                  {simPlaygroundTab === 'cashback' && (
                    <motion.div
                      key="cashback-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 flex-grow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                              <TrendingUp className="text-orange-500" size={18} />
                              Loyalty & Cashback Calculator
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-normal">Drag below to calculate cashback payouts and corresponding B2B exchange ratios.</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full border border-orange-200 bg-orange-500/5 text-orange-655 font-mono text-[9px] font-bold uppercase shrink-0">ACTIVE ENGINE</span>
                        </div>

                        {/* Interactive Sliders */}
                        <div className="space-y-4 pt-3">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-500">Transaction Purchase Volume</span>
                              <span className="text-orange-500 font-mono">£{simSpend}</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="1000"
                              step="10"
                              value={simSpend}
                              onChange={(e) => setSimSpend(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-500">Target Cashback Rate</span>
                              <span className="text-orange-500 font-mono">{simCashbackRate}%</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="30"
                              value={simCashbackRate}
                              onChange={(e) => setSimCashbackRate(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Calculations Visual Output Card (Responsive stack) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 mt-6 text-left">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Customer Receives</span>
                          <span className="text-xl md:text-2xl font-black text-orange-500 font-mono">£{(simSpend * (simCashbackRate / 100)).toFixed(2)}</span>
                        </div>
                        <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">B2B Exchange Tokens</span>
                          <span className="text-xl md:text-2xl font-black text-slate-800 font-mono">{(simSpend * 1.5).toFixed(0)}</span>
                        </div>
                        <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Platform Fee (2%)</span>
                          <span className="text-xl md:text-2xl font-black text-slate-600 font-mono">£{(simSpend * 0.02).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* BRANDED EGIFT PANEL */}
                  {simPlaygroundTab === 'egift' && (
                    <motion.div
                      key="egift-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5 flex-grow flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                          <Layers className="text-orange-500" size={18} />
                          eGift Card Theme Customizer
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal">Test brand typography templates and live 3D gift panels under primary palette parameters.</p>
                      </div>

                      {/* Flex Card Design Block */}
                      <div className="flex flex-col sm:flex-row items-center gap-8 py-3">
                        
                        {/* 3D Glass Card Simulator */}
                        <div className="relative group perspective-1000">
                          <div className={`w-60 h-36 rounded-2xl p-4.5 border shadow-xl relative overflow-hidden transition-all duration-500 transform group-hover:rotate-y-12 text-white ${
                            simCardTheme === 'orange' ? 'bg-gradient-to-tr from-orange-500 to-amber-600 border-orange-400/35' :
                            simCardTheme === 'charcoal' ? 'bg-gradient-to-tr from-slate-800 to-slate-950 border-slate-700/35' :
                            simCardTheme === 'rose' ? 'bg-gradient-to-tr from-rose-500 to-rose-700 border-rose-400/35' :
                            'bg-gradient-to-tr from-emerald-500 to-emerald-700 border-emerald-400/35'
                          }`}>
                            <div className="flex justify-between items-start mb-6">
                              <div className="w-9 h-6.5 rounded bg-white/20 flex items-center justify-center font-bold text-[8px] font-mono tracking-widest text-white">MCOM</div>
                              <Sparkles size={14} className="text-white/80" />
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[9px] text-white/70 font-semibold uppercase tracking-wider block">eGift Balance</span>
                              <div className="flex justify-between items-end">
                                <span className="text-lg font-bold font-mono">£100.00</span>
                                <span className="text-[8px] font-mono tracking-widest text-white/70">MCOM COMPLIANT</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Theme Selectors */}
                        <div className="flex-1 space-y-3 text-left w-full">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Toggle Palette Scheme</span>
                          <div className="grid grid-cols-2 gap-2">
                            
                            <button
                              onClick={() => setSimCardTheme('orange')}
                              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                simCardTheme === 'orange' ? 'border-orange-500 bg-orange-500/10 text-orange-650' : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-500'
                              }`}
                            >
                              Brand Orange
                            </button>

                            <button
                              onClick={() => setSimCardTheme('charcoal')}
                              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                simCardTheme === 'charcoal' ? 'border-slate-800 bg-slate-800/10 text-slate-800' : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-500'
                              }`}
                            >
                              Sleek Charcoal
                            </button>

                            <button
                              onClick={() => setSimCardTheme('rose')}
                              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                simCardTheme === 'rose' ? 'border-rose-500 bg-rose-500/10 text-rose-650' : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-500'
                              }`}
                            >
                              Ember Rose
                            </button>

                            <button
                              onClick={() => setSimCardTheme('emerald')}
                              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                simCardTheme === 'emerald' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-slate-200 bg-slate-50 hover:border-slate-350 text-slate-500'
                              }`}
                            >
                              Forest Emerald
                            </button>

                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* VIRTUAL BUSINESS CARDS PANEL */}
                  {simPlaygroundTab === 'vcard' && (
                    <motion.div
                      key="vcard-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5 flex-grow flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                          <CreditCard className="text-orange-500" size={18} />
                          Secure Virtual Card (VCard) Interface
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal">Verify encrypted business bio-cards connected to real B2B loyalty transaction exchange vaults.</p>
                      </div>

                      {/* Display VCard Details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-3 text-left">
                        
                        <div className="md:col-span-7 bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl space-y-3.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">CARD STATUS</span>
                            <span className="text-orange-600 font-bold tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                              ACTIVE
                            </span>
                          </div>

                          <div className="space-y-1.5 font-mono text-xs text-slate-700">
                            <div className="flex justify-between border-b border-slate-200 pb-1.5">
                              <span>Card Code</span>
                              <span>•••• •••• •••• 4892</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1.5 pt-1">
                              <span>Cardholder</span>
                              <span>AZEEM ENTERPRISES</span>
                            </div>
                            <div className="flex justify-between pt-1 font-sans">
                              <span>Security Profile</span>
                              <span className="text-orange-655 font-bold flex items-center gap-1">
                                <Lock size={12} /> Dynamic CVV
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Security Visual */}
                        <div className="md:col-span-5 flex justify-center">
                          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-orange-500/10 bg-orange-500/5 flex items-center justify-center p-3 shadow-sm">
                            <div className="absolute inset-0 rounded-full border border-dashed border-orange-500/20 animate-spin" style={{ animationDuration: '15s' }} />
                            <div className="text-center space-y-1.5">
                              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mx-auto">
                                <ShieldCheck size={20} />
                              </div>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">SECURE VAULT</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* INTERACTIVE AUDITING PANEL */}
                  {simPlaygroundTab === 'audit' && (
                    <motion.div
                      key="audit-panel"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 flex-grow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                              <BarChart2 className="text-orange-500" size={18} />
                              Operational Audit Simulator
                            </h4>
                            <p className="text-[11px] text-slate-500 leading-normal">Optimize spare capacity levels by dragging the capacity load simulator below.</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full border border-orange-200 bg-orange-500/5 text-orange-655 font-mono text-[9px] font-bold uppercase shrink-0">SANDBOX</span>
                        </div>

                        {/* Interactive Slider */}
                        <div className="space-y-1.5 pt-3">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">Workforce & Asset Capacity Load</span>
                            <span className="text-orange-500 font-mono">{simAuditCapacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={simAuditCapacity}
                            onChange={(e) => setSimAuditCapacity(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
                          />
                        </div>
                      </div>

                      {/* Calculations Visual Output Card (Responsive stack) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 mt-6 text-left">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Spare Capacity Identified</span>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${100 - simAuditCapacity}%` }} />
                            </div>
                            <span className="text-xs font-bold text-orange-600 font-mono">{100 - simAuditCapacity}%</span>
                          </div>
                        </div>
                        <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Operational Bottleneck Factor</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs sm:text-sm font-bold font-mono ${
                              simAuditCapacity > 85 ? 'text-rose-600' :
                              simAuditCapacity > 60 ? 'text-amber-600' :
                              'text-emerald-600'
                            }`}>
                              {simAuditCapacity > 85 ? 'HIGH RISK' :
                               simAuditCapacity > 60 ? 'OPTIMIZED' :
                               'BALANCED'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>

                {/* Sandbox Footer */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-5.5 mt-5.5">
                  <div className="flex items-center gap-2 font-mono text-[9px] text-slate-400">
                    <span>mcom://vault/engine_sandbox_1</span>
                  </div>
                  <Link
                    href="/getstarted"
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-widest cursor-pointer"
                  >
                    Deploy Engine <ArrowRight size={13} />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </ScrollAnimatedSection>

        {/* Removed Recent Establishments Grid */}

        {/* CORE PLATFORM FEATURES */}
        <McomFeatureSection />
        
        <ScrollAnimatedSection className="py-24 bg-slate-900 text-white border-t border-b border-slate-950">
            <SeasonalMarketingSection />
        </ScrollAnimatedSection>

        <AuditSection />
        
        <ScrollAnimatedSection className="py-24 bg-white border-t border-slate-100">
            <LoyaltyProgramSection />
        </ScrollAnimatedSection>

        <McomEgiftCard />

        {/* --- VCARD STYLED CAROUSEL & CARDS --- */}
        <div className="bg-slate-50 py-28 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-3 mb-16">
              <span className="text-orange-600 font-bold uppercase tracking-[0.25em] text-xs font-mono">SECURE DIGITAL CARDS</span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Your Digital VCard Profile</h2>
            </div>
            
            <VirtualCardCarousel />
            <VCardFeaturesSection />

            <div className="flex justify-center mt-16">
                <Link
                href="https://mcomvcardsocialbio.com/"
                target="_blank"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.03] text-sm md:text-base uppercase tracking-widest cursor-pointer active:scale-97"
                >
                Get Your VCard Bio
                </Link>
            </div>
          </div>
        </div>

        <McomSolutions />

        <div className="py-24 bg-white border-t border-slate-150">
            <McomMallBrandsSection />
        </div>
      </main>

      {/* Removed Business Blog Posts */}

      <Footer />

      {/* --- BACK TO TOP --- */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 w-14 h-14 bg-orange-500 text-white rounded-2xl shadow-xl z-50 flex items-center justify-center hover:bg-orange-600 transition-colors group cursor-pointer border border-orange-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ArrowUp size={22} className="group-hover:animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
