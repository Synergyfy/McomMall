"use client";

import { FC, useState, useEffect } from "react";
import { useGetActivityTimerStatus, useCompleteTask } from "@/service/activity-timer/hook";
import { ActivityTimerType } from "@/service/activity-timer/types";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader,
  TimerOff,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StyledNumber from "@/components/svgs/StyledNumber";

const TimeCard: FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <div className="flex flex-col items-center justify-center bg-orange-600 p-4 rounded-lg w-24 h-24">
    <span className="text-4xl font-bold tracking-tight text-white">
      {value}
    </span>
    <span className="text-sm font-light uppercase text-white">{unit}</span>
  </div>
);

const ActivityTimerPage: FC = () => {
  const { data: timers, isLoading, error } = useGetActivityTimerStatus();
  const { mutate: completeTask, isPending: isCompleting } = useCompleteTask();
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!timers) return;

    const updateTimers = () => {
      const now = new Date().getTime();
      const newMap: Record<string, number> = {};
      
      timers.forEach(timer => {
        if (timer.expiresAt) {
          const end = new Date(timer.expiresAt).getTime();
          newMap[timer.id] = Math.max(0, end - now);
        } else {
          newMap[timer.id] = 0;
        }
      });
      
      setTimeLeftMap(newMap);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [timers]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

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
            We couldn&apos;t load the activity status. Please try again later.
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
            You have no pending activity tasks at the moment.
          </p>
        </div>
      </div>
    );
  }

  // Check for Trial Timer
  const trialTimer = timers.find(t => t.type === ActivityTimerType.TRIAL);

  if (trialTimer) {
    const timeLeft = timeLeftMap[trialTimer.id] || 0;
    const formattedTime = formatTime(timeLeft);
    const EXPIRING_SOON_THRESHOLD = 48 * 60 * 60 * 1000;
    const isExpiringSoon = timeLeft > 0 && timeLeft <= EXPIRING_SOON_THRESHOLD;
    const incompleteTasks = trialTimer.tasks.filter(t => !t.isCompleted);

    return (
      <div className="min-h-[calc(100vh-8rem)] bg-white text-black p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
            >
              Your Trial Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-base sm:text-lg text-black"
            >
              Complete the tasks below to make the most of your trial period.
            </motion.p>
          </header>

          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4">
              {Object.entries(formattedTime).map(([unit, value]) => (
                <TimeCard key={unit} value={value} unit={unit} />
              ))}
            </div>
          </motion.section>

          {isExpiringSoon && incompleteTasks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-red-100 to-orange-100 border-4 border-red-400 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-red-900 tracking-tight">
                      ⚡ EXPIRING SOON
                    </h2>
                    <p className="text-base font-bold text-red-800 mt-1">
                      Less than 48 hours remaining! Complete these tasks urgently.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {incompleteTasks.map((task) => (
                    <div
                      key={task.key}
                      className="bg-white border-4 border-red-400 shadow-xl rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 hover:shadow-2xl hover:border-red-500 transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                          {task.title}
                        </h3>
                        <p className="text-base font-medium text-gray-700 mb-4">
                          {task.description}
                        </p>
                      </div>
                      <Link href={task.url || '#'} className="flex-shrink-0">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-black text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                          Complete Now
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          <div className="w-full mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8 text-center sm:text-left sm:ml-4">
              Get started with Mcommall
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-0 sm:p-4">
              {trialTimer.tasks.map((task, index) => (
                <div
                  key={task.key}
                  className="bg-white border-2 border-orange-400 shadow-xl rounded-2xl p-4 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4"
                >
                  <div className="w-full sm:w-1/3 flex items-center justify-center text-orange-500">
                    <span className="text-orange-500 transform scale-75 sm:scale-100">
                      <StyledNumber number={index + 1} />
                    </span>
                  </div>
                  <div className="w-full sm:w-2/3 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 text-center sm:text-left">
                        {task.title}
                      </h3>
                      <p className="text-black mb-4 text-sm text-center sm:text-left">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start mt-auto">
                      {task.isCompleted ? (
                        <button className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-green-600 text-white w-full sm:w-auto">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Done
                        </button>
                      ) : (
                        <Link
                          href={task.url || '#'}
                          className="flex items-center justify-center sm:justify-start text-orange-500 hover:text-orange-400 font-medium text-sm w-full sm:w-auto"
                        >
                          Finish this activity
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paid / General Timers View
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Activity Timers
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Track your ongoing tasks and deadlines.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timers.map((timer) => {
            const timeLeft = timeLeftMap[timer.id] || 0;
            const ft = formatTime(timeLeft);
            // Assuming individual timer has only one task in 'tasks' array as per backend logic
            const task = timer.tasks[0]; 
            const isCompleted = task?.isCompleted;
            const isOther = task?.key === 'OTHER';

            return (
              <motion.div
                key={timer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{timer.name}</h3>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Clock className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{timer.description}</p>
                  
                  {timer.expiresAt && !isCompleted && (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 mb-4">
                      <p className="text-xs font-semibold text-orange-800 uppercase mb-1">Time Remaining</p>
                      <div className="text-2xl font-mono font-bold text-orange-600">
                        {ft.days}d {ft.hours}h {ft.minutes}m
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  {isCompleted ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  ) : (
                    <div className="flex gap-2">
                        {timer.type === 'GENERAL' && task?.url && (
                             <Link href={task.url} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    View Task
                                </Button>
                             </Link>
                        )}
                        {isOther && (
                            <Button 
                                className="flex-1" 
                                onClick={() => completeTask(task.key)}
                                disabled={isCompleting}
                            >
                                {isCompleting ? <Loader className="w-4 h-4 animate-spin" /> : 'Mark as Done'}
                            </Button>
                        )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimerPage;
