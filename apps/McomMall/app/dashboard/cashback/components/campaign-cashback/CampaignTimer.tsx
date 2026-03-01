'use client';

import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
    expiryDate: string;
    activationTimerDate?: string;
    isActivationRequired?: boolean;
    activationTasks?: string[];
    onReactivate?: () => void;
}

export const CampaignTimer: React.FC<Props> = ({
    expiryDate,
    activationTimerDate,
    isActivationRequired: initialActivationRequired,
    activationTasks,
    onReactivate
}) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);
    const [showTasks, setShowTasks] = useState(false);

    // Default tasks if none provided
    const defaultTasks = [
        { id: 1, label: activationTasks?.[0] || 'Verify your linked account', completed: false },
        { id: 2, label: activationTasks?.[1] || 'Share campaign to 1 friend', completed: false },
    ];

    const [tasks, setTasks] = useState(defaultTasks);

    // Update tasks if prop changes
    useEffect(() => {
        setTasks([
            { id: 1, label: activationTasks?.[0] || 'Verify your linked account', completed: false },
            { id: 2, label: activationTasks?.[1] || 'Share campaign to 1 friend', completed: false },
        ]);
    }, [activationTasks]);

    useEffect(() => {
        if (!activationTimerDate) {
            setTimeLeft('2d 00h'); // Default fallback if not provided
            return;
        }

        const calculateTimeLeft = () => {
            const difference = +new Date(activationTimerDate) - +new Date();
            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft('00h 00m');
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);

            let timeStr = '';
            if (days > 0) timeStr += `${days}d `;
            timeStr += `${hours}h ${minutes}m`;
            setTimeLeft(timeStr);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [activationTimerDate]);

    const handleTaskClick = (id: number) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const allTasksCompleted = tasks.every(t => t.completed);

    const handleReactivate = () => {
        if (allTasksCompleted && onReactivate) {
            onReactivate();
            setShowTasks(false);
        }
    };

    // If the main card is expired, don't show the timer
    if (new Date(expiryDate) < new Date()) return null;

    return (
        <TooltipProvider>
            <div className="flex items-center gap-2 mt-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-help",
                            isExpired || initialActivationRequired
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-orange-50 text-orange-600 border border-orange-100"
                        )}>
                            <Timer className={cn("w-3 h-3", (isExpired || initialActivationRequired) && "animate-pulse")} />
                            <span>
                                {isExpired || initialActivationRequired ? 'Activation Required' : `Active for: ${timeLeft}`}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] bg-slate-900 text-white border-slate-800 p-3 shadow-xl">
                        <div className="space-y-2">
                            <p className="font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                Usage Timer
                            </p>
                            <p className="text-[11px] leading-relaxed opacity-90">
                                This E-Gift Card stays active as long as the timer is running. If it runs out before you use it, you'll need to complete 2 quick tasks to reactivate the value.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip>

                {(isExpired || initialActivationRequired) && (
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-[10px] font-bold text-blue-600 hover:text-blue-700 underline"
                        onClick={() => setShowTasks(true)}
                    >
                        Reactivate Now
                    </Button>
                )}

                {showTasks && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-orange-100">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Reactivate Card</h3>
                                <button onClick={() => setShowTasks(false)} className="text-slate-400 hover:text-slate-600">
                                    <AlertCircle className="rotate-45 w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">Complete these 2 tasks to reactivate your cashback value for another 48 hours.</p>

                            <div className="space-y-3 mb-8">
                                {tasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => handleTaskClick(task.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                                            task.completed
                                                ? "bg-green-50 border-green-200 text-green-700"
                                                : "bg-slate-50 border-slate-100 text-slate-700 hover:border-orange-200"
                                        )}
                                    >
                                        <span className="text-xs font-bold">{task.label}</span>
                                        {task.completed
                                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            : <Circle className="w-5 h-5 text-slate-300 group-hover:text-orange-300" />
                                        }
                                    </button>
                                ))}
                            </div>

                            <Button
                                className={cn(
                                    "w-full h-12 rounded-xl font-black uppercase tracking-widest transition-all",
                                    allTasksCompleted
                                        ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                )}
                                disabled={!allTasksCompleted}
                                onClick={handleReactivate}
                            >
                                Reactivate My Card
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
};
