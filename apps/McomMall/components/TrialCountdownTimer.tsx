'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TimerIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronsRightLeft,
} from 'lucide-react';
import { usePauseOrPlay } from '@/service/payments/hooks';
import {
  TrialStatusResponse,
  TrialAction,
  TrialTasks,
} from '@/service/payments/types';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TrialCountdownTimerProps {
  trialStatus: TrialStatusResponse;
}

const TrialCountdownTimer: React.FC<TrialCountdownTimerProps> = ({
  trialStatus,
}) => {
  const {
    isPaused = false,
    isTrialPausable = false,
    remainingPauses = 0,
    remainingTime,
    tasks,
  } = trialStatus;
  const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();
  const [timeLeft, setTimeLeft] = useState(remainingTime);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

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

  const taskLabels: Record<keyof TrialTasks, string> = {
    createdBusiness: 'Create a business',
    createdProductOrService: 'Create a product or service',
    createdPromotion: 'Create a promotion',
    createdOffer: 'Create an offer',
    createdCoupon: 'Create a coupon',
  };

  const timeUnits = Object.entries(formattedTime);

  return (
    <motion.div
      layout
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-orange-600 text-white p-4 rounded-lg shadow-lg flex flex-col items-center space-y-2 cursor-grab"
      whileTap={{ cursor: 'grabbing' }}
    >
      <div className="flex items-center space-x-4">
        <TimerIcon className="w-8 h-8 flex-shrink-0" />
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{formattedTime.days}</span>
            <span className="text-xs uppercase">days left</span>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="flex items-center space-x-2"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
              >
                {timeUnits.slice(1).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center">
                    <span className="text-2xl font-bold">{value}</span>
                    <span className="text-xs uppercase">{unit}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ChevronsRightLeft className="w-6 h-6" />
          </Button>

          {isTrialPausable && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() =>
                  pauseOrPlay({
                    action: isPaused ? TrialAction.RESUME : TrialAction.PAUSE,
                  })
                }
                disabled={isPending || (!isPaused && remainingPauses <= 0)}
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
              <div className="text-sm">
                <p>{remainingPauses} Pauses Left</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <p className="text-sm cursor-pointer hover:underline">
              See your trial period tasks
            </p>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-gray-900 text-white">
            {Object.entries(tasks).map(([key, completed]) => (
              <DropdownMenuItem
                key={key}
                className="flex items-center justify-between"
              >
                <span>{taskLabels[key as keyof TrialTasks]}</span>
                {completed ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default TrialCountdownTimer;
