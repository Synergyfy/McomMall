// src/components/AuditSection.tsx

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BarChart, PackageCheck, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import LazyYouTubeVideo from '@/app/components/LazyYouTubeVideo';

// --- Data for each audit tab (Adjusted for Light Theme) ---
const auditTabsData = [
  {
    id: 'stock',
    label: 'Stock Audit',
    Icon: PackageCheck,
    title: 'Comprehensive Stock Auditing',
    description:
      'Gain complete clarity on your inventory. Our stock audit process identifies discrepancies, reduces carrying costs, and optimizes stock levels to ensure you have the right products available at the right time, preventing both overstocking and stockouts.',
    videoId: 'h532_y-e-bE',
    buttonText: 'Optimize Your Inventory',
    themeColor: 'text-cyan-600', // Darker for contrast on white
    underlineColor: 'bg-cyan-500',
    buttonClasses: 'bg-cyan-600 hover:bg-cyan-700',
  },
  {
    id: 'capacity',
    label: 'Spare Capacity',
    Icon: BarChart,
    title: 'Unlock Your Spare Capacity',
    description:
      "Don't let potential go to waste. We analyze your operations to identify and quantify spare capacity in your workforce, machinery, and processes. Turn idle resources into profitable opportunities for growth and increased output.",
    videoId: 'g_TTaP_za6c',
    buttonText: 'Maximize Operational Efficiency',
    themeColor: 'text-fuchsia-600', // Darker for contrast
    underlineColor: 'bg-fuchsia-500',
    buttonClasses: 'bg-fuchsia-600 hover:bg-fuchsia-700',
  },
  {
    id: 'solutions',
    label: 'Recommended Solutions',
    Icon: Wrench,
    title: 'Actionable, Data-Driven Solutions',
    description:
      'Receive more than just data—get a roadmap to success. Based on our comprehensive audit, we provide clear, prioritized, and practical solutions to address challenges, streamline operations, and drive sustainable growth for your business.',
    videoId: 'Qp3_j4wVp9M',
    buttonText: 'Implement Strategic Solutions',
    themeColor: 'text-orange-600', // Darker for contrast
    underlineColor: 'bg-orange-500',
    buttonClasses: 'bg-orange-600 hover:bg-orange-700',
  },
];

// --- Main Section Component (Light Theme) ---
export function AuditSection() {
  const [activeTab, setActiveTab] = useState(auditTabsData[0].id);
  const activeTabData = auditTabsData.find(tab => tab.id === activeTab);

  const router = useRouter();

  return (
    <div className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {"Unlock Your Business's Full Potential"}
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Our specialized audits provide deep insights into your operations,
            helping you identify hidden opportunities, reduce waste, and build a
            foundation for unstoppable growth.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-16 flex justify-center border-b border-slate-200">
          <div className="flex justify-center gap-x-2 sm:gap-x-8">
            {auditTabsData.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-t-md px-3 py-4 text-sm font-bold transition-colors duration-300 sm:px-4 sm:text-base ${
                  activeTab === tab.id
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.Icon
                  className={`h-5 w-5 ${
                    activeTab === tab.id ? tab.themeColor : ''
                  }`}
                />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-audit-underline"
                    className={`absolute inset-x-0 bottom-0 h-1 ${tab.underlineColor}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-auto mt-16 min-h-[450px] max-w-6xl">
          <AnimatePresence mode="wait">
            {activeTabData && (
              <motion.div
                key={activeTabData.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
              >
                <div className="order-2 lg:order-1">
                  <h3
                    className={`text-4xl font-bold leading-tight tracking-tight sm:text-5xl ${activeTabData.themeColor}`}
                  >
                    {activeTabData.title}
                  </h3>
                  <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
                    {activeTabData.description}
                  </p>
                  <a
                    href="#"
                    className={`mt-8 inline-flex items-center gap-3 rounded-full px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 sm:px-10 sm:py-4 sm:text-lg ${activeTabData.buttonClasses}`}
                  >
                    <span>{activeTabData.buttonText}</span>
                    <ArrowRight className="h-6 w-6" />
                  </a>
                </div>
                <div className="order-1 lg:order-2">
                  <LazyYouTubeVideo
                    videoId={activeTabData.videoId}
                    title={activeTabData.title}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 mt-16 mx-auto flex items-center gap-2 text-base md:text-lg"
          onClick={() => router.push('/audit-calculator')}
        >
          Try our audit calculator
        </Button>
      </div>
    </div>
  );
}
