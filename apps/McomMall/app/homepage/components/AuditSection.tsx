'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BarChart, PackageCheck, Wrench, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import LazyYouTubeVideo from '@/app/components/LazyYouTubeVideo';

// --- Data for each audit tab (Aligned to Brand White & Orange) ---
const auditTabsData = [
  {
    id: 'stock',
    label: 'Stock Audit',
    Icon: PackageCheck,
    title: 'Comprehensive Stock Auditing',
    description:
      'Gain complete clarity on your inventory. Our automated stock audit processes identify discrepancies, reduce carrying costs, and optimize buffer stock levels to ensure you have the right products available at the right time, preventing both overstocking and costly stockouts.',
    videoId: 'h532_y-e-bE',
    buttonText: 'Optimize Your Inventory',
    themeColor: 'text-orange-500',
    underlineColor: 'bg-orange-500',
    borderColor: 'border-orange-500/30',
    bgGlow: 'bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
    buttonClasses: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
  },
  {
    id: 'capacity',
    label: 'Spare Capacity',
    Icon: BarChart,
    title: 'Unlock Your Spare Capacity',
    description:
      "Don't let operational potential go to waste. We analyze workflows to identify and quantify spare capacity in your workforce, machinery, and daily operations. Turn idle resources into profitable opportunities for growth and increased output.",
    videoId: 'g_TTaP_za6c',
    buttonText: 'Maximize Capacity Yield',
    themeColor: 'text-orange-500',
    underlineColor: 'bg-orange-500',
    borderColor: 'border-orange-500/30',
    bgGlow: 'bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
    buttonClasses: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
  },
  {
    id: 'solutions',
    label: 'Strategic Solutions',
    Icon: Wrench,
    title: 'Actionable, Data-Driven Solutions',
    description:
      'Receive more than just numbers—get an actionable roadmap to success. Based on our comprehensive operational audit, we provide clear, prioritized, and practical solutions to address system bottlenecks, streamline operations, and drive sustainable enterprise growth.',
    videoId: 'Qp3_j4wVp9M',
    buttonText: 'Deploy Strategic Solutions',
    themeColor: 'text-orange-500',
    underlineColor: 'bg-orange-500',
    borderColor: 'border-orange-500/30',
    bgGlow: 'bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
    buttonClasses: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20',
  },
];

export function AuditSection() {
  const [activeTab, setActiveTab] = useState(auditTabsData[0].id);
  const activeTabData = auditTabsData.find(tab => tab.id === activeTab);
  const router = useRouter();

  return (
    <div className="bg-[#fafafa] py-24 border-t border-slate-100 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-500 text-xs font-semibold tracking-wider font-mono">
            <Sparkles size={12} className="text-orange-500 animate-pulse" />
            <span>ENTERPRISE COMPLIANCE</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Unlock Your Business's <span className="text-orange-500">Full Yield</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Our specialized audits provide deep insights into your operations, helping you identify hidden capacity, eliminate waste, and build an optimized foundation for growth.
          </p>
        </div>

        {/* Tab Navigation Console (Light floating bar, horizontally scrollable on mobile) */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div className="p-1.5 rounded-2xl border border-slate-200 bg-white flex overflow-x-auto gap-2 max-w-2xl w-full shadow-lg hide-scrollbar">
            {auditTabsData.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 md:px-5 text-xs md:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer whitespace-nowrap min-w-0 flex-1 ${
                    isActive
                      ? `${tab.themeColor} ${tab.borderColor} ${tab.bgGlow} border bg-[#fafafa]`
                      : 'text-slate-500 border-transparent bg-transparent hover:text-slate-700'
                  }`}
                >
                  <tab.Icon className={`h-4 w-4 shrink-0 ${isActive ? tab.themeColor : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="mx-auto min-h-[460px] max-w-6xl">
          <AnimatePresence mode="wait">
            {activeTabData && (
              <motion.div
                key={activeTabData.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12"
              >
                
                {/* Column 1: Info and CTA */}
                <div className="order-2 lg:order-1 lg:col-span-7 space-y-6 text-left">
                  <span className="inline-block text-[9px] font-bold tracking-widest uppercase font-mono px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-500">
                    COMPLIANCE MODULE • {activeTabData.label}
                  </span>
                  
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight lg:text-5xl text-slate-900">
                    {activeTabData.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-normal">
                    {activeTabData.description}
                  </p>
                  
                  <div className="pt-4">
                    <a
                      href="#"
                      className={`inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-xs uppercase tracking-wider font-bold text-white shadow-md transition-all hover:scale-[1.03] active:scale-97 cursor-pointer ${activeTabData.buttonClasses}`}
                    >
                      <span>{activeTabData.buttonText}</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </a>
                  </div>
                </div>

                {/* Column 2: Video Player */}
                <div className="order-1 lg:order-2 lg:col-span-5 relative">
                  
                  {/* Decorative glowing gradient ring */}
                  <div className="absolute -inset-1 rounded-2xl bg-orange-500 opacity-10 blur-lg pointer-events-none transition-all duration-500" />

                  {/* Video Shell */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                    <LazyYouTubeVideo
                      videoId={activeTabData.videoId}
                      title={activeTabData.title}
                    />
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Operational Tools Box (Light clean frame) */}
        <div className="mt-14 md:mt-20 p-5 sm:p-8 rounded-3xl border border-slate-200 bg-white max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 shadow-xl shadow-slate-100/50">
          <div className="text-left space-y-1">
            <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Calculate Your Savings Potential</h4>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">Use our secure B2B audit calculator to estimate lost capacity values instantly.</p>
          </div>
          
          <Button
            className="cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold px-7 py-5.5 rounded-xl flex items-center gap-2 text-xs uppercase tracking-widest transition-all active:scale-97"
            onClick={() => router.push('/audit-calculator')}
          >
            <span>Try audit calculator</span>
            <ArrowRight size={13} />
          </Button>
        </div>

      </div>
    </div>
  );
}
export default AuditSection;
