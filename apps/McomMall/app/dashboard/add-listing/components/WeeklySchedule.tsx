'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, PlusCircle, Copy } from 'lucide-react';
import { TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'antd/dist/reset.css';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface TimeRange {
  start: string;
  end: string;
}

interface Schedule {
  [key: string]: TimeRange[];
}

interface WeeklyScheduleProps {
  schedule: Schedule;
  setSchedule: (schedule: Schedule) => void;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  schedule,
  setSchedule,
}) => {
  const handleTimeChange = (
    day: string,
    index: number,
    time: [Dayjs | null, Dayjs | null]
  ) => {
    if (!time) return;

    const [start, end] = time;
    const newSchedule = { ...schedule };

    newSchedule[day][index] = {
      start: start ? start.format('HH:mm') : '',
      end: end ? end.format('HH:mm') : '',
    };

    setSchedule(newSchedule);
  };

  const addTimeRange = (day: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = [];
    }
    newSchedule[day].push({ start: '09:00', end: '17:00' });
    setSchedule(newSchedule);
  };

  const removeTimeRange = (day: string, index: number) => {
    const newSchedule = { ...schedule };
    newSchedule[day].splice(index, 1);
    setSchedule(newSchedule);
  };

  const copyToAll = (day: string) => {
    const daySchedule = schedule[day];
    if (daySchedule) {
      const newSchedule: Schedule = {};
      daysOfWeek.forEach(d => {
        newSchedule[d] = JSON.parse(JSON.stringify(daySchedule));
      });
      setSchedule(newSchedule);
    }
  };

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
      <div className="space-y-4">
        {daysOfWeek.map(day => (
          <div
            key={day}
            className="grid grid-cols-[120px_1fr_auto] items-start gap-4"
          >
            <div className="font-semibold pt-2">{day}</div>
            <div className="space-y-2">
              {(schedule[day] || []).map((range, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TimePicker.RangePicker
                    use12Hours
                    format="h:mm a"
                    value={[
                      range.start ? dayjs(range.start, 'HH:mm') : null,
                      range.end ? dayjs(range.end, 'HH:mm') : null,
                    ]}
                    onChange={time =>
                      handleTimeChange(
                        day,
                        index,
                        time as [Dayjs | null, Dayjs | null]
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimeRange(day, index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="link"
                size="sm"
                onClick={() => addTimeRange(day)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add hours
              </Button>
            </div>
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => copyToAll(day)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy to all
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySchedule;
