"use client";

import { FC, useState, useEffect, useRef } from "react";
import { ActivityTimer, ActivityTimerTask } from "@/service/activity-timer/types";
import { usePauseOrPlay } from "@/service/payments/hook";
import { TrialAction } from "@/service/payments/types";
import { motion } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  CheckCircle2,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import StyledNumber from "@/components/svgs/StyledNumber";

const TimeCard: FC<{ value: string; unit: string }> = ({ value, unit }) => (
  <div className="flex flex-col items-center justify-center bg-orange-600 p-4 rounded-lg w-20 h-20 sm:w-24 sm:h-24">
    <span className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
      {value}
    </span>
    <span className="text-[10px] sm:text-sm font-light uppercase text-white">{unit}</span>
  </div>
);

interface ActivityPageTimerProps {
  timer: ActivityTimer;
}

const ActivityPageTimer: FC<ActivityPageTimerProps> = ({ timer }) => {
  const { mutate: pauseOrPlay, isPending } = usePauseOrPlay();
  const [timeLeft, setTimeLeft] = useState(timer.remainingTime);
  const timerInitialized = useRef(false);

  useEffect(() => {
    if (timer && !timerInitialized.current) {
      setTimeLeft(timer.remainingTime);
      timerInitialized.current = true;
    }
  }, [timer]);

  useEffect(() => {
    if (timer.isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1000 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isPaused]);

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

  // Derive pause info
  const maxPauses = 2;
  const pausesCount = timer.pauses?.length || 0;
  const remainingPauses = Math.max(0, maxPauses - pausesCount);
  const isPausable = remainingPauses > 0;

  return (
    <div className="mb-12 last:mb-0">
      <header className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {timer.name} Dashboard
        </motion.h2>
        <p className="mt-2 text-gray-600">
          {timer.description}
        </p>
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

        {(isPausable || timer.isPaused) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <Button
              onClick={() =>
                pauseOrPlay({
                  action: timer.isPaused ? TrialAction.RESUME : TrialAction.PAUSE,
                  timerId: timer.id,
                })
              }
              disabled={
                isPending || (!timer.isPaused && remainingPauses <= 0)
              }
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold w-full sm:w-auto"
            >
              {isPending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : timer.isPaused ? (
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

      {/* Task Display */}
      <div className="w-full mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-black mb-6 text-center sm:text-left sm:ml-4">
          Tasks to complete
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-0 sm:p-4">
          {timer.tasks.map((task, index) => {
            return (
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
                    <h4 className="text-lg font-bold text-gray-900 mb-2 text-center sm:text-left">
                      {task.title}
                    </h4>
                    <p className="text-black mb-4 text-sm text-center sm:text-left">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start mt-auto">
                    {task.isCompleted ? (
                      <button className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-green-600 text-white w-full sm:w-auto cursor-default">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Done
                      </button>
                    ) : (
                      <Link
                        href={task.url}
                        className="flex items-center justify-center sm:justify-start text-orange-500 hover:text-orange-400 font-medium text-sm w-full sm:w-auto"
                      >
                        Finish this activity
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-b border-gray-200 my-12" />
    </div>
  );
};

export default ActivityPageTimer;
