'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { useGetTrialStatus } from '@/service/payments/hooks';
import { Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const ActivityTimerBadge: FC = () => {
  const { data: trialStatus, isLoading } = useGetTrialStatus();
  const [timeLeft, setTimeLeft] = useState(0);
  const timerInitialized = useRef(false);

  useEffect(() => {
    if (trialStatus && !timerInitialized.current) {
      setTimeLeft(trialStatus.remainingTime);
      timerInitialized.current = true;
    }
  }, [trialStatus]);

  useEffect(() => {
    if (!trialStatus || trialStatus.isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [trialStatus]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!trialStatus || !trialStatus.isActive) {
    return null;
  }

  const timeToShow = timeLeft > 0 ? formatTime(timeLeft) : 'Expired';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all shadow-sm group">
          <Clock className={`w-4 h-4 ${timeLeft > 0 ? 'text-orange-600' : 'text-gray-400'} group-hover:scale-110 transition-transform`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 border-[#e8dbce] dark:border-[#4a3b2e]" align="end">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-orange-500 leading-none uppercase tracking-wider">
              {trialStatus.isPaused ? 'Trial Paused' : 'Trial Ends In'}
            </span>
            <span className={`text-lg font-bold ${timeLeft > 0 ? 'text-orange-700' : 'text-gray-500'} tabular-nums mt-1`}>
              {trialStatus.isPaused ? 'PAUSED' : timeToShow}
            </span>
          </div>
          <Link href="/dashboard/activity-timer">
            <span className="text-xs font-semibold text-[#f48c25] hover:underline">View Timer Details</span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
