"use client";

import { FC, useState, useEffect, useRef } from "react";
import { ActivityTimer } from "@/service/activity-timer/types";
import { usePauseOrResumeActivityTimer } from "@/service/activity-timer/hook";
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
  <div className="flex flex-col items-center justify-center bg-orange-600 p-2 rounded-xl min-w-[70px] sm:min-w-[80px]">
    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
      {value}
    </span>
    <span className="text-[10px] font-medium uppercase text-white/90 mt-1">{unit}</span>
  </div>
);

interface ActivityPageTimerProps {
  timer: ActivityTimer;
}

const ActivityPageTimer: FC<ActivityPageTimerProps> = ({ timer }) => {
  const { mutate: pauseOrPlay, isPending } = usePauseOrResumeActivityTimer();
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
    <div className="mb-12 last:mb-0 bg-white border border-gray-200 shadow-sm rounded-[2.5rem] overflow-hidden">
      <div className="p-6 sm:p-10 md:p-12">
        {/* Activity Header with Integrated Timer */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
            >
              {timer.name}
            </motion.h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl">
              {timer.description}
            </p>
          </div>

          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(formattedTime).map(([unit, value]) => (
                <TimeCard key={unit} value={value} unit={unit} />
              ))}
            </div>

            {(isPausable || timer.isPaused) && (
              <div className="flex items-center gap-3">
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
                  variant="outline"
                  size="sm"
                  className="rounded-full h-9 px-4 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold"
                >
                  {isPending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : timer.isPaused ? (
                    <>
                      <PlayIcon className="w-4 h-4 mr-2" /> Resume
                    </>
                  ) : (
                    <>
                      <PauseIcon className="w-4 h-4 mr-2" /> Pause
                    </>
                  )}
                </Button>
                <span className="text-xs font-medium text-gray-400">
                  {remainingPauses} pause{remainingPauses !== 1 ? "s" : ""} left
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Task Grid */}
        <div className="w-full">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            Tasks to complete
            <div className="h-px flex-1 bg-gray-100" />
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {timer.tasks.map((task, index) => (
              <div
                key={task.key}
                className="bg-white border-2 border-orange-100 hover:border-orange-300 transition-colors shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6"
              >
                <div className="flex-shrink-0">
                  <span className="transform scale-90 sm:scale-100 block">
                    <StyledNumber number={index + 1} />
                  </span>
                </div>
                <div className="flex-grow flex flex-col justify-between h-full text-center sm:text-left">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {task.title}
                    </h4>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    {task.isCompleted ? (
                      <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold bg-green-50 text-green-600 border border-green-100">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </div>
                    ) : (
                      <Link
                        href={task.url}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-md hover:shadow-lg"
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
};

export default ActivityPageTimer;
