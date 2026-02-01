"use client";

import React, { useMemo } from 'react';
import { AvailabilityProfile } from '@/service/services/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeSlotGeneratorProps {
    availability?: AvailabilityProfile;
    selectedDate: Date | undefined;
    selectedSlot: string | undefined;
    onSlotSelect: (time: string) => void;
}

export default function TimeSlotGenerator({ availability, selectedDate, selectedSlot, onSlotSelect }: TimeSlotGeneratorProps) {

    const slots = useMemo(() => {
        if (!availability || !selectedDate || !availability.schedule) return [];

        const dayMap: Record<string, number> = {
            sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
        };

        const dayName = Object.keys(dayMap).find(key => dayMap[key] === selectedDate.getDay());
        const schedule = availability.schedule.find(s => s.day === dayName);

        if (!schedule || !schedule.enabled) return [];

        const startMins = toMinutes(schedule.startTime);
        const endMins = toMinutes(schedule.endTime);
        const duration = availability.slotDuration || 60;
        const buffer = availability.bufferTime || 0;
        const step = duration + buffer;

        const generatedSlots: string[] = [];
        for (let time = startMins; time + duration <= endMins; time += step) {
            generatedSlots.push(toTime(time));
        }

        return generatedSlots;

    }, [availability, selectedDate]);

    if (!selectedDate) {
        return <div className="text-sm text-gray-500 text-center py-4">Select a date to see available times.</div>;
    }

    if (slots.length === 0) {
        return <div className="text-sm text-red-500 text-center py-4">No slots available on this date.</div>;
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
            {slots.map((time) => (
                <Button
                    key={time}
                    variant={selectedSlot === time ? 'default' : 'outline'}
                    className={cn(
                        "text-sm font-medium",
                        selectedSlot === time ? "bg-orange-600 hover:bg-orange-700 text-white" : "hover:border-orange-200 hover:bg-orange-50"
                    )}
                    onClick={() => onSlotSelect(time)}
                >
                    <Clock className="w-3 h-3 mr-2" />
                    {time}
                </Button>
            ))}
        </div>
    );
}

const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

const toTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}
