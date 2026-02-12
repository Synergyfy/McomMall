'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, ChevronRight } from 'lucide-react';
import { useGetTrialStatus, usePauseOrPlay } from '@/service/payments/hooks';
import { TrialAction } from '@/service/payments/types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const HeaderTimer = () => {
    const { data: trialStatus } = useGetTrialStatus();
    const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (trialStatus?.remainingTime) {
            setTimeLeft(trialStatus.remainingTime);
        }
    }, [trialStatus?.remainingTime]);

    useEffect(() => {
        if (!trialStatus || trialStatus.isPaused || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [trialStatus?.isPaused, timeLeft]);

    if (!trialStatus?.isActive) return null;

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white shadow-sm">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Timer className="w-4 h-4 text-orange-400 animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-orange-300 leading-none">Trial Ends In</span>
                    <span className="text-sm font-mono font-bold leading-none mt-0.5">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            <div className="h-4 w-[1px] bg-white/20 mx-1" />

            <div className="flex items-center gap-1">
                {trialStatus.isTrialPausable && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-white/20 text-white p-0"
                        onClick={() => pauseOrPlay({
                            action: trialStatus.isPaused ? TrialAction.RESUME : TrialAction.PAUSE
                        })}
                        disabled={isPending || (!trialStatus.isPaused && (trialStatus.remainingPauses ?? 0) <= 0)}
                    >
                        {trialStatus.isPaused ? (
                            <Play className="w-3.5 h-3.5 fill-current" />
                        ) : (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                        )}
                    </Button>
                )}

                <Link href="/dashboard/activity-timer">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-white/20 text-white p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default HeaderTimer;
