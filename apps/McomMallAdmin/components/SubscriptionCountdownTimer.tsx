'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimerIcon, PlayIcon, PauseIcon } from 'lucide-react';
import { Subscription } from '@/service/payments/subscription.types';
import { usePauseOrPlay } from '@/service/payments/hook';
import { PaygOption, TrialAction } from '@/service/payments/types';
import { Button } from './ui/button';

interface SubscriptionCountdownTimerProps {
  subscription: Subscription;
}

function getTrialDurationInMs(paygOption: PaygOption): number {
  const daysMap: Record<PaygOption, number> = {
    [PaygOption.NINETY_DAYS]: 90,
    [PaygOption.ONE_EIGHTY_DAYS]: 180,
    [PaygOption.TWO_SEVENTY_DAYS]: 270,
  };
  const days = daysMap[paygOption] || 0;
  return days * 24 * 60 * 60 * 1000;
}

const SubscriptionCountdownTimer: React.FC<SubscriptionCountdownTimerProps> = ({
  subscription,
}) => {
  const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  console.log(subscription.isPaused);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const { startedAt, totalPausedDuration, isPaused, pausedAt, paygOption } =
        subscription;
      console.log('in effect', isPaused);

      const trialDuration = getTrialDurationInMs(paygOption);
      const startTime = new Date(startedAt).getTime();

      let ongoingPauseDuration = 0;
      if (isPaused && pausedAt) {
        ongoingPauseDuration =
          new Date().getTime() - new Date(pausedAt).getTime();
      }

      const trialEndDate =
        startTime + trialDuration + totalPausedDuration + ongoingPauseDuration;
      const difference = trialEndDate - new Date().getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    if (subscription.isPaused) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerId);
  }, [subscription]);

  const handleTogglePause = () => {
    const action = subscription.isPaused
      ? TrialAction.RESUME
      : TrialAction.PAUSE;
    pauseOrPlay({ action });
  };

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => (
    <div key={interval} className="flex flex-col items-center">
      <span className="text-2xl font-bold">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs uppercase">{interval}</span>
    </div>
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-orange-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4"
    >
      <TimerIcon className="w-8 h-8" />
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">Trial Period Ends In:</h3>
        <div className="flex space-x-2">{timerComponents}</div>
      </div>
      <Button
        onClick={handleTogglePause}
        disabled={isPending}
        variant="ghost"
        size="icon"
        className="rounded-full"
      >
        {subscription.isPaused ? (
          <PlayIcon className="w-6 h-6" />
        ) : (
          <PauseIcon className="w-6 h-6" />
        )}
      </Button>
    </motion.div>
  );
};

export default SubscriptionCountdownTimer;
