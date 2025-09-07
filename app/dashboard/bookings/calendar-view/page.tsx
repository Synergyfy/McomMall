'use client';

import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Custom Components
import { useGetBusinessBookings } from '@/service/bookings/hook';
import { Booking, BookingStatus } from '@/service/bookings/types';

// Utility functions
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isToday,
  add,
  sub,
} from 'date-fns';

const bookingStatusColors: Record<
  BookingStatus,
  { background: string; text: string }
> = {
  confirmed: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
  },
  approved: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
  },
  pending: {
    background: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  cancelled: {
    background: 'bg-red-100',
    text: 'text-red-800',
  },
  declined: {
    background: 'bg-red-100',
    text: 'text-red-800',
  },
};

const CalendarView: FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: bookings = [], isLoading } = useGetBusinessBookings();

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingDayIndex = getDay(firstDayOfMonth);

  const bookingsByDate = useMemo(() => {
    return (bookings as Booking[]).reduce(
      (acc: { [key: string]: Booking[] }, booking) => {
        const date = format(new Date(booking.startTime), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(booking);
        return acc;
      },
      {}
    );
  }, [bookings]);

  const handlePrevMonth = () => {
    setCurrentDate(sub(currentDate, { months: 1 }));
  };

  const handleNextMonth = () => {
    setCurrentDate(add(currentDate, { months: 1 }));
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate.setFullYear(parseInt(year)));
    setCurrentDate(newDate);
  };

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-32">
          <Select
            value={currentYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="border rounded-md" />
          ))}
          {daysInMonth.map(day => (
            <div
              key={day.toString()}
              className={cn('border rounded-md p-2 h-32 flex flex-col', {
                'bg-blue-50': isToday(day),
              })}
            >
              <span className="font-semibold">{format(day, 'd')}</span>
              <div className="mt-1 space-y-1 overflow-y-auto">
                {bookingsByDate[format(day, 'yyyy-MM-dd')]?.map(booking => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      'p-1 rounded-md text-xs',
                      bookingStatusColors[booking.status]?.background ?? 'bg-gray-100',
                      bookingStatusColors[booking.status]?.text ?? 'text-gray-800'
                    )}
                  >
                    <p className="font-semibold">{booking.user.name}</p>
                    <p>{format(new Date(booking.startTime), 'p')}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CalendarViewPage: FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Booking Calendar
        </h1>
      </header>
      <CalendarView />
    </div>
  );
};

export default CalendarViewPage;
