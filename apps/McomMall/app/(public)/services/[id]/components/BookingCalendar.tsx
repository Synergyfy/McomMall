"use client";

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { AvailabilityProfile } from '@/service/services/types';
import { addDays, isBefore, startOfToday } from 'date-fns';

interface BookingCalendarProps {
    availability?: AvailabilityProfile;
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
}

export default function BookingCalendar({ availability, selectedDate, onDateSelect }: BookingCalendarProps) {

    // Map day names to index
    const dayMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };

    // Determine disabled days based on schedule
    const isDayDisabled = (date: Date) => {
        // Disable past dates
        if (isBefore(date, startOfToday())) return true;

        if (!availability || !availability.schedule) return false;

        const dayName = Object.keys(dayMap).find(key => dayMap[key] === date.getDay());
        if (!dayName) return false;

        const schedule = availability.schedule.find(s => s.day === dayName);
        // If no schedule found for this day, default to enabled
        // Only disable if explicitly set to disabled
        return schedule ? !schedule.enabled : false;
    };

    return (
        <div className="p-3 bg-white border rounded-lg shadow-sm flex justify-center">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                disabled={isDayDisabled}
                initialFocus
                className="rounded-md border"
            />
        </div>
    );
}
