'use client';

import { FC, useState, useEffect } from 'react';
import { useGetTrialStatus, usePauseOrPlay } from '@/service/payments/hook';
import {
  TrialAction,
  TrialTasks,
} from '@/service/payments/types';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  CheckCircle2,
  Loader,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TimeCard: FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg w-24 h-24">
    <span className="text-4xl font-bold tracking-tight">{value}</span>
    <span className="text-sm font-light uppercase text-gray-400">{unit}</span>
  </div>
);

const LeafIcon = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute text-green-500 opacity-30"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
        fill="currentColor"
      />
      <path
        d="M12 6C9.24 6 7 8.24 7 11C7 12.76 7.85 14.33 9.13 15.24C9.05 15.52 9 15.81 9 16.11C9 17.16 9.84 18 10.89 18H13.11C14.16 18 15 17.16 15 16.11C15 15.81 14.95 15.52 14.87 15.24C16.15 14.33 17 12.76 17 11C17 8.24 14.76 6 12 6ZM12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14Z"
        fill="currentColor"
      />
    </svg>
  );

const ActivityTimerPage: FC = () => {
  const { data: trialStatus, isLoading, error } = useGetTrialStatus();
  const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();
  const [timeLeft, setTimeLeft] = useState(trialStatus?.remainingTime ?? 0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (trialStatus) {
      setTimeLeft(trialStatus.remainingTime);
    }
  }, [trialStatus]);

  useEffect(() => {
    if (trialStatus?.isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [trialStatus?.isPaused]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader className="w-12 h-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error || !trialStatus) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">
            An Error Occurred
          </h2>
          <p className="text-gray-500 mt-2">
            We couldn&apos;t load the trial status. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const {
    tasks,
    isPaused,
    isTrialPausable,
    remainingPauses,
  } = trialStatus;

  const taskKeys = Object.keys(tasks) as (keyof TrialTasks)[];
  const currentTaskKey = taskKeys[currentIndex];
  const isCompleted = tasks[currentTaskKey];

  const taskDetails: Record<keyof TrialTasks, { title: string; description: string }> = {
    createdBusiness: {
      title: 'Create a business profile',
      description: 'You need a business profile to start selling. Create one now.',
    },
    createdProductOrService: {
      title: 'Add your first product or service',
      description: 'Add your first product or service to your store.',
    },
    createdPromotion: {
      title: 'Create a special promotion',
      description: 'Create a special promotion to attract customers.',
    },
    createdOffer: {
      title: 'Launch an exciting offer',
      description: 'Launch an exciting offer to get more sales.',
    },
    createdCoupon: {
      title: 'Generate a discount coupon',
      description: 'Generate a discount coupon to reward your customers.',
    },
  };

  const currentTask = taskDetails[currentTaskKey];

  const handleNext = () => {
    if (currentIndex < taskKeys.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Your Trial Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            Complete the tasks below to make the most of your trial period.
          </motion.p>
        </header>

        {/* Countdown Timer */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-4">
            {Object.entries(formattedTime).map(([unit, value]) => (
              <TimeCard key={unit} value={value} unit={unit} />
            ))}
          </div>

          {isTrialPausable && (
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Button
                onClick={() =>
                  pauseOrPlay({
                    action: isPaused ? TrialAction.RESUME : TrialAction.PAUSE,
                  })
                }
                disabled={isPending || (!isPaused && (remainingPauses ?? 0) <= 0)}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                {isPending ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : isPaused ? (
                  <>
                    <PlayIcon className="w-5 h-5 mr-2" /> Resume
                  </>
                ) : (
                  <>
                    <PauseIcon className="w-5 h-5 mr-2" /> Pause
                  </>
                )}
              </Button>
              <span className="text-sm text-gray-400">
                ({remainingPauses} pause
                {remainingPauses !== 1 ? 's' : ''} left)
              </span>
            </div>
          )}
        </motion.section>

        {/* New Task Display */}
        <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-200 mb-8 ml-4">
            Get started with Brevo
            </h2>
            <div className="bg-gray-800 shadow-xl rounded-2xl p-8 flex items-center">
            <div className="relative w-1/3 flex items-center justify-center">
                <span className="text-9xl font-extrabold text-gray-700 select-none">
                {currentIndex + 1}
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                <LeafIcon />
                </div>
            </div>
            <div className="w-2/3 pl-12">
                <h3 className="text-2xl font-bold text-white mb-3">
                {currentTask.title}
                </h3>
                <p className="text-gray-400 mb-6">{currentTask.description}</p>
                <div className="flex items-center justify-between">
                  <button
                  className={`flex items-center justify-center px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                  >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Done
                  </button>
                  <button
                      onClick={handleNext}
                      className="flex items-center text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                      disabled={currentIndex >= taskKeys.length - 1}
                  >
                      Next activity <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimerPage;