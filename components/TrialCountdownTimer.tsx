'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TimerIcon, PlayIcon, PauseIcon } from 'lucide-react';
import { usePauseOrPlay } from '@/service/payments/hook';
import { TrialAction } from '@/service/payments/types';
import { Button } from './ui/button';

interface TrialCountdownTimerProps {
  trialEndDate: string;
  isPaused: boolean;
  isTrialPausable: boolean;
}

const TrialCountdownTimer: React.FC<TrialCountdownTimerProps> = ({
  trialEndDate,
  isPaused,
  isTrialPausable,
}) => {
  const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(trialEndDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }, [trialEndDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, calculateTimeLeft]);

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
    if ((value as number) < 0) {
      return null;
    }

    return (
      <div key={interval} className="flex flex-col items-center">
        <span className="text-2xl font-bold">
          {String(value).padStart(2, '0')}
        </span>
        <span className="text-xs uppercase">{interval}</span>
      </div>
    );
  });

  if (!timerComponents.length) {
    return null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-orange-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 cursor-grab"
      whileTap={{ cursor: 'grabbing' }}
    >
      <TimerIcon className="w-8 h-8" />
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">Trial Period Ends In:</h3>
        <div className="flex space-x-2">{timerComponents}</div>
      </div>
      {isTrialPausable && (
        <Button
          onClick={() =>
            pauseOrPlay({
              action: isPaused ? TrialAction.RESUME : TrialAction.PAUSE,
            })
          }
          disabled={isPending}
          variant="ghost"
          size="icon"
          className="rounded-full"
        >
          {isPaused ? (
            <PlayIcon className="w-6 h-6" />
          ) : (
            <PauseIcon className="w-6 h-6" />
          )}
        </Button>
      )}
    </motion.div>
  );
};

export default TrialCountdownTimer;
