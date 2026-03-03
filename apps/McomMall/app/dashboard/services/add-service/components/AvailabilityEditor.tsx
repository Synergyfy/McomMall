"use client";

import React, { useState } from 'react';
import { AvailabilityProfile, DaySchedule, TimeRange } from '@/service/services/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Plus, Trash2, Coffee, HelpCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface AvailabilityEditorProps {
    value?: AvailabilityProfile;
    onChange: (profile: AvailabilityProfile) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export default function AvailabilityEditor({ value, onChange }: AvailabilityEditorProps) {
    const [profile, setProfile] = useState<AvailabilityProfile>({
        schedule: DAYS.map(day => ({ day, enabled: true, startTime: '09:00', endTime: '17:00', breaks: [] })),
        slotDuration: 60,
        bufferTime: 15,
        maxBookingsPerSlot: 1,
        staffPerBooking: 1,
        serviceRadiusKm: 10,
        ...value // Override defaults if value exists
    });

    const updateProfile = (newProfile: AvailabilityProfile) => {
        setProfile(newProfile);
        onChange(newProfile);
    };

    const handleScheduleChange = (index: number, field: keyof DaySchedule, val: any) => {
        const newSchedule = [...profile.schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: val };
        updateProfile({ ...profile, schedule: newSchedule });
    };

    const handleBreakAdd = (dayIndex: number) => {
        const newSchedule = [...profile.schedule];
        const currentBreaks = newSchedule[dayIndex].breaks || [];
        newSchedule[dayIndex] = {
            ...newSchedule[dayIndex],
            breaks: [...currentBreaks, { start: '12:00', end: '13:00' }]
        };
        updateProfile({ ...profile, schedule: newSchedule });
    };

    const handleBreakChange = (dayIndex: number, breakIndex: number, field: keyof TimeRange, val: string) => {
        const newSchedule = [...profile.schedule];
        const newBreaks = [...(newSchedule[dayIndex].breaks || [])];
        newBreaks[breakIndex] = { ...(newBreaks[breakIndex] as TimeRange), [field]: val };
        newSchedule[dayIndex] = { ...newSchedule[dayIndex], breaks: newBreaks };
        updateProfile({ ...profile, schedule: newSchedule });
    };

    const handleBreakRemove = (dayIndex: number, breakIndex: number) => {
        const newSchedule = [...profile.schedule];
        const newBreaks = (newSchedule[dayIndex].breaks || []).filter((_, i) => i !== breakIndex);
        newSchedule[dayIndex] = { ...newSchedule[dayIndex], breaks: newBreaks };
        updateProfile({ ...profile, schedule: newSchedule });
    };

    const applyToAll = (index: number) => {
        const source = profile.schedule[index];
        if (!source) return;
        const newSchedule = profile.schedule.map(d => ({
            ...d,
            enabled: source.enabled,
            startTime: source.startTime,
            endTime: source.endTime,
            breaks: source.breaks ? [...source.breaks] : [],
            maxBookings: source.maxBookings,
            staffPerBooking: source.staffPerBooking,
            slotDuration: source.slotDuration,
            bufferTime: source.bufferTime,
        }));
        updateProfile({ ...profile, schedule: newSchedule });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Availability & Schedule
                </CardTitle>
                <CardDescription>Configure working hours, breaks, and capacity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Global Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Global Slot (min)</Label>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Default duration for a single session. Can be overridden per day below.
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Input
                            type="number"
                            min={1}
                            value={profile.slotDuration}
                            onChange={(e) => updateProfile({ ...profile, slotDuration: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Global Buffer (min)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={profile.bufferTime}
                                onChange={(e) => updateProfile({ ...profile, bufferTime: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Global Max Bookings</Label>
                            <Input
                                type="number"
                                min={1}
                                value={profile.maxBookingsPerSlot}
                                onChange={(e) => updateProfile({ ...profile, maxBookingsPerSlot: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Global Staff/Booking</Label>
                            <Input
                                type="number"
                                min={1}
                                value={profile.staffPerBooking || 1}
                                onChange={(e) => updateProfile({ ...profile, staffPerBooking: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Service Radius (km)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={profile.serviceRadiusKm || 0}
                                onChange={(e) => updateProfile({ ...profile, serviceRadiusKm: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Schedule Grid */}
                <div className="space-y-4">
                    <div className="hidden md:grid grid-cols-[100px_1fr_1fr_100px_100px_100px_60px_auto] gap-4 items-center font-medium text-sm text-gray-500 mb-2 px-2">
                        <div>Day</div>
                        <div>Start</div>
                        <div>End</div>
                        <div className="text-center">Breaks</div>
                        <div className="text-center">Max Bookings</div>
                        <div className="text-center">Staff</div>
                        <div className="text-center">Active</div>
                        <div></div>
                    </div>

                    {profile.schedule.map((day, index) => (
                        <div key={day.day} className="flex flex-col md:grid md:grid-cols-[100px_1fr_1fr_100px_100px_100px_60px_auto] gap-4 items-center p-3 rounded-lg hover:bg-slate-50 border border-gray-100 md:border-transparent md:hover:border-slate-100 transition-colors">
                            <div className="capitalize font-medium w-full md:w-auto flex justify-between md:block">
                                {day.day}
                                <div className="md:hidden">
                                    <Switch
                                        checked={day.enabled}
                                        onCheckedChange={(c) => handleScheduleChange(index, 'enabled', c)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <div className="md:hidden w-16 text-sm text-gray-500">Hours:</div>
                                <Input
                                    type="time"
                                    value={day.startTime}
                                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                    disabled={!day.enabled}
                                    className="h-9"
                                />
                                <span className="self-center">-</span>
                                <Input
                                    type="time"
                                    value={day.endTime}
                                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                    disabled={!day.enabled}
                                    className="h-9"
                                />
                            </div>

                            <div className="w-full md:w-auto flex justify-center">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={day.breaks?.length ? "secondary" : "ghost"}
                                            size="sm"
                                            disabled={!day.enabled}
                                            className="h-9 w-full md:w-auto"
                                        >
                                            <Coffee className="w-4 h-4 mr-2" />
                                            {day.breaks?.length ? `${day.breaks.length} Break(s)` : 'Add Break'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="space-y-4">
                                            <h4 className="font-medium leading-none">Break Times</h4>
                                            <p className="text-sm text-muted-foreground">Manage break intervals for {day.day}.</p>

                                            <div className="space-y-2">
                                                {day.breaks?.map((brk, bIdx) => (
                                                    <div key={bIdx} className="flex items-center gap-2">
                                                        <Input
                                                            type="time"
                                                            value={typeof brk === 'string' ? brk.split('-')[0] : brk.start}
                                                            onChange={(e) => handleBreakChange(index, bIdx, 'start', e.target.value)}
                                                            className="h-8"
                                                        />
                                                        <span>-</span>
                                                        <Input
                                                            type="time"
                                                            value={typeof brk === 'string' ? brk.split('-')[1] : brk.end}
                                                            onChange={(e) => handleBreakChange(index, bIdx, 'end', e.target.value)}
                                                            className="h-8"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive"
                                                            onClick={() => handleBreakRemove(index, bIdx)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {(!day.breaks || day.breaks.length === 0) && (
                                                    <p className="text-sm text-gray-400 italic">No breaks added.</p>
                                                )}
                                            </div>

                                            <Button type="button" variant="outline" size="sm" onClick={() => handleBreakAdd(index)} className="w-full">
                                                <Plus className="w-3 h-3 mr-2" /> Add Break
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="md:hidden w-16 text-sm text-gray-500">Max Bookings:</div>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder={profile.maxBookingsPerSlot.toString()}
                                    value={day.maxBookings}
                                    onChange={(e) => handleScheduleChange(index, 'maxBookings', parseInt(e.target.value) || undefined)}
                                    disabled={!day.enabled}
                                    className="h-9"
                                />
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="md:hidden w-16 text-sm text-gray-500">Staff:</div>
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder={profile.staffPerBooking?.toString()}
                                    value={day.staffPerBooking}
                                    onChange={(e) => handleScheduleChange(index, 'staffPerBooking', parseInt(e.target.value) || undefined)}
                                    disabled={!day.enabled}
                                    className="h-9"
                                />
                            </div>

                            <div className="hidden md:flex justify-center">
                                <Switch
                                    checked={day.enabled}
                                    onCheckedChange={(c) => handleScheduleChange(index, 'enabled', c)}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => applyToAll(index)}
                                className="text-xs text-primary hover:underline whitespace-nowrap w-full md:w-auto text-right md:text-left mt-2 md:mt-0 font-bold"
                                title="Copy these hours, breaks, and capacity to all other days"
                            >
                                Apply to All
                            </button>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}


function Separator() {
    return <div className="h-[1px] w-full bg-gray-100 my-4" />;
}
