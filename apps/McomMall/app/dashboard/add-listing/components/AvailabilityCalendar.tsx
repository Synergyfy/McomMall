'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Availability {
  [key: string]: {
    blocked: boolean;
    price?: number;
  };
}

interface AvailabilityCalendarProps {
  availability: Availability;
  setAvailability: (availability: Availability) => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availability,
  setAvailability,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [price, setPrice] = useState<number | undefined>(undefined);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const getDayModifier = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayAvailability = availability[dateString];
    if (dayAvailability?.blocked) {
      return { blocked: true };
    }
    if (dayAvailability?.price) {
      return { price: true };
    }
    return {};
  };

  const handleAction = (action: 'block' | 'unblock' | 'setPrice') => {
    if (!selectedDate) return;
    const dateString = selectedDate.toISOString().split('T')[0];
    const newAvailability = { ...availability };

    if (action === 'block') {
      newAvailability[dateString] = { blocked: true };
    } else if (action === 'unblock') {
      delete newAvailability[dateString];
    } else if (action === 'setPrice') {
      newAvailability[dateString] = { blocked: false, price: price };
    }
    setAvailability(newAvailability);
  };

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Availability Calendar</h3>
      <div className="flex flex-col md:flex-row gap-8">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          modifiers={{
            blocked: (date: Date) => {
              const dateString = date.toISOString().split('T')[0];
              return !!availability[dateString]?.blocked;
            },
            price: (date: Date) => {
              const dateString = date.toISOString().split('T')[0];
              return typeof availability[dateString]?.price === 'number';
            },
          }}
          modifiersStyles={{
            blocked: { backgroundColor: '#fecaca', color: '#dc2626' },
            price: { backgroundColor: '#dbeafe', color: '#2563eb' },
          }}
          className="rounded-md border"
        />
        {selectedDate && (
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h4>
            <div className="space-y-2">
              <Button
                onClick={() => handleAction('block')}
                variant="outline"
                className="w-full"
              >
                Block Date
              </Button>
              <Button
                onClick={() => handleAction('unblock')}
                variant="outline"
                className="w-full"
              >
                Unblock Date
              </Button>
              <div className="flex items-center gap-2 pt-2">
                <Input
                  type="number"
                  placeholder="Custom price"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                />
                <Button onClick={() => handleAction('setPrice')}>
                  Set Price
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
