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
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StyledNumber from "@/components/svgs/StyledNumber";
import { useGetCapabilityEffectiveConfig, useGetCapabilityUsage } from "@/service/system/hook";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TimeCard: FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <div className="flex flex-col items-center justify-center bg-orange-600 p-4 rounded-lg w-24 h-24">
    <span className="text-4xl font-bold tracking-tight text-white">
      {value}
    </span>
    <span className="text-sm font-light uppercase text-white">{unit}</span>
  </div>
);

const ActivityTimerPage: FC = () => {
  const { data: timers, isLoading: timersLoading, error } = useGetActivityTimerStatus();
  const { data: config, isLoading: configLoading } = useGetCapabilityEffectiveConfig();
  const { data: usage, isLoading: usageLoading } = useGetCapabilityUsage();

  const { mutate: completeTask, isPending: isCompleting } = useCompleteTask();
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, number>>({});

  const isLoading = timersLoading || configLoading || usageLoading;

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
  // Determine if this is a trial account and filter timers accordingly
  const isTrialAccount = timers?.some(t => t.type === ActivityTimerType.TRIAL);
  const relevantTimers = isTrialAccount
    ? timers?.filter(t => t.type === ActivityTimerType.TRIAL) || []
    : timers?.filter(t => t.type === ActivityTimerType.GENERAL) || [];

  // Identify the primary timer for the top countdown: Prioritize Global Trial ending for trial accounts
  const nowTime = new Date().getTime();
  const allTrialTimers = relevantTimers.filter(t => t.type === ActivityTimerType.TRIAL);

  // Find the Global Trial Timer (usually the one that expires LATEST)
  const trialTimer = allTrialTimers.length > 0
    ? [...allTrialTimers].sort((a, b) => new Date(b.expiresAt!).getTime() - new Date(a.expiresAt!).getTime())[0]
    : null;

  const activeExpiringTimers = relevantTimers
    .filter(t => t.expiresAt && new Date(t.expiresAt).getTime() > nowTime)
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime());

  // Use Global Trial as primary if it exists, otherwise next earliest task
  const isTrialActive = trialTimer?.expiresAt && new Date(trialTimer.expiresAt).getTime() > nowTime;
  const primaryTimer = (isTrialActive ? trialTimer : activeExpiringTimers[0]) || relevantTimers[0];

  const timeLeft = timeLeftMap[primaryTimer.id] || 0;
  const formattedTime = formatTime(timeLeft);
  const EXPIRING_SOON_THRESHOLD = 48 * 60 * 60 * 1000;

  // Check if ANY active timer is expiring soon
  const expiringTimers = relevantTimers.filter(timer => {
    if (!timer.expiresAt) return false;
    const remaining = timeLeftMap[timer.id] || 0;
    return remaining > 0 && remaining <= EXPIRING_SOON_THRESHOLD;
  });

  const isExpiringSoon = expiringTimers.length > 0;

  // Aggregate all tasks from all timers and find the EARLIEST expiry for each task key
  // This ensures individual task cards show their specific deadline if it's shorter than the trial.
  const taskMap = new Map<string, any>();
  relevantTimers.forEach(timer => {
    timer.tasks.forEach(task => {
      const existing = taskMap.get(task.key);
      const timerExpiry = timer.expiresAt ? new Date(timer.expiresAt).getTime() : Infinity;

      if (!existing || timerExpiry < existing.expiresAtTime) {
        taskMap.set(task.key, {
          ...task,
          timerId: timer.id,
          expiresAtTime: timerExpiry,
          isTrialTask: timer.type === ActivityTimerType.TRIAL
        });
      }
    });
  });

  const allTasks = Array.from(taskMap.values()).map(task => {
    let isLocked = false;
    let lockReason = "";

    if (config?.quotas && usage) {
      if (task.key === 'CREATE_BUSINESS' && usage.currentListings >= config.quotas.maxListings) {
        isLocked = true;
        lockReason = "Max listings reached";
      }
      if (task.key === 'ADD_PRODUCT_SERVICE') {
        if (usage.currentProducts >= config.quotas.maxProducts) {
          isLocked = true;
          lockReason = "Max products reached";
        }
      }
      if (task.key === 'CREATE_COUPON' && usage.currentCoupons >= config.quotas.maxCouponTemplates) {
        isLocked = true;
        lockReason = "Max coupons reached";
      }
    }

    return { ...task, isLocked, lockReason };
  });

  // For the "Expiring Soon" section, show incomplete tasks from ONLY the expiring timers
  const urgentTasks = expiringTimers
    .flatMap(timer => timer.tasks.map(task => {
      const baseTask = allTasks.find(t => t.key === task.key);
      return { ...task, timerId: timer.id, isLocked: baseTask?.isLocked, lockReason: baseTask?.lockReason };
    }))
    .filter(t => !t.isCompleted);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white text-black p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
          >
            {trialTimer ? (
              new Date(trialTimer.expiresAt!).getTime() > nowTime
                ? "Your Trial Dashboard"
                : "Trial has ended"
            ) : "Your Activity Dashboard"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-black"
          >
            {trialTimer
              ? "Complete the tasks below to make the most of your trial period."
              : "Track your ongoing tasks and deadlines below."}
          </motion.p>
        </header>

        {primaryTimer.expiresAt && (
          <motion.section
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-4 cursor-help">
                    {Object.entries(formattedTime).map(([unit, value]) => (
                      <TimeCard key={unit} value={value} unit={unit} />
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-orange-600 text-white border-none p-3 shadow-2xl">
                  <p className="font-black uppercase tracking-widest text-xs mb-1">
                    {primaryTimer.type === ActivityTimerType.TRIAL
                      ? (timeLeft > 0 ? "Phase End" : "Status")
                      : "Target Task Reached"}
                  </p>
                  <p className="text-lg font-bold">
                    {primaryTimer.type === ActivityTimerType.TRIAL
                      ? (timeLeft > 0 ? "Trial Period" : "Trial has ended")
                      : ((primaryTimer as any).name || primaryTimer.tasks[0]?.title || "Current Goal")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.section>
        )}

        {isExpiringSoon && urgentTasks.length > 0 && (
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
                {urgentTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.key}
                    className={`bg-white border-4 ${task.isLocked ? 'border-gray-200 opacity-75' : 'border-red-400'} shadow-xl rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 hover:shadow-2xl transition-all relative overflow-hidden`}
                  >
                    {task.isLocked && (
                      <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center z-20 backdrop-blur-[1px]">
                        <div className="bg-white border-2 border-gray-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                          <Lock size={16} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{task.lockReason || 'Locked'}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 mb-1">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-3 px-3 py-1 bg-red-50 border border-red-100 rounded-lg w-fit">
                        <Clock size={14} className="text-red-600 animate-pulse" />
                        <span className="text-xs font-black text-red-700 uppercase tracking-widest">
                          {formatTime(timeLeftMap[(task as any).timerId]).days}D : {formatTime(timeLeftMap[(task as any).timerId]).hours}H : {formatTime(timeLeftMap[(task as any).timerId]).minutes}M : {formatTime(timeLeftMap[(task as any).timerId]).seconds}S
                        </span>
                      </div>
                      <p className="text-base font-medium text-gray-700 mb-4">
                        {task.description}
                      </p>
                    </div>
                    <Link href={task.isLocked ? '#' : (task.url || '#')} className="flex-shrink-0">
                      <Button
                        disabled={task.isLocked}
                        className="bg-red-600 hover:bg-red-700 text-white font-black text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                      >
                        {task.isLocked ? 'Locked' : 'Complete Now'}
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
            {trialTimer ? "Get started with Mcommall" : "Your Active Tasks"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-0 sm:p-4">
            {allTasks.map((task, index) => (
              <div
                key={`${task.key}-${index}`}
                className={`bg-white border-2 ${task.isLocked ? 'border-gray-200 opacity-80' : 'border-orange-400'} shadow-xl rounded-2xl p-4 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 relative overflow-hidden`}
              >
                {task.isLocked && (
                  <div className="absolute inset-0 bg-gray-50/40 flex items-center justify-center z-20 backdrop-blur-[1px]">
                    <div className="bg-white border-2 border-gray-200 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                      <Lock size={16} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{task.lockReason || 'Locked'}</span>
                    </div>
                  </div>
                )}
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
                    {timeLeftMap[(task as any).timerId] > 0 ? (
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-4 py-2 px-4 bg-orange-50 border-2 border-orange-200 rounded-xl w-fit mx-auto sm:mx-0 shadow-sm">
                        <Clock size={16} className="text-orange-600 animate-pulse" />
                        <span className="text-xs font-black text-orange-700 uppercase tracking-widest">
                          {(formatTime(timeLeftMap[(task as any).timerId])).days}D : {(formatTime(timeLeftMap[(task as any).timerId])).hours}H : {(formatTime(timeLeftMap[(task as any).timerId])).minutes}M : {(formatTime(timeLeftMap[(task as any).timerId])).seconds}S
                        </span>
                      </div>
                    ) : (
                      relevantTimers.find(t => t.id === (task as any).timerId)?.expiresAt && !task.isCompleted && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-4 py-2 px-4 bg-red-50 border-2 border-red-200 rounded-xl w-fit mx-auto sm:mx-0 shadow-sm">
                          <TimerOff size={16} className="text-red-600" />
                          <span className="text-xs font-black text-red-700 uppercase tracking-widest">
                            Expired
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start mt-auto">
                    {task.isCompleted ? (
                      <button className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-green-600 text-white w-full sm:w-auto">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Done
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        {task.url && (
                          <Link
                            href={task.isLocked ? '#' : task.url}
                            className={`flex items-center justify-center sm:justify-start font-medium text-sm w-full sm:w-auto ${task.isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-orange-500 hover:text-orange-400'}`}
                          >
                            Finish this activity
                          </Link>
                        )}
                        {task.key === 'OTHER' && (
                          <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1"
                            onClick={() => completeTask(task.key)}
                            disabled={isCompleting || task.isLocked}
                          >
                            {isCompleting ? <Loader className="w-3 h-3 animate-spin" /> : 'Mark as Done'}
                          </Button>
                        )}
                      </div>
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
};

export default ActivityTimerPage;
