'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type Tab = 'evergreen' | 'internal';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TabContent {
  headerTitle: string;
  mainTitle: string;
  subTitle?: string;
  description: string;
  features: Feature[];
}

// --- CONTENT DATA ---
const evergreenContent: TabContent = {
  headerTitle: 'External Evergreen Reward Programme',
  mainTitle: '',
  subTitle: 'Grow Loyalty, Every Day.',
  description:
    'Selling to existing customers is a lot cheaper than acquiring new ones. Build a lasting relationship with your customers. Keep them coming back with points they can earn and rewards they love. Our Evergreen Reward Programme runs all year round, making loyalty simple for businesses and exciting for customers.',
  features: [
    {
      icon: <CheckCircle className="w-5 h-5 text-orange-500" />,
      title: 'Simple Engagement',
      description:
        'Keep customers engaged with a simple points and rewards system.',
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-orange-500" />,
      title: 'Build Trust',
      description: 'Build trust by offering rewards that never expire.',
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-orange-500" />,
      title: 'Quick Setup',
      description:
        'Launch your loyalty campaign in minutes with our easy setup wizard.',
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-orange-500" />,
      title: 'Fully Automated',
      description:
        'Let the system do the hard work (points, rewards, redemptions – all automated).',
    },
  ],
};

const internalContent: TabContent = {
  headerTitle: 'Internal Reward & Loyalty Program',
  mainTitle: '', // Main title is not needed here as per the image
  description:
    'Transform casual buyers into lifelong brand advocates. Our Reward & Loyalty Program is engineered to foster deep-rooted customer relationships by acknowledging and rewarding their continued patronage in meaningful ways.',
  features: [
    {
      icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
      title: 'Tiered Rewards System',
      description:
        'Motivate repeat purchases with escalating rewards. Customers unlock exclusive perks and benefits as they engage more with your brand.',
    },
    {
      icon: <Star className="w-5 h-5 text-orange-500" />,
      title: 'Personalized Offers',
      description:
        'Leverage customer data to deliver tailor-made promotions that resonate on a personal level, increasing conversion and satisfaction.',
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-orange-500" />,
      title: 'Seamless Integration',
      description:
        'Our program integrates smoothly with your existing point-of-sale and e-commerce platforms for a frictionless customer experience.',
    },
  ],
};

const contentMap: Record<Tab, TabContent> = {
  evergreen: evergreenContent,
  internal: internalContent,
};

// --- MAIN COMPONENT ---
const LoyaltyProgramSection = () => {
  const [activeTab, setActiveTab] = useState<Tab>('evergreen');
  const activeContent = contentMap[activeTab];

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="bg-white font-sans py-5 sm:py-20 px-4 sm:px-6 lg:px-5">
      <div className="max-w-[1600px] mx-auto px-8">
        {/* Tab Navigation */}
        <div className="mb-10 border-b border-gray-200">
          <div className="overflow-x-auto pb-1 -mx-4 px-4">
            <div className="flex flex-nowrap items-center justify-center space-x-4 sm:space-x-8 whitespace-nowrap">
              <button
                onClick={() => setActiveTab('evergreen')}
                className={`py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-base font-semibold transition-colors duration-300 ${
                  activeTab === 'evergreen'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Evergreen Loyalty Program
              </button>
              <button
                onClick={() => setActiveTab('internal')}
                className={`py-2 px-2 sm:py-3 sm:px-4 text-sm sm:text-base font-semibold transition-colors duration-300 ${
                  activeTab === 'internal'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Internal Reward & Loyalty
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Image Column */}
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl aspect-square lg:aspect-auto">
              <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop" alt="Loyalty Program" width={800} height={800} />
            </div>

            {/* Text Column */}
            <div className="flex flex-col">
              <h2 className="text-3xl sm:text-3xl font-bold text-gray-800 leading-tight">
                {activeContent.headerTitle}
              </h2>

              <div className="mt-6 text-gray-600 space-y-6">
                {activeContent.mainTitle && (
                  <h3 className="text-xl sm:text-xl font-semibold text-gray-700">
                    {activeContent.mainTitle}
                  </h3>
                )}
                {activeContent.subTitle && (
                  <p className="text-lg font-medium text-gray-500">
                    {activeContent.subTitle}
                  </p>
                )}
                <p className="text-base">{activeContent.description}</p>
              </div>

              <ul className="mt-8 space-y-5">
                {activeContent.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <button className="flex items-center justify-center text-base sm:text-lg font-semibold text-white bg-orange-600 rounded-lg px-6 py-3 sm:px-8 sm:py-4 transition-all duration-300 hover:bg-orange-700 hover:shadow-xl transform hover:scale-105 shadow-orange-300">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LoyaltyProgramSection;
