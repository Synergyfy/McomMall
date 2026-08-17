// components/ParticipationSection.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Data for the two sections (no changes here)
const participationData = [
  {
    type: 'Business Owner',
    tabName: 'Grow Your Business',
    title: 'Grow Your Business',
    description:
      'Reach thousands of new customers, increase your sales, and build lasting loyalty in your local community.',
    imageUrl:
      'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1287&auto=format&fit=crop',
    imageAlt:
      'Business owner interacting with a customer at a payment terminal',
    buttonText: 'Register Your Business',
  },
  {
    type: 'Consumer',
    tabName: 'Explore as a Customer',
    title: 'Discover Your Community',
    description:
      'Find unique local shops, enjoy exclusive deals, and support the businesses that make your neighborhood great.',
    imageUrl:
      'https://images.unsplash.com/photo-1529209076408-5a115ec9f1c6?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageAlt: 'Happy customer shopping at a local market',
    buttonText: 'Start Exploring',
  },
];

// Animation variants for the content area
const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

export const ParticipationSection = () => {
  const [activeTab, setActiveTab] = useState(participationData[0].type);

  const activeContent = participationData.find(item => item.type === activeTab);

  return (
    <section className="w-full bg-slate-900 py-16 md:py-24">
      <div className="max-w-[1600px] mx-auto px-8">
        {/* Tab Controls */}
        <div className="flex w-full justify-center">
          <div className="mb-10 flex w-full max-w-md items-center justify-center overflow-x-auto rounded-full bg-slate-800 p-2 sm:w-auto">
            {participationData.map(tab => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`${
                  activeTab === tab.type
                    ? 'text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                } relative w-full whitespace-nowrap rounded-full px-6 py-3 text-sm font-medium transition-all sm:w-auto md:text-base`}
              >
                {/* Active tab indicator with layoutId for smooth animation */}
                {activeTab === tab.type && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 z-0 rounded-full bg-orange-600"
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.tabName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="group relative h-[75vh] max-h-[650px] w-full overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            {activeContent && (
              <motion.div
                key={activeContent.type} // Important for AnimatePresence to detect changes
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 h-full w-full"
              >
                {/* Full-bleed Image */}
                <img
                  src={activeContent.imageUrl}
                  alt={activeContent.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" // Prioritize loading the first image
                />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

                {/* Content overlaid on top */}
                <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white md:p-12 lg:p-16">
                  <h2 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    {activeContent.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-lg text-slate-200">
                    {activeContent.description}
                  </p>
                  <Button
                    size="lg"
                    className="group mt-8 w-fit bg-orange-600 px-8 py-6 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-orange-700 hover:shadow-xl"
                  >
                    {activeContent.buttonText}
                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
