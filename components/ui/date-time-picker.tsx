"use client";
import React, { useState, useEffect } from 'react';
import { Calendar } from './calendar';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    setSelectedEndTime(null); // Reset end time when start time changes
  };

  const handleEndTimeChange = (time: string) => {
    setSelectedEndTime(time);
  };

  const getEndTimeSlots = () => {
    if (!selectedStartTime) return [];
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-lg font-semibold mb-2">Start Time</h4>
          <Select onValueChange={handleStartTimeChange} value={selectedStartTime || ''}>
            <SelectTrigger>
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={`start-${time}`} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedStartTime && (
          <div>
            <h4 className="text-lg font-semibold mb-2">End Time</h4>
            <Select onValueChange={handleEndTimeChange} value={selectedEndTime || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {getEndTimeSlots().map((time) => (
                  <SelectItem key={`end-${time}`} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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