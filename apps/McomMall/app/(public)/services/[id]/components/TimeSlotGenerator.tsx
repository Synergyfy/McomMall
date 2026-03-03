"use client";

import React from 'react';
import { AvailabilityProfile } from '@/service/services/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, Loader2 } from 'lucide-react';
import { useGetAvailableSlots } from '@/service/bookings/hook';
import { format } from 'date-fns';

interface TimeSlotGeneratorProps {
    availability?: AvailabilityProfile;
    selectedDate: Date | undefined;
    selectedSlot: string | undefined;
    onSlotSelect: (time: string) => void;
    serviceId?: string;
    minTime?: string; // If provided, only show slots after this time
}

export default function TimeSlotGenerator({ availability, selectedDate, selectedSlot, onSlotSelect, serviceId, minTime }: TimeSlotGeneratorProps) {
    const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const { data: apiSlots, isLoading } = useGetAvailableSlots(serviceId || '', dateStr);

    const slots = React.useMemo(() => {
        let baseSlots: string[] = [];

        // 1. If API returns slots, use them
        if (apiSlots && apiSlots.length > 0) {
            baseSlots = apiSlots;
        } else {
            // 2. Fallback to local generation if API returns nothing or is not enabled
            if (!availability || !selectedDate || !availability.schedule) return [];

            const dayMap: Record<string, number> = {
                sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
            };

            const dayName = Object.keys(dayMap).find(key => dayMap[key] === selectedDate.getDay());
            // Case-insensitive find
            const schedule = availability.schedule.find(s => s.day.toLowerCase() === dayName?.toLowerCase());

            if (!schedule || !schedule.enabled) return [];

            const startMins = toMinutes(schedule.startTime || '09:00');
            const endMins = toMinutes(schedule.endTime || '17:00');
            const duration = schedule.slotDuration || availability.slotDuration || 60;
            const buffer = schedule.bufferTime || availability.bufferTime || 0;
            const step = duration + buffer;

            for (let time = startMins; time + duration <= endMins; time += step) {
                baseSlots.push(toTime(time));
            }
        }

        // Apply minTime filter if provided (for End Time selection)
        if (minTime) {
            const minMins = toMinutes(minTime);
            return baseSlots.filter(s => toMinutes(s) > minMins);
        }

        return baseSlots;

    }, [availability, selectedDate, apiSlots, minTime]);

    if (!selectedDate) {
        return <div className="text-sm text-gray-500 text-center py-4">Select a date to see available times.</div>;
    }

    // Only show loading if we have a serviceId (meaning we expect an API response)
    if (isLoading && serviceId) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-orange-600" />
            </div>
        );
    }

    if (slots.length === 0) {
        return <div className="text-sm text-red-500 text-center py-4 px-2">No {minTime ? 'later' : ''} slots available on this date.</div>;
    }

    return (
        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
            {slots.map((time) => (
                <Button
                    key={time}
                    variant={selectedSlot === time ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                        "text-xs font-bold py-4 rounded-xl transition-all border-2",
                        selectedSlot === time 
                            ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800" 
                            : "border-slate-100 hover:border-slate-200 text-slate-600 bg-slate-50/50"
                    )}
                    onClick={() => onSlotSelect(time)}
                >
                    {time}
                </Button>
            ))}
        </div>
    );
}

const toMinutes = (time: string) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

const toTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}
