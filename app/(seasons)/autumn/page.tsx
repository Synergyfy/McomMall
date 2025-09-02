// app/(seasons)/autumn/page.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SeasonalPage from '@/components/SeasonalPage';

const FallingLeaves = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
    {Array.from({ length: 70 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-orange-500 rounded-full"
        initial={{ y: '-10vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
        animate={{
          y: '110vh',
          opacity: [0, 1, 1, 0],
          scale: [Math.random() * 0.4 + 0.6, Math.random() * 0.4 + 0.6],
          rotate: Math.random() * 360,
        }}
        transition={{
          duration: Math.random() * 12 + 12,
          repeat: Infinity,
          ease: 'linear',
          delay: Math.random() * 12,
        }}
        style={{
          width: `${Math.random() * 6 + 4}px`,
          height: `${Math.random() * 4 + 3}px`,
          borderRadius: '50% 50% 0 0',
        }}
      />
    ))}
  </div>
);

const autumnTheme = {
  name: 'Autumn',
  bgColor: 'bg-stone-900',
  primaryColor: 'red-500',
  secondaryColor: 'red-400',
  textColor: 'stone-100',
  bannerImage: '/homepage/AutumnBanner.png',
  animation: FallingLeaves,
  texts: {
    mainTitle: 'Autumn Virtual Exhibition',
    mainSubtitle: 'Celebrate the season of harvest with exclusive offers, events, and experiences.',
    whatIsTitle: 'What the Autumn Exhibition Means',
    whatIsP1: 'Autumn is a season of change. Our Virtual Exhibition brings together businesses and consumers in a vibrant digital marketplace, designed to highlight exclusive offers and seasonal campaigns that celebrate the harvest.',
    whatIsP2: 'Think of it as your online autumn festival, where businesses can showcase their best promotions, and you can discover, shop, and engage — all from the comfort of home.',
  },
};

export default function AutumnPage() {
  return <SeasonalPage theme={autumnTheme} />;
}
