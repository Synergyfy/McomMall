'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, ChevronRight, AlertCircle } from 'lucide-react';
import { useGetActivityTimerStatus, usePauseActivityTimer, useResumeActivityTimer } from '@/service/activity-timer/hook';
import { ActivityTimerType, ActiveTimerResponse } from '@/service/activity-timer/types';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const HeaderTimer = () => {
    const { data: allTimers, isLoading } = useGetActivityTimerStatus();
    const { mutate: pauseTimer, isPending: isPausing } = usePauseActivityTimer();
    const { mutate: resumeTimer, isPending: isResuming } = useResumeActivityTimer();

    const [timeLeft, setTimeLeft] = useState(0);

    // Select the timer to display
    const activeTimer = useMemo(() => {
        if (!allTimers || allTimers.length === 0) return null;

        const now = new Date().getTime();

        // 1. For Trial Accounts: Prioritize the Global Trial (latest expiring TRIAL timer)
        const trialTimers = allTimers.filter(t => t.type === ActivityTimerType.TRIAL && !t.completedAt);
        if (trialTimers.length > 0) {
            return [...trialTimers].sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())[0];
        }

        // 2. Otherwise: Find the absolute earliest expiring timer that hasn't passed yet
        const expiringSoon = allTimers
            .filter(t => t.expiresAt && new Date(t.expiresAt).getTime() > now && !t.completedAt)
            .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

        return expiringSoon[0] || allTimers[0];
    }, [allTimers]);

    useEffect(() => {
        if (!activeTimer || !activeTimer.expiresAt || activeTimer.isPaused) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(activeTimer.expiresAt).getTime();
            const remaining = Math.max(0, end - now);
            setTimeLeft(remaining);
        };

        // Initial update
        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [activeTimer?.expiresAt, activeTimer?.isPaused]);

    if (isLoading || !activeTimer) return null;

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const isExpiringSoon = timeLeft < 24 * 60 * 60 * 1000; // Less than 24 hours
    const isTrial = activeTimer.type === ActivityTimerType.TRIAL;

    return (
        <div className={cn(
            "flex items-center gap-3 backdrop-blur-md border rounded-full px-4 py-1.5 text-white shadow-sm transition-all duration-300",
            isExpiringSoon ? "bg-red-500/20 border-red-500/30" : "bg-white/10 border-white/20"
        )}>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Timer className={cn(
                        "w-4 h-4 transition-colors",
                        isExpiringSoon ? "text-red-400 animate-pulse" : "text-orange-400"
                    )} />
                </div>
                <div className="flex flex-col">
                    <span className={cn(
                        "text-[10px] uppercase font-black leading-none tracking-wider truncate max-w-[120px]",
                        isExpiringSoon ? "text-red-300" : "text-orange-300"
                    )}>
                        {isTrial && timeLeft === 0
                            ? "Trial has ended"
                            : ((activeTimer as any).name || activeTimer.tasks[0]?.title || (isTrial ? "Trial Ends In" : "Task Due In"))
                        }
                    </span>
                    <span className="text-sm font-mono font-bold leading-none mt-0.5 whitespace-nowrap">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            <div className="h-4 w-[1px] bg-white/20 mx-1" />

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-white/20 text-white p-0"
                    onClick={() => activeTimer.isPaused ? resumeTimer() : pauseTimer()}
                    disabled={isPausing || isResuming}
                    title={activeTimer.isPaused ? "Resume Timer" : "Pause Timer"}
                >
                    {activeTimer.isPaused ? (
                        <Play className="w-3.5 h-3.5 fill-current" />
                    ) : (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                    )}
                </Button>

                <Link href="/dashboard/activity-timer">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-white/20 text-white p-0"
                        title="View All Timers"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default HeaderTimer;
