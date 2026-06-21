'use client';

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Zap, 
  TrendingUp, 
  ChevronRight, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Info,
  X,
  Compass,
  Layers,
  MessageSquare
} from 'lucide-react';
import api from '@/service/api';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  mallData: any;
  businessName: string;
  boroughName: string;
}

export const HomeScreen: FC<HomeScreenProps> = ({
  onNavigate,
  mallData,
  businessName,
  boroughName,
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    const onboardingDone = localStorage.getItem('localmall_onboarding_dismissed');
    if (!onboardingDone) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    localStorage.setItem('localmall_onboarding_dismissed', 'true');
    setShowOnboarding(false);
  };

  const onboardingSlides = [
    {
      title: 'Welcome to Local Mall',
      description: 'Your digital gateway to high street collaboration and local audience reach.',
      icon: Compass,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Postcode-Powered Ecosystems',
      description: 'Your business is automatically mapped to your local Borough zone. Refine your boundaries anytime.',
      icon: MapPin,
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'B2B Shared Partnerships',
      description: 'Exchange share pools, run joint campaigns, and cross-promote with nearby merchants.',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Rotators & Premium Boosts',
      description: 'Drag-and-drop your products on the customer feed rotator or boost visibility for wider reach.',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const points = mallData?.pointsBalance ?? 2400;
  const activeBusinessesCount = mallData?.businesses?.length ?? 0;
  const activeCampaignsCount = mallData?.activeCampaigns?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 overflow-hidden"
            >
              {/* Decorative slide background gradient */}
              <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br ${onboardingSlides[onboardingStep].color} opacity-10 blur-3xl`} />
              
              <button 
                onClick={dismissOnboarding}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${onboardingSlides[onboardingStep].color} text-white flex items-center justify-center shadow-lg mb-6`}>
                  {(() => {
                    const Icon = onboardingSlides[onboardingStep].icon;
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>

                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
                  {onboardingSlides[onboardingStep].title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-sm mb-8">
                  {onboardingSlides[onboardingStep].description}
                </p>

                {/* Progress Indicators */}
                <div className="flex gap-1.5 mb-8">
                  {onboardingSlides.map((_, idx) => (
                    <span 
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === onboardingStep ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3 w-full">
                  {onboardingStep > 0 && (
                    <button
                      onClick={() => setOnboardingStep(prev => prev - 1)}
                      className="flex-1 py-3 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
                    >
                      Back
                    </button>
                  )}
                  {onboardingStep < onboardingSlides.length - 1 ? (
                    <button
                      onClick={() => setOnboardingStep(prev => prev + 1)}
                      className="flex-1 py-3 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={dismissOnboarding}
                      className="flex-1 py-3 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 rounded-xl shadow-md transition-colors"
                    >
                      Let's Explore
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Promo Banner */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-slate-900 rounded-3xl p-5 md:p-6 overflow-hidden shadow-md text-white border border-gray-800">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 opacity-20 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-black text-orange-400 uppercase tracking-widest self-start">
              <Sparkles className="w-3.5 h-3.5" /> Onboarding Active
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">
              Elevate Your local Visibility
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed">
              Verify your postcode, refine your High Street boundaries, and unlock cross-promotions with neighboring merchants.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('status')}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 duration-150 self-start md:self-auto shrink-0"
          >
            Check Status <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ecosystem Points', value: points.toLocaleString(), desc: `+${(mallData?.weeklyPointsEarned ?? 0).toLocaleString()} this week`, color: 'text-orange-600', bg: 'bg-orange-50/50' },
          { label: 'Active Businesses', value: activeBusinessesCount.toString(), desc: 'In your Borough', color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { label: 'Active Campaigns', value: activeCampaignsCount.toString(), desc: 'Shared promotions', color: 'text-red-600', bg: 'bg-red-50/50' },
          { label: 'Customer Reaches', value: (mallData?.consumerCount ?? 0).toLocaleString(), desc: 'Active high street feed views', color: 'text-orange-700', bg: 'bg-orange-100/30' },
        ].map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-3xl border border-gray-100/50 ${stat.bg} shadow-sm flex flex-col justify-between min-h-[110px]`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <div className="mt-2">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] font-semibold text-gray-400 mt-0.5">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Core Setup Checklist */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 tracking-tight mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" /> Onboarding Setup Checklist
        </h3>
        
        <div className="flex flex-col gap-2">
          {[
            { title: 'Verify Merchant Profile', desc: 'Confirm listing eligibility and claim verified status.', completed: mallData?.businesses?.some((b: any) => b.businessName === businessName && (b.isVerified || b.isClaimed)), screen: 'status' },
            { title: 'Confirm Postcode Boundary', desc: 'Pinpoint postcode coordinates on Nominatim mapping.', completed: !!boroughName, screen: 'borough' },
            { title: 'Set Sublocation Landmark', desc: 'Define your street cluster landmarks & directions.', completed: false, screen: 'sublocation' },
            { title: 'Join Hub Program', desc: 'Unlock reward tiers and reach manager support.', completed: false, screen: 'hub-participation' },
          ].map((item, idx) => (
            <div 
              key={idx}
              onClick={() => onNavigate(item.screen)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group active:scale-[0.99] duration-150"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  item.completed 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : 'bg-white border-gray-200 text-gray-300'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Activity Feed Snippet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Borough Promotions</h3>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            </div>
            <p className="text-sm font-black text-gray-900">Joint Campaigns Active</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Explore point promotions running inside your High Street district. Reach 500+ local consumers.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('highstreet')}
            className="w-full mt-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold rounded-xl transition-colors active:scale-95 duration-150"
          >
            Open High Street Feed
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">B2B Partnerships</h3>
            <p className="text-sm font-black text-gray-900">Partner Matching Engine</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Our matching algorithm suggests local partnerships with direct sector compatibility.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('partnerships')}
            className="w-full mt-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold rounded-xl transition-colors active:scale-95 duration-150"
          >
            Discover Partners
          </button>
        </div>
      </div>
    </div>
  );
};
