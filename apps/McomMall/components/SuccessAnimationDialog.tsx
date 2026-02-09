'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Check, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface SuccessAnimationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectPath?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  nextStepText?: string;
}

export function SuccessAnimationDialog({
  isOpen,
  onClose,
  title = "Booking Confirmed!",
  description = "Your appointment has been successfully scheduled and your payment is verified.",
  redirectPath = "/dashboard/bookings",
  buttonText = "Go to My Bookings",
  icon = <Calendar size={24} />,
  nextStepText = "Check your dashboard for details",
}: SuccessAnimationDialogProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(redirectPath);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, router, onClose, redirectPath]);

  const handleManualRedirect = () => {
    router.push(redirectPath);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[3rem] p-10 text-center relative overflow-hidden"
        >
          {/* Celebratory Background Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />

          {/* Success Icon Animation */}
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-emerald-500 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 relative z-10"
            >
              <Check size={48} strokeWidth={3} />
            </motion.div>
            
            {/* Sparkle Icons */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 z-0"
            >
              <Sparkles className="absolute top-0 right-1/4 text-yellow-400 w-6 h-6" />
              <Sparkles className="absolute bottom-0 left-1/4 text-orange-400 w-5 h-5" />
            </motion.div>
          </div>

          <div className="space-y-4 mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-gray-500 font-bold leading-relaxed">
              {description}
            </p>
          </div>

          <div className="bg-gray-50 rounded-[2rem] p-6 mb-8 border border-gray-100 flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
              {icon}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Step</p>
              <p className="text-sm font-black text-gray-800">{nextStepText}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleManualRedirect}
              className="w-full h-16 bg-[#f58220] hover:bg-black text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 group"
            >
              {buttonText} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Redirecting in <span className="text-orange-500">{countdown}s</span>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
