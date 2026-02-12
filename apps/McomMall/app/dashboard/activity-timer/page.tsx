"use client";

import { FC, useState, useEffect, useRef } from "react";
import { useGetTrialStatus, usePauseOrPlay } from "@/service/payments/hooks";
import { TrialAction, TrialTasks } from "@/service/payments/types";
import { motion } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
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
  // const { data: trialStatus, isLoading, error } = useGetTrialStatus();
  // const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();

  // Mock Data
  const isLoading = false;
  const error = null;
  const isPending = false;
  const pauseOrPlay = (data: any) => console.log("Mock pause/play", data);

  const trialStatus = {
    remainingTime: 43200000, // 12 hours - will definitely show in Expiring Soon
    isPaused: false,
    isActive: true,
    tasks: {
      createdBusiness: true,
      createdProductOrService: false,
      createdPromotion: false,
      createdOffer: false,
      createdCoupon: false,
    } as TrialTasks,
    pauses: [],
    isTrialPausable: true,
    remainingPauses: 3,
  };

  const [timeLeft, setTimeLeft] = useState(0);
  const timerInitialized = useRef(false);

  useEffect(() => {
    if (trialStatus && timerInitialized.current === false) {
      setTimeLeft(trialStatus.remainingTime);
      timerInitialized.current = true;
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
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const formattedTime = formatTime(timeLeft);

  // Check if expiring soon (less than 48 hours)
  const EXPIRING_SOON_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  const isExpiringSoon = timeLeft > 0 && timeLeft <= EXPIRING_SOON_THRESHOLD;

  // Debug logging
  console.log('Timer Debug:', {
    timeLeft,
    timeLeftHours: timeLeft / (1000 * 60 * 60),
    EXPIRING_SOON_THRESHOLD,
    thresholdHours: EXPIRING_SOON_THRESHOLD / (1000 * 60 * 60),
    isExpiringSoon
  });

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
            We couldn&apos;t load the trial status. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!trialStatus) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <TimerOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">
            No Active Activity Timer
          </h2>
          <p className="text-gray-500 mt-2">
            No active activity timer found for this business.
          </p>
        </div>
      </div>
    );
  }

  const { tasks, isPaused, isTrialPausable, remainingPauses } = trialStatus;

  const taskKeys = Object.keys(tasks) as (keyof TrialTasks)[];

  const taskDetails: Record<
    keyof TrialTasks,
    { title: string; description: string; url: string }
  > = {
    createdBusiness: {
      title: "Add Business Listing",
      description:
        "What it means: Create a profile for your business to start selling.",
      url: "/dashboard/add-listing",
    },
    createdProductOrService: {
      title: "Import your Contact Information",
      description: "What it means: Upload your contact database that you will like to let them know your offer on MCOM.",
      url: "/dashboard/my-profile",
    },
    createdPromotion: {
      title: "Add at least 1 product/service",
      description: "What it means: The business creates a product or service listing on the platform. How we check it: The system looks for at least one active product linked to the account.",
      url: "/dashboard/services/add-service",
    },
    createdOffer: {
      title: "List at least 1 barter offer",
      description: "What it means: The business publishes an offer they will barter or exchange with others. How we check it: The system checks that a barter offer record exists and is active.",
      url: "/dashboard/add-listing",
    },
    createdCoupon: {
      title: "Connect with at least 1 other business",
      description: "What it means: The business sends or accepts a connection (network) request with another verified business. How we check it: The system looks for at least one confirmed connection between accounts.",
      url: "/dashboard/messages",
    },
  };

  // Filter incomplete tasks for expiring soon section
  const incompleteTasks = taskKeys.filter(taskKey => !tasks[taskKey]);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white text-black p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Countdown Timer */}
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

          {isTrialPausable && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <Button
                onClick={() =>
                  pauseOrPlay({
                    action: isPaused ? TrialAction.RESUME : TrialAction.PAUSE,
                  })
                }
                disabled={
                  isPending || (!isPaused && (remainingPauses ?? 0) <= 0)
                }
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold w-full sm:w-auto"
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
              <span className="text-sm text-black">
                ({remainingPauses} pause
                {remainingPauses !== 1 ? "s" : ""} left)
              </span>
            </div>
          )}
        </motion.section>

        {/* Expiring Soon Section */}
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
                {incompleteTasks.map((taskKey) => {
                  const task = taskDetails[taskKey];
                  return (
                    <div
                      key={taskKey}
                      className="bg-white border-4 border-red-400 shadow-xl rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 hover:shadow-2xl hover:border-red-500 transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                          {task.title}
                        </h3>
                        <p className="text-base font-medium text-gray-700 mb-4">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-black text-red-700 bg-red-100 px-4 py-2 rounded-lg border-2 border-red-300 w-fit">
                          <Clock className="w-5 h-5" />
                          {formattedTime.days}d : {formattedTime.hours}h : {formattedTime.minutes}m remaining
                        </div>
                      </div>
                      <Link href={task.url} className="flex-shrink-0">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-black text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                          Complete Now
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* All Tasks Section */}
        <div className="w-full mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8 text-center sm:text-left sm:ml-4">
            Get started with Mcommall
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-0 sm:p-4">
            {taskKeys.map((taskKey, index) => {
              const task = taskDetails[taskKey];
              const isCompleted = tasks[taskKey];
              return (
                <div
                  key={taskKey}
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
                      {isCompleted ? (
                        <button className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-green-600 text-white w-full sm:w-auto">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Done
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                          <Link
                            href={task.url}
                            className="flex items-center justify-center sm:justify-start text-orange-500 hover:text-orange-400 font-medium text-sm w-full sm:w-auto"
                          >
                            Finish this activity
                          </Link>
                          <div className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                            <Clock className="w-3 h-3 mr-1" />
                            {formattedTime.days}d : {formattedTime.hours}h : {formattedTime.minutes}m
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimerPage;
