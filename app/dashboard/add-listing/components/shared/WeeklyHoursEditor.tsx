import React from 'react';
import { TimeRange, WeeklyHours } from '../../types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayHoursEditorProps {
  day: string;
  hours: TimeRange[];
  onHoursChange: (day: string, hours: TimeRange[]) => void;
  onCopy: (day: string) => void;
};

const DayHoursEditor: React.FC<DayHoursEditorProps> = ({ day, hours, onHoursChange, onCopy }) => {
    const handleTimeChange = (index: number, field: 'start' | 'end', value: string) => {
        const newHours = [...hours];
        newHours[index] = { ...newHours[index], [field]: value };
        onHoursChange(day, newHours);
    };

    const addTimeRange = () => {
        onHoursChange(day, [...hours, { start: '09:00', end: '17:00' }]);
    };

    const removeTimeRange = (index: number) => {
        const newHours = hours.filter((_, i) => i !== index);
        onHoursChange(day, newHours);
    };

    const isDayOpen = hours.length > 0;

    const toggleDay = (isOpen: boolean) => {
        if(isOpen) {
            addTimeRange();
        } else {
            onHoursChange(day, []);
        }
    }

    return (
        <div className="flex items-start space-x-4 py-2">
            <div className="flex flex-col items-center w-24">
                <Label htmlFor={`${day}-switch`} className="font-semibold">{day}</Label>
                <Switch
                    id={`${day}-switch`}
                    checked={isDayOpen}
                    onCheckedChange={toggleDay}
                    className="mt-2"
                />
            </div>
            <div className="flex-grow space-y-2">
                {isDayOpen && hours.map((range, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <Input
                    type="time"
                    value={range.start}
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                    />
                    <span>to</span>
                    <Input
                    type="time"
                    value={range.end}
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeTimeRange(index)}>
                    <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                ))}
                {isDayOpen && (
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={addTimeRange}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Add Split Time
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onCopy(day)}>
                            Copy for all
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface WeeklyHoursEditorProps {
    weeklyHours: WeeklyHours;
    onWeeklyHoursChange: (weeklyHours: WeeklyHours) => void;
}

const WeeklyHoursEditor: React.FC<WeeklyHoursEditorProps> = ({ weeklyHours, onWeeklyHoursChange }) => {

    const handleDayHoursChange = (day: string, hours: TimeRange[]) => {
        onWeeklyHoursChange({
            ...weeklyHours,
            [day]: hours,
        });
    };

    const handleCopy = (dayToCopy: string) => {
        const hoursToCopy = weeklyHours[dayToCopy as keyof typeof weeklyHours] || [];
        const newWeeklyHours = { ...weeklyHours };
        daysOfWeek.forEach(day => {
            newWeeklyHours[day as keyof typeof newWeeklyHours] = JSON.parse(JSON.stringify(hoursToCopy));
        });
        onWeeklyHoursChange(newWeeklyHours);
    }

    return (
        <div className="space-y-2 divide-y">
            {daysOfWeek.map(day => (
                <DayHoursEditor
                    key={day}
                    day={day}
                    hours={weeklyHours[day as keyof typeof weeklyHours] || []}
                    onHoursChange={handleDayHoursChange}
                    onCopy={handleCopy}
                />
            ))}
        </div>
    )
}

export default WeeklyHoursEditor;
