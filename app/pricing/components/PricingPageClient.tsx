'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import PricingNav from './PricingNav';
import PayAsYouGoContent from './PayAsYouGoContent';
import CoBrandedContent from './CoBrandedContent';
import MobilePricingPage from './MobilePricingPage';

export default function PricingPageClient() {
  const [activeView, setActiveView] = useState<'payg' | 'cobranded'>('payg');
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listing_id');

  return (
    <div className="h-full p-4 md:py-10 md:px-20 flex flex-col items-center overflow-y-auto">
      <header className="text-center">
        <h1 className="text-3xl md:text-5xl font-semibold">
          McomMall Packages and Pricing
        </h1>
        <p className="text-lg md:text-xl text-gray-800 font-medium mt-2">
          Select the package that serves your need.
        </p>
      </header>
      <section className="w-full md:w-5/6 mt-10 flex flex-col items-center bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 rounded-lg shadow-lg">
        {/* Desktop Sidebar */}
        <aside className="mt-10 md:mt-20 space-y-4">
          <h3 className="text-xl md:text-2xl font-medium text-center">
            Select your plan
          </h3>
          <div className="hidden rounded-full border h-fit md:block min-w-fit border-r px-10 bg-white/80 backdrop-blur-sm py-5 ">
            <PricingNav
              orientation="vertical"
              activeView={activeView}
              setActiveView={setActiveView}
            />
          </div>
        </aside>
        <main className="flex-1 w-full p-4 md:p-8 overflow-auto">
          {/* Desktop Content */}
          <div className="hidden md:block">
            <AnimatePresence mode="wait">
              {activeView === 'payg' ? (
                <motion.div
                  key="payg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <PayAsYouGoContent listingId={listingId} />
                </motion.div>
              ) : (
                <motion.div
                  key="cobranded"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <CoBrandedContent listingId={listingId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Content */}
          <div className="block md:hidden">
            <MobilePricingPage activeView={activeView} listingId={listingId} />
          </div>
        </main>
        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t p-4 bg-white/80 backdrop-blur-sm z-10">
          <PricingNav
            orientation="horizontal"
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </nav>
      </section>
    </div>
  );
}
