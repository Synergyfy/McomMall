'use client';

import { FC, useState, useEffect } from 'react';
import { ActiveTimerResponse } from '@/service/activity-timer/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface FloatingTrialTimerProps {
    timer: ActiveTimerResponse;
}

export const FloatingTrialTimer: FC<FloatingTrialTimerProps> = ({ timer }) => {
    const [timeLeft, setTimeLeft] = useState(timer.remainingTime);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (timer.isPaused || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [timer.isPaused, timeLeft]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return {
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
        };
    };

    const formattedTime = formatTime(timeLeft);
    const isExpired = timeLeft <= 0;

    if (!isVisible && !isExpired) {
        // Optional: Add a small trigger button if closed?
        // For now, let's just let it be closed until refresh if user closes it.
        // Or usually floating timers shouldn't be closable if critical.
        // Let's keep it simple.
    }

    return (
        <AnimatePresence>
            {(isVisible) && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
                >
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-md flex items-center gap-4 min-w-[300px]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20 animate-pulse">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5">
                                    Trial Ending In
                                </p>
                                <div className="flex items-baseline gap-1 font-mono text-xl font-bold leading-none">
                                    <span>{formattedTime.days}<span className="text-xs text-slate-500 font-sans ml-0.5 mr-1.5">d</span></span>
                                    <span>{formattedTime.hours}<span className="text-xs text-slate-500 font-sans ml-0.5 mr-1.5">h</span></span>
                                    <span>{formattedTime.minutes}<span className="text-xs text-slate-500 font-sans ml-0.5 mr-1.5">m</span></span>
                                    <span className="text-orange-500">{formattedTime.seconds}<span className="text-xs text-slate-500 font-sans ml-0.5">s</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Optional Close or Minify Logic - kept simple for now */}
                        {/* <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white ml-auto" onClick={() => setIsVisible(false)}>
                  <X className="w-4 h-4" />
              </Button> */}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
