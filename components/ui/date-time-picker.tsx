"use client";
import React, { useState } from 'react';
import { Calendar } from './calendar';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface DateTimePickerProps {
  onDateTimeChange: (dateTime: Date | null) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ onDateTimeChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes);
      onDateTimeChange(newDateTime);
    } else {
      onDateTimeChange(null);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes);
      onDateTimeChange(newDateTime);
    } else {
      onDateTimeChange(null);
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? 'default' : 'outline'}
            onClick={() => handleTimeChange(time)}
            className="flex items-center justify-center"
          >
            <Clock className="mr-2 h-4 w-4" />
            {time}
          </Button>
        ))}
      </div>

      {selectedDate && selectedTime && (
        <div className="text-center text-lg font-semibold text-green-600 p-3 bg-green-50 rounded-lg">
          Selected: {format(selectedDate, 'PPP')} at {selectedTime}
        </div>
      )}
    </div>
  );
};