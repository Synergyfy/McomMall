// app/(seasons)/summer/page.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SeasonalPage from '@/components/SeasonalPage';
import { Sun } from 'lucide-react';

const ShiningSun = () => (
  <div className="absolute top-16 left-16 w-48 h-48 pointer-events-none z-10">
    <motion.div
      className="relative w-full h-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <Sun className="text-yellow-300 w-full h-full" />
    </motion.div>
  </div>
);

const summerTheme = {
  name: 'Summer',
  bgColor: 'bg-amber-900',
  primaryColor: 'orange-500',
  secondaryColor: 'orange-400',
  textColor: 'amber-100',
  bannerImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  animation: ShiningSun,
  texts: {
    mainTitle: 'Summer Virtual Exhibition',
    mainSubtitle: 'Celebrate the season of sun with exclusive offers, events, and experiences.',
    whatIsTitle: 'What the Summer Exhibition Means',
    whatIsP1: 'Summer is a season of adventure. Our Virtual Exhibition brings together businesses and consumers in a vibrant digital marketplace, designed to highlight exclusive offers and seasonal campaigns that celebrate the sun.',
    whatIsP2: 'Think of it as your online summer festival, where businesses can showcase their best promotions, and you can discover, shop, and engage — all from the comfort of home.',
  },
};

import Footer from '@/components/Footer';

export default function SummerPage() {
  return (
    <>
      <SeasonalPage theme={summerTheme} />
      <Footer />
    </>
  );
}
