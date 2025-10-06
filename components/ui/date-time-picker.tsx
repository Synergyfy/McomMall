"use client";
import React, { useState, useEffect } from 'react';
import { Calendar } from './calendar';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

interface DateTimePickerProps {
  onDateTimeChange: (dateTime: { start: Date; end: Date } | null) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ onDateTimeChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate && selectedStartTime && selectedEndTime) {
      const startDate = parse(`${format(selectedDate, 'yyyy-MM-dd')} ${selectedStartTime}`, 'yyyy-MM-dd h:mm a', new Date());
      const endDate = parse(`${format(selectedDate, 'yyyy-MM-dd')} ${selectedEndTime}`, 'yyyy-MM-dd h:mm a', new Date());

      if (startDate < endDate) {
        onDateTimeChange({ start: startDate, end: endDate });
      } else {
        onDateTimeChange(null);
      }
    } else {
      onDateTimeChange(null);
    }
  }, [selectedDate, selectedStartTime, selectedEndTime, onDateTimeChange]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleStartTimeChange = (time: string) => {
    setSelectedStartTime(time);
  };

  const handleEndTimeChange = (time: string) => {
    setSelectedEndTime(time);
  };

  const getEndTimeSlots = () => {
    if (!selectedStartTime) return timeSlots;
    const startIndex = timeSlots.indexOf(selectedStartTime);
    return timeSlots.slice(startIndex + 1);
  };

  return (
    <div className="space-y-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold mb-2">Start Time</h4>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={`start-${time}`}
                variant={selectedStartTime === time ? 'default' : 'outline'}
                onClick={() => handleStartTimeChange(time)}
                className="flex items-center justify-center"
              >
                <Clock className="mr-2 h-4 w-4" />
                {time}
              </Button>
            ))}
          </div>
        </div>

        {selectedStartTime && (
          <div>
            <h4 className="text-lg font-semibold mb-2">End Time</h4>
            <div className="grid grid-cols-3 gap-2">
              {getEndTimeSlots().map((time) => (
                <Button
                  key={`end-${time}`}
                  variant={selectedEndTime === time ? 'default' : 'outline'}
                  onClick={() => handleEndTimeChange(time)}
                  className="flex items-center justify-center"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedDate && selectedStartTime && selectedEndTime && (
        <div className="text-center text-lg font-semibold text-green-600 p-3 bg-green-50 rounded-lg">
          Selected: {format(selectedDate, 'PPP')} from {selectedStartTime} to {selectedEndTime}
        </div>
      )}
    </div>
  );
};