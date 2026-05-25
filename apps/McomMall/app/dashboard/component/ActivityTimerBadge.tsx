'use client';

import { FC, useState, useEffect, useRef } from 'react';
import { useGetTrialStatus } from '@/service/payments/hooks';
import { Timer, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <div className="w-12 h-3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!trialStatus || !trialStatus.isActive) {
    return null;
  }

  // Even if time is up, if it's active we should show something or the expired state
  const timeToShow = timeLeft > 0 ? formatTime(timeLeft) : 'Expired';

  return (
    <Link href="/dashboard/activity-timer">
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-all cursor-pointer group shadow-sm">
        <Timer className={`w-4 h-4 ${timeLeft > 0 ? 'text-orange-600' : 'text-gray-400'} group-hover:scale-110 transition-transform`} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-orange-400 leading-none uppercase tracking-wider">
            {trialStatus.isPaused ? 'Trial Paused' : 'Trial Ends In'}
          </span>
          <span className={`text-sm font-bold ${timeLeft > 0 ? 'text-orange-700' : 'text-gray-500'} tabular-nums`}>
            {trialStatus.isPaused ? 'PAUSED' : timeToShow}
          </span>
        </div>
      </div>
    </Link>
  );
};
