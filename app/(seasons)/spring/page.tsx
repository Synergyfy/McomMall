// app/(seasons)/spring/page.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SeasonalPage from '@/components/SeasonalPage';

const FallingPetals = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
    {Array.from({ length: 70 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-pink-300 rounded-full"
        initial={{ y: '-10vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
        animate={{
          y: '110vh',
          opacity: [0, 1, 1, 0],
          scale: [Math.random() * 0.4 + 0.6, Math.random() * 0.4 + 0.6],
        }}
        transition={{
          duration: Math.random() * 12 + 12,
          repeat: Infinity,
          ease: 'linear',
          delay: Math.random() * 12,
        }}
        style={{
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 3 + 2}px`,
          borderRadius: '50% 0 50% 0',
        }}
      />
    ))}
  </div>
);

const springTheme = {
  name: 'Spring',
  bgColor: 'bg-emerald-900',
  primaryColor: 'pink-500',
  secondaryColor: 'pink-400',
  textColor: 'emerald-100',
  bannerImage: 'https://images.unsplash.com/photo-1568150129334-31fbe6db6dec',
  animation: FallingPetals,
  texts: {
    mainTitle: 'Spring Virtual Exhibition',
    mainSubtitle: 'Celebrate the season of renewal with exclusive offers, events, and experiences.',
    whatIsTitle: 'What the Spring Exhibition Means',
    whatIsP1: 'Spring is a season of new beginnings. Our Virtual Exhibition brings together businesses and consumers in a vibrant digital marketplace, designed to highlight exclusive offers and seasonal campaigns that celebrate renewal.',
    whatIsP2: 'Think of it as your online spring festival, where businesses can showcase their best promotions, and you can discover, shop, and engage — all from the comfort of home.',
  },
};

import Footer from '@/components/Footer';

export default function SpringPage() {
  return (
    <>
      <SeasonalPage theme={springTheme} />
      <Footer />
    </>
  );
}
