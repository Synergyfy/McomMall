"use client";

import { FC, useState, useEffect } from "react";
import { ActiveTimerResponse, ActivityTimerType } from "@/service/activity-timer/types";
import { motion } from "framer-motion";
import {
    PlayIcon,
    PauseIcon,
    CheckCircle2,
    ExternalLink,
    Clock,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ActivityTimerCardProps {
    timer: ActiveTimerResponse;
    onPause?: () => void;
    onResume?: () => void;
    isActionPending?: boolean;
}

const TimeUnit: FC<{ value: string; unit: string }> = ({ value, unit }) => (
    <div className="flex flex-col items-center justify-center bg-orange-600 p-2 rounded-lg w-16 h-16 sm:w-20 sm:h-20 shadow-md">
        <span className="text-xl sm:text-2xl font-bold text-white leading-none">
            {value}
        </span>
        <span className="text-[10px] sm:text-xs font-medium uppercase text-orange-100 mt-1">
            {unit}
        </span>
    </div>
);

export const ActivityTimerCard: FC<ActivityTimerCardProps> = ({
    timer,
    onPause,
    onResume,
    isActionPending
}) => {
    const [timeLeft, setTimeLeft] = useState(timer.remainingTime);

    useEffect(() => {
        if (timer.isPaused || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [timer.isPaused, timeLeft]);

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
    const completedTasks = timer.tasks.filter(t => t.isCompleted).length;
    const progress = (completedTasks / timer.tasks.length) * 100;
    const isExpired = timeLeft <= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mb-8"
        >
            {/* Header Banner */}
            <div className={cn(
                "px-6 py-4 flex items-center justify-between",
                timer.type === ActivityTimerType.TRIAL ? "bg-orange-600 text-white" : "bg-slate-900 text-white"
            )}>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-white/30 text-white bg-white/10 uppercase font-bold text-[10px]">
                        {timer.type}
                    </Badge>
                    <h3 className="text-lg font-bold truncate">{timer.name}</h3>
                </div>
                {!isExpired && (
                    <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span>{timer.isPaused ? "Paused" : "Active"}</span>
                    </div>
                )}
            </div>

            <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    {/* Left: Timer Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <p className="text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">
                                {timer.description || "Complete these tasks to unlock more features and optimize your business profile."}
                            </p>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <TimeUnit value={formattedTime.days} unit="Days" />
                                <TimeUnit value={formattedTime.hours} unit="Hrs" />
                                <TimeUnit value={formattedTime.minutes} unit="Min" />
                                <TimeUnit value={formattedTime.seconds} unit="Sec" />
                            </div>
                        </div>

                        {timer.type === ActivityTimerType.TRIAL && (
                            <div className="flex items-center gap-3">
                                {timer.isPaused ? (
                                    <Button
                                        onClick={onResume}
                                        disabled={isActionPending || isExpired}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-full px-6"
                                    >
                                        <PlayIcon className="w-4 h-4 mr-2" /> Resume Trial
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={onPause}
                                        disabled={isActionPending || isExpired}
                                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold rounded-full px-6"
                                    >
                                        <PauseIcon className="w-4 h-4 mr-2" /> Pause Timer
                                    </Button>
                                )}
                            </div>
                        )}

                        {isExpired && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-semibold">This period has expired. Please upgrade your tier.</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Task Progress */}
                    <div className="lg:col-span-3">
                        <div className="flex justify-between items-end mb-2">
                            <h4 className="font-bold text-gray-900">Task Completion</h4>
                            <span className="text-sm font-mono text-orange-600 font-bold">{completedTasks}/{timer.tasks.length}</span>
                        </div>
                        <Progress value={progress} className="h-2 mb-6" />

                        <div className="space-y-3">
                            {timer.tasks.map((task) => (
                                <div
                                    key={task.key}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-2xl border transition-all",
                                        task.isCompleted
                                            ? "bg-green-50 border-green-100"
                                            : "bg-gray-50 border-gray-100 hover:border-orange-200 group"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                                            task.isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                                        )}>
                                            {task.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">?</span>}
                                        </div>
                                        <div>
                                            <h5 className={cn("text-sm font-bold", task.isCompleted ? "text-green-800" : "text-gray-700")}>
                                                {task.title}
                                            </h5>
                                            <p className="text-[10px] md:text-xs text-gray-500 line-clamp-1">{task.description}</p>
                                        </div>
                                    </div>

                                    {!task.isCompleted && (
                                        <Link href={task.url}>
                                            <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold text-[10px] h-8 rounded-full">
                                                GO <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
