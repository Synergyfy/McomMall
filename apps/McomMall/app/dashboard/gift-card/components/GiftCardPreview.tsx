'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { GiftCardDesign } from '../types';
import { formatCurrency } from '@/lib/utils';

interface GiftCardPreviewProps {
  design: GiftCardDesign;
  amount: string;
}

const PinstripePattern = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="pinstripe" patternUnits="userSpaceOnUse" width="100%" height="4">
        <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#pinstripe)" />
  </svg>
);

const GoldenBow = () => (
  <div className="relative w-24 h-16 flex items-center justify-center scale-75 md:scale-100">
    {/* Ribbon horizontal extending from sides */}
    <div className="absolute w-[200%] h-4 bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-lg" />

    {/* Bow Loops */}
    <div className="absolute -left-2 w-10 h-10 border-4 border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg] shadow-md" />
    <div className="absolute -right-2 w-10 h-10 border-4 border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg] shadow-md" />

    {/* Bow Tails */}
    <div className="absolute top-8 -left-1 w-6 h-10 bg-gradient-to-t from-amber-600 to-yellow-400 skew-x-[-20deg] clip-path-polygon-[0%_0%,100%_0%,50%_100%]"
      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />
    <div className="absolute top-8 -right-1 w-6 h-10 bg-gradient-to-t from-amber-600 to-yellow-400 skew-x-[20deg] clip-path-polygon-[0%_0%,100%_0%,50%_100%]"
      style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 80%, 0% 100%)' }} />

    {/* Center Knot */}
    <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 shadow-xl z-10" />
  </div>
);

export function GiftCardPreview({ design, amount }: GiftCardPreviewProps) {
  return (
    <div className="w-full max-w-md mx-auto lg:sticky lg:top-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
        Preview Card
      </h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={design.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="rounded-3xl shadow-2xl overflow-hidden relative aspect-[1.586/1] text-white border-4 border-white/20"
          style={{
            background: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
          }}
        >
          {/* Background Pinstripe Pattern */}
          <div className="absolute inset-0 opacity-40">
            <PinstripePattern />
          </div>

          {/* Golden Ribbon Layer */}
          <div className="absolute bottom-[25%] left-0 w-full h-4 z-10">
            <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
          </div>

          {/* Golden Bow Centered on Ribbon */}
          <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-8px)] z-20">
            <GoldenBow />
          </div>

          {/* Glare/Shine Effect */}
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative z-30 p-8 flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-5xl font-black text-yellow-500 tracking-tight leading-none italic mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  GIFT <span className="text-yellow-400">CARD</span>
                </h3>
                <p className="text-[10px] md:text-xs text-white/70 max-w-[200px] leading-tight font-medium">
                  Lorem ipsum dolor sit amet, conetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
                </p>
              </div>
              <design.icon className="h-10 w-10 text-yellow-400 drop-shadow-lg" />
            </div>

            <div className="flex-grow" />

            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-1">Card Serial</p>
                <p className="text-lg font-mono tracking-wider text-yellow-500">•••• •••• ••••</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold opacity-80 mb-0.5">{design.name}</p>
                <p className="text-4xl font-black tracking-tighter text-yellow-400 drop-shadow-md">
                  {formatCurrency(Number(amount) || 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
