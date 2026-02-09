"use client";

import { FC } from "react";
import { useGetActivityTimerStatus, usePauseActivityTimer, useResumeActivityTimer } from "@/service/activity-timer/hook";
import { motion } from "framer-motion";
import {
  Loader,
  TimerOff,
} from "lucide-react";
import { ActivityTimerCard } from "@/components/dashboard/ActivityTimerCard";

const ActivityTimerPage: FC = () => {
  const { data: timers, isLoading, error } = useGetActivityTimerStatus();
  const { mutate: pauseTimer, isPending: isPausing } = usePauseActivityTimer();
  const { mutate: resumeTimer, isPending: isResuming } = useResumeActivityTimer();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader className="w-12 h-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">
            An Error Occurred
          </h2>
          <p className="text-gray-500 mt-2">
            We couldn&apos;t load your activity timers. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!timers || timers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <TimerOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">
            No Active Timers
          </h2>
          <p className="text-gray-500 mt-2">
            You don&apos;t have any active trials or challenges at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50/30 text-black p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900"
          >
            Activity & Trial Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Track your progress, complete tasks, and unlock exclusive rewards while you build your business presence.
          </motion.p>
        </header>

        {/* Timers Grid */}
        <div className="space-y-8">
          {timers.map((timer) => (
            <ActivityTimerCard
              key={timer.id}
              timer={timer}
              onPause={() => pauseTimer()}
              onResume={() => resumeTimer()}
              isActionPending={isPausing || isResuming}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimerPage;
