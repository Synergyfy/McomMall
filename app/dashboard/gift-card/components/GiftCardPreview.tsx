'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { GiftCardDesign } from '../types';

interface GiftCardPreviewProps {
  design: GiftCardDesign;
  amount: string;
}

export function GiftCardPreview({ design, amount }: GiftCardPreviewProps) {
  return (
    <div className="w-full max-w-md mx-auto lg:sticky lg:top-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
        Gift Card
      </h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={design.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="rounded-xl shadow-2xl overflow-hidden relative aspect-[1.586/1] text-white"
          style={{
            background: `linear-gradient(135deg, ${design.primaryColor}, ${design.secondaryColor})`,
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">{design.pattern}</div>

          {/* Glare Effect */}
          <motion.div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/20 via-transparent to-transparent"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start">
              {/* Chip simulation */}
              <div className="w-14 h-10 bg-gray-300/80 rounded-md flex items-center justify-center">
                <div className="w-10 h-7 bg-yellow-400/80 rounded-sm"></div>
              </div>
              <design.icon className="h-10 w-10" />
            </div>

            <div className="flex-grow flex items-center">
              <p className="text-3xl font-mono tracking-widest">
                GIFT-CARD-2025
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-lg opacity-80">{design.name}</p>
              <p className="text-5xl font-bold tracking-tight">
                £{amount || '0.00'}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
