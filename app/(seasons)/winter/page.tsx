// app/(seasons)/winter/page.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SeasonalPage from '@/components/SeasonalPage';

const FallingSnow = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
    {Array.from({ length: 150 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full"
        initial={{ y: '-10vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
        animate={{
          y: '110vh',
          opacity: [0, 1, 1, 0],
          scale: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: 'linear',
          delay: Math.random() * 10,
        }}
        style={{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
        }}
      />
    ))}
  </div>
);

const winterTheme = {
  name: 'Winter',
  bgColor: 'bg-slate-900',
  primaryColor: 'sky-500',
  secondaryColor: 'sky-400',
  textColor: 'slate-200',
  bannerImage: 'https://images.unsplash.com/photo-1423145406370-2b342ae5b597',
  animation: FallingSnow,
  texts: {
    mainTitle: 'Winter Virtual Exhibition',
    mainSubtitle: 'Celebrate the season with exclusive offers, events, and experiences — for businesses & consumers.',
    whatIsTitle: 'What the Winter Exhibition Means',
    whatIsP1: 'Winter is a season of connection. Our Virtual Exhibition brings together businesses and consumers in a vibrant digital marketplace, designed to highlight exclusive offers and seasonal campaigns that make the colder months warmer.',
    whatIsP2: 'Think of it as your online winter festival, where businesses can showcase their best promotions, and you can discover, shop, and engage — all from the comfort of home.',
  },
};

import Footer from '@/components/Footer';

export default function WinterPage() {
  return (
    <>
      <SeasonalPage theme={winterTheme} />
      <Footer />
    </>
  );
}
