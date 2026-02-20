'use client';

import { Gift, Heart, Star } from 'lucide-react';
import { GiftCardPreview } from './components/GiftCardPreview';
import React from 'react';
import { GiftCardDesign } from './types';
import { GiftCardForm } from './components/GiftCardForm';

// In a real project, these imports would be:
// import { GiftCardDesign } from "@/lib/types";
// import { GiftCardPreview } from "./components/GiftCardPreview";
// import { GiftCardForm } from "./components/GiftCardForm";

// Background pattern components for visual flair
const PinstripePattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern
        id="pinstripe-main"
        patternUnits="userSpaceOnUse"
        width="100%"
        height="4"
      >
        <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pinstripe-main)" />
  </svg>
);

const SilkPattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silk-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
        <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#silk-grad)" />
  </svg>
);

// Mock Data for Gift Card Designs with new visual properties
const giftCardDesigns: GiftCardDesign[] = [
  {
    id: 'classic',
    name: 'Royal Red',
    icon: Gift,
    primaryColor: '#8b0000',
    secondaryColor: '#4b0000',
    pattern: <PinstripePattern />,
  },
  {
    id: 'midnight',
    name: 'Midnight Gold',
    icon: Star,
    primaryColor: '#1a202c',
    secondaryColor: '#000000',
    pattern: <PinstripePattern />,
  },
  {
    id: 'premium',
    name: 'Silk Rose',
    icon: Heart,
    primaryColor: '#8b4513',
    secondaryColor: '#3d1c02',
    pattern: <SilkPattern />,
  },
];

// Main Page Component
export default function GiftCardPage() {
  const [amount, setAmount] = React.useState('100.00');
  const [selectedDesign, setSelectedDesign] = React.useState<GiftCardDesign>(
    giftCardDesigns[0]
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <GiftCardPreview design={selectedDesign} amount={amount} />
          <GiftCardForm
            designs={giftCardDesigns}
            selectedDesign={selectedDesign}
            onDesignChange={setSelectedDesign}
            amount={amount}
            onAmountChange={setAmount}
          />
        </div>
      </div>
    </div>
  );
}
