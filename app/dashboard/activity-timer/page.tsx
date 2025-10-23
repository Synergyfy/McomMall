'use client';

import { FC, useState, useEffect } from 'react';
import { useGetTrialStatus, usePauseOrPlay } from '@/service/payments/hook';
import {
  TrialAction,
  TrialTasks,
  TrialStatusResponse,
} from '@/service/payments/types';
import { motion } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Loader,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TaskItem: FC<{ completed: boolean; label: string }> = ({
  completed,
  label,
}) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
      completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
    }`}
  >
    <span className="font-medium">{label}</span>
    {completed ? (
      <CheckCircle2 className="w-6 h-6 text-green-500" />
    ) : (
      <XCircle className="w-6 h-6 text-red-400" />
    )}
  </motion.li>
);

const TimeCard: FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <div className="flex flex-col items-center justify-center bg-gray-800 p-4 rounded-lg w-24 h-24">
    <span className="text-4xl font-bold tracking-tight">{value}</span>
    <span className="text-sm font-light uppercase text-gray-400">{unit}</span>
  </div>
);

const ActivityTimerPage: FC = () => {
  const { data: trialStatus, isLoading, error } = useGetTrialStatus();
  const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();
  const [timeLeft, setTimeLeft] = useState(trialStatus?.remainingTime ?? 0);

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
  const completedTasks = Object.values(tasks).filter(Boolean).length;
  const totalTasks = Object.keys(tasks).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const taskLabels: Record<keyof TrialTasks, string> = {
    createdBusiness: 'Create a business profile',
    createdProductOrService: 'Add your first product or service',
    createdPromotion: 'Create a special promotion',
    createdOffer: 'Launch an exciting offer',
    createdCoupon: 'Generate a discount coupon',
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

        {/* Progress Bar and Task List */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 p-6 rounded-xl shadow-2xl"
        >
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Your Progress</h3>
              <span className="text-lg font-bold text-orange-400">
                {completedTasks} / {totalTasks} Done
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <motion.div
                className="bg-orange-600 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>
          </div>

          <ul className="space-y-4">
            {Object.entries(tasks).map(([key, completed]) => (
              <TaskItem
                key={key}
                completed={completed}
                label={taskLabels[key as keyof TrialTasks]}
              />
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  );
};

export default ActivityTimerPage;
