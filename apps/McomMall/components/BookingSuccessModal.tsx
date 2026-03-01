'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, ArrowRight, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  bookingId,
}: BookingSuccessModalProps) {
  const router = useRouter();

  const handleViewBookings = () => {
    onClose();
    router.push('/dashboard/my-bookings');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
        <div className="relative p-10 flex flex-col items-center text-center">
          
          {/* Animated Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white -z-10" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 inset-x-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-200/40 via-transparent to-transparent" 
          />

          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-orange-500/10 relative"
          >
            <PartyPopper className="w-14 h-14 text-orange-600" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-orange-200 rounded-full"
            />
            {/* Celebration elements */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], y: -40 - (i * 10), x: (i - 2) * 30 }}
                    transition={{ delay: 0.5 + (i * 0.1), duration: 2, repeat: Infinity }}
                    className="absolute top-0 left-1/2"
                >
                    <div className={`w-2 h-2 rounded-full ${['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-400'][i]}`} />
                </motion.div>
            ))}
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Booking Confirmed!</h2>
            <p className="text-slate-500 font-medium mb-8 text-lg">
              Your payment was successful and your spot is secured.
            </p>

            <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left space-y-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Verified</p>
                        <p className="text-xs text-slate-500 font-medium">Transaction completed successfully</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Saved to Bookings</p>
                        <p className="text-xs text-slate-500 font-medium">Check your dashboard for details</p>
                    </div>
                </div>
            </div>

            <Button 
                onClick={handleViewBookings}
                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-95"
            >
                View My Bookings <ArrowRight className="w-5 h-5" />
            </Button>
            
            <button 
                onClick={onClose}
                className="mt-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
            >
                Maybe Later
            </button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
