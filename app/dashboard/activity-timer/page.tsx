"use client";

import { FC } from "react";
import { useGetActivityTimers } from "@/service/activity-timer/hook";
import { motion } from "framer-motion";
import { Loader, TimerOff } from "lucide-react";
import ActivityPageTimer from "@/components/ActivityPageTimer";

const ActivityTimerPage: FC = () => {
  const { data: timers, isLoading, error } = useGetActivityTimers();

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
            We couldn&apos;t load the activity timers. Please try again later.
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
            No Active Activity Timers
          </h2>
          <p className="text-gray-500 mt-2">
            No active activity timers found for your account.
          </p>
        </div>
      </div>
    );
  }

  const filteredTimers = timers.filter((t) => t.type !== 'GENERAL');

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white text-black p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
          >
            Your Activity Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-black"
          >
            Manage your active timers and complete tasks to unlock more features.
          </motion.p>
        </header>

        {filteredTimers.length > 0 ? (
          filteredTimers.map((timer) => (
            <ActivityPageTimer key={timer.id} timer={timer} />
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
             <p className="text-gray-500">No trial activities currently active.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimerPage;
