'use client';

import { FC, useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetActivityTimerStatus } from '@/service/activity-timer/hook';
import { ActivityTimerType } from '@/service/activity-timer/types';

export const ActivityTimerBadge: FC = () => {
  const { data: timers, isLoading } = useGetActivityTimerStatus();
  const [timeLeft, setTimeLeft] = useState(0);

  // Show the trial countdown when the business is on a trial, otherwise the
  // next expiring activity task.
  const now = Date.now();
  const trialTimer = (timers || []).find(
    (timer) =>
      timer.type === ActivityTimerType.TRIAL &&
      new Date(timer.expiresAt).getTime() > now,
  );
  const nextExpiringTimer = (timers || [])
    .filter((timer) => new Date(timer.expiresAt).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    )[0];
  const timer = trialTimer || nextExpiringTimer;

  useEffect(() => {
    if (!timer) return;

    if (timer.isPaused) {
      setTimeLeft(timer.remainingTime);
      return;
    }

    const update = () => {
      setTimeLeft(
        Math.max(0, new Date(timer.expiresAt).getTime() - Date.now()),
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!timer) return null;

  const isExpired =
    !timer.isPaused && new Date(timer.expiresAt).getTime() <= Date.now();
  const displayTime = timeLeft > 0 ? timeLeft : timer.remainingTime;
  const isTrial = timer.type === ActivityTimerType.TRIAL;
  const label = timer.isPaused
    ? 'Timer Paused'
    : isExpired
      ? 'Timer Ended'
      : isTrial
        ? 'Trial Ends In'
        : 'Next Task Ends In';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Activity timer"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all shadow-sm group"
        >
          <Clock
            className={`w-4 h-4 ${isExpired ? 'text-gray-400' : 'text-orange-600'} group-hover:scale-110 transition-transform`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-4 border-[#e8dbce] dark:border-[#4a3b2e]"
        align="end"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-orange-500 leading-none uppercase tracking-wider">
              {label}
            </span>
            <span
              className={`text-lg font-bold ${isExpired ? 'text-gray-500' : 'text-orange-700'} tabular-nums mt-1`}
            >
              {timer.isPaused ? 'PAUSED' : isExpired ? 'Expired' : formatTime(displayTime)}
            </span>
          </div>
          <Link href="/dashboard/activity-timer">
            <span className="text-xs font-semibold text-[#f48c25] hover:underline">
              View Timer Details
            </span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
