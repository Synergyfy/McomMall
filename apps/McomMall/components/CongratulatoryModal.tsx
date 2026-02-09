'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CongratulatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionName: string;
  points?: number;
}

export function CongratulatoryModal({
  isOpen,
  onClose,
  promotionName,
  points,
}: CongratulatoryModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-[2rem] overflow-hidden p-0">
        <div className="relative p-8 flex flex-col items-center text-center">
          
          {/* Animated Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-white -z-10" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-200/40 via-transparent to-transparent" 
          />

          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-500/10 relative"
          >
            <Trophy className="w-12 h-12 text-orange-600" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-orange-200 rounded-full"
            />
            {/* Stars popping */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -20, x: (i - 1) * 20 }}
                    transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                    className="absolute -top-2 left-1/2"
                >
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </motion.div>
            ))}
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome Aboard!</h2>
            <p className="text-gray-500 font-medium mb-6">
              You've successfully joined <span className="text-orange-600 font-bold">"{promotionName}"</span>.
            </p>

            <div className="bg-orange-50 rounded-2xl p-4 mb-8 text-left space-y-3 border border-orange-100">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 font-medium">Start shopping eligible items to earn points.</p>
                </div>
                {points && points > 0 && (
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 font-medium">Earn up to <span className="font-bold">{points} points</span> per transaction.</p>
                    </div>
                )}
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 font-medium">Track your progress in your dashboard.</p>
                </div>
            </div>

            <Button 
                onClick={onClose}
                className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
                Start Earning <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
