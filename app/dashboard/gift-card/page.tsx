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
const GridPattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern
        id="a"
        patternUnits="userSpaceOnUse"
        width="20"
        height="20"
        patternTransform="scale(1) rotate(0)"
      >
        <rect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,0)" />
        <path
          d="M10 0v20M0 10h20"
          strokeWidth="0.5"
          stroke="hsla(0,0%,100%,1)"
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#a)" />
  </svg>
);
const DotsPattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern
        id="b"
        patternUnits="userSpaceOnUse"
        width="20"
        height="20"
        patternTransform="scale(1) rotate(0)"
      >
        <rect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,0)" />
        <circle
          cx="10"
          cy="10"
          r="1.5"
          strokeWidth="0"
          stroke="hsla(0,0%,100%,1)"
          fill="hsla(0,0%,100%,1)"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#b)" />
  </svg>
);
const LinesPattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern
        id="c"
        patternUnits="userSpaceOnUse"
        width="20"
        height="20"
        patternTransform="scale(2) rotate(45)"
      >
        <rect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,0)" />
        <path
          d="M0 10h20"
          strokeWidth="0.5"
          stroke="hsla(0,0%,100%,1)"
          fill="none"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#c)" />
  </svg>
);

// Mock Data for Gift Card Designs with new visual properties
const giftCardDesigns: GiftCardDesign[] = [
  {
    id: 'classic',
    name: 'Classic',
    icon: Gift,
    primaryColor: '#4a5568',
    secondaryColor: '#1a202c',
    pattern: <GridPattern />,
  },
  {
    id: 'birthday',
    name: 'Birthday',
    icon: Star,
    primaryColor: '#4299e1',
    secondaryColor: '#434190',
    pattern: <DotsPattern />,
  },
  {
    id: 'love',
    name: 'Love',
    icon: Heart,
    primaryColor: '#ed64a6',
    secondaryColor: '#b83280',
    pattern: <LinesPattern />,
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
