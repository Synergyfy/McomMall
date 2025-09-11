// src/components/SeasonalMarketingSection.tsx

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightCircle } from 'lucide-react';
import Link from 'next/link';

// --- Data Structure with Theming and Video IDs ---
const seasonsData = [
  {
    id: 'winter',
    season: 'Winter',
    description:
      "Dominate the peak sales season. Craft compelling campaigns for Christmas, New Year's, and Valentine's Day. Emphasize gifting, celebration, and heartfelt messaging to drive conversions.",
    videoId: 'DDt_o_d1Ldo', // Placeholder YouTube Video ID
    themeColor: 'text-sky-400',
    buttonClasses: 'bg-sky-600 hover:bg-sky-500',
    underlineColor: 'bg-sky-500',
  },
  {
    id: 'spring',
    season: 'Spring',
    description:
      'Capitalize on the themes of renewal and growth. Launch fresh campaigns focused on outdoor activities, spring cleaning, and holidays like Easter to engage an optimistic and active audience.',
    videoId: '47u7bA00u2g',
    themeColor: 'text-emerald-400',
    buttonClasses: 'bg-emerald-600 hover:bg-emerald-500',
    underlineColor: 'bg-emerald-500',
  },
  {
    id: 'summer',
    season: 'Summer',
    description:
      'Align your brand with the energy of summer. Focus on travel, holidays, and major outdoor events. Leverage vibrant visuals and limited-time offers to capture the attention of consumers on the go.',
    videoId: 'N1-Jmq7BLFE',
    themeColor: 'text-amber-400',
    buttonClasses: 'bg-amber-600 hover:bg-amber-500',
    underlineColor: 'bg-amber-500',
  },
  {
    id: 'autumn',
    season: 'Autumn',
    description:
      'Tap into the "back-to-routine" mindset. This is the ideal time for educational content, cozy product showcases, and early holiday promotions for Thanksgiving and Black Friday.',
    videoId: 'E4-c_fT1MMI',
    themeColor: 'text-orange-500',
    buttonClasses: 'bg-orange-600 hover:bg-orange-500',
    underlineColor: 'bg-orange-500',
  },
];

// --- Reusable Video Player Component ---
const VideoPlayer = ({ videoId }: { videoId: string }) => (
  <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-700 bg-black shadow-2xl">
    <iframe
      // src={`https://www.youtube.com/embed/${videoId}`}
      src={`https://www.youtube.com/embed/dQw4w9WgXcQ`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="h-full w-full"
    ></iframe>
  </div>
);

// --- Content Component for a Single Season ---
interface SeasonContentProps {
  season: (typeof seasonsData)[0];
}

const SeasonContent: React.FC<SeasonContentProps> = ({ season }) => {
  return (
    <motion.div
      key={season.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
    >
      <div className="order-2 lg:order-1">
        <h3
          className={`text-4xl font-bold tracking-tight sm:text-5xl ${season.themeColor}`}
        >
          {season.season} Marketing
        </h3>
        <p className="mt-6 text-lg leading-relaxed text-gray-300">
          {season.description}
        </p>
        <Link
          href={`/seasons/${season.id}`}
          className={`mt-8 inline-flex items-center gap-3 rounded-full px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 ${season.buttonClasses}`}
        >
          <span>Get Started</span>
          <ArrowRightCircle className="h-6 w-6" />
        </Link>
      </div>
      <div className="order-1 lg:order-2">
        <VideoPlayer videoId={season.videoId} />
      </div>
    </motion.div>
  );
};

// --- Main Section Component ---
export function SeasonalMarketingSection() {
  const [activeSeason, setActiveSeason] = useState(seasonsData[0].id);

  const activeSeasonData = seasonsData.find(s => s.id === activeSeason);

  return (
    <div className="bg-slate-900 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            4 Seasonal Marketing Periods
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Harness the power of the calendar to create timely and impactful
            campaigns. Align your strategy with the distinct mindsets of each
            season to unlock new growth opportunities.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-16 flex justify-center border-b border-slate-700">
          <div className="flex flex-wrap justify-center gap-x-2 sm:gap-x-6">
            {seasonsData.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSeason(tab.id)}
                className={`relative rounded-t-md px-3 py-3 text-sm md:text-2xl font-bold transition-colors duration-300 sm:px-4 sm:text-base ${
                  activeSeason === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {activeSeason === tab.id && (
                  <motion.div
                    layoutId="active-season-underline"
                    className={`absolute inset-x-0 bottom-0 h-1 ${tab.underlineColor}`}
                  />
                )}
                {tab.season}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-auto mt-16 min-h-[450px] max-w-6xl">
          <AnimatePresence mode="wait">
            {activeSeasonData && <SeasonContent season={activeSeasonData} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
