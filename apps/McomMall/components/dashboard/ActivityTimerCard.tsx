"use client";

import { FC, useState, useEffect } from "react";
import { ActiveTimerResponse, ActivityTimerType } from "@/service/activity-timer/types";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Pause,
    CheckCircle2,
    ExternalLink,
    Clock,
    AlertCircle,
    ChevronRight,
    Trophy
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
    <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 shadow-lg transition-transform hover:scale-105">
        <span className="text-xl sm:text-2xl font-bold text-white leading-none tracking-tight">
            {value}
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase text-orange-200 mt-1.5 opacity-80">
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden mb-10 transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)]"
        >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />

            {/* Header Section */}
            <div className={cn(
                "relative px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                timer.type === ActivityTimerType.TRIAL
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white"
                    : "bg-gradient-to-r from-slate-900 to-slate-800 text-white"
            )}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant="outline" className="border-white/30 text-[10px] text-white bg-white/10 px-2 py-0 uppercase font-black tracking-widest leading-none h-5">
                                {timer.type}
                            </Badge>
                            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-tighter opacity-80">Activity Hub</span>
                        </div>
                        <h3 className="text-xl font-bold tracking-tight leading-tight">{timer.name}</h3>
                    </div>
                </div>

                {!isExpired && (
                    <div className="flex items-center gap-2.5 text-sm font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm self-start sm:self-center">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            timer.isPaused ? "bg-yellow-400" : "bg-green-400 animate-pulse"
                        )} />
                        <span>{timer.isPaused ? "Paused" : "Active Now"}</span>
                    </div>
                )}
            </div>

            <div className="relative p-8 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left: Timer Content (5 cols) */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <h4 className="text-slate-900 font-bold text-lg mb-2">Time Remaining</h4>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-sm">
                                {timer.description || "Complete your profile tasks before the timer expires to unlock premium features."}
                            </p>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <TimeUnit value={formattedTime.days} unit="Days" />
                                <TimeUnit value={formattedTime.hours} unit="Hrs" />
                                <TimeUnit value={formattedTime.minutes} unit="Min" />
                                <TimeUnit value={formattedTime.seconds} unit="Sec" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {timer.type === ActivityTimerType.TRIAL && !isExpired && (
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={timer.isPaused ? onResume : onPause}
                                        disabled={isActionPending}
                                        className={cn(
                                            "h-12 rounded-2xl px-8 font-bold transition-all shadow-md active:scale-95",
                                            timer.isPaused
                                                ? "bg-green-600 hover:bg-green-700 text-white shadow-green-100"
                                                : "bg-orange-50 text-orange-600 hover:bg-orange-100 shadow-orange-50"
                                        )}
                                    >
                                        {timer.isPaused ? (
                                            <><Play className="w-4 h-4 mr-2 fill-current" /> Resume Now</>
                                        ) : (
                                            <><Pause className="w-4 h-4 mr-2 fill-current" /> Pause Timer</>
                                        )}
                                    </Button>

                                    {timer.isPaused && (
                                        <p className="text-xs font-semibold text-slate-400 italic">Trial is currently frozen</p>
                                    )}
                                </div>
                            )}

                            {isExpired && (
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center gap-4 text-red-600 bg-red-50/50 p-5 rounded-[2rem] border border-red-100"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold block mb-0.5">Session Expired</span>
                                        <span className="text-xs text-red-500 font-medium">Please upgrade your current tier to continue.</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right: Task Progress (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-slate-50 rounded-[2rem] p-6 sm:p-8 border border-slate-100/50">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg tracking-tight">Milestones</h4>
                                    <p className="text-xs text-slate-500 font-medium">{timer.tasks.length} tasks identified for your business</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-orange-600 leading-none">{completedTasks}</span>
                                    <span className="text-sm font-bold text-slate-400">/{timer.tasks.length}</span>
                                </div>
                            </div>

                            <div className="relative h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-8 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                                />
                            </div>

                            <div className="grid gap-3">
                                {timer.tasks.map((task, idx) => (
                                    <motion.div
                                        key={task.key}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                            task.isCompleted
                                                ? "bg-green-50/40 border-green-100 hover:bg-green-50/60"
                                                : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-md group/task"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover/task:scale-110",
                                                task.isCompleted
                                                    ? "bg-green-600 text-white shadow-lg shadow-green-100"
                                                    : "bg-slate-100 text-slate-400 border border-slate-50"
                                            )}>
                                                {task.isCompleted ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <span className="text-xs font-black tracking-tighter italic">STEP</span>
                                                )}
                                            </div>
                                            <div>
                                                <h5 className={cn(
                                                    "text-sm font-bold tracking-tight",
                                                    task.isCompleted ? "text-green-800" : "text-slate-700"
                                                )}>
                                                    {task.title}
                                                </h5>
                                                <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1 font-medium">{task.description}</p>
                                            </div>
                                        </div>

                                        {!task.isCompleted && (
                                            <Link href={task.url} className="flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="group/btn text-orange-600 hover:text-white hover:bg-orange-600 font-black text-[10px] h-9 px-4 rounded-xl transition-all active:scale-95"
                                                >
                                                    COMPLETE <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-1" />
                                                </Button>
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
