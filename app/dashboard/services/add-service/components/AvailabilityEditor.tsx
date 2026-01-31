"use client";

import React, { useEffect, useState } from 'react';
import { AvailabilityProfile, DaySchedule } from '@/service/services/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

interface AvailabilityEditorProps {
    value?: AvailabilityProfile;
    onChange: (profile: AvailabilityProfile) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export default function AvailabilityEditor({ value, onChange }: AvailabilityEditorProps) {
    const [profile, setProfile] = useState<AvailabilityProfile>({
        schedule: DAYS.map(day => ({ day, enabled: true, startTime: '09:00', endTime: '17:00' })),
        slotDuration: 60,
        bufferTime: 15,
        maxBookingsPerSlot: 1,
        serviceRadiusKm: 10,
        ...value // Override defaults if value exists
    });

    // Ensure local state syncs with external value change (if strictly controlled)
    // But usually we just emit up.

    const updateProfile = (newProfile: AvailabilityProfile) => {
        setProfile(newProfile);
        onChange(newProfile);
    };

    const handleScheduleChange = (index: number, field: keyof DaySchedule, val: any) => {
        const newSchedule = [...profile.schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: val };
        updateProfile({ ...profile, schedule: newSchedule });
    };

    const applyToAll = (index: number) => {
        const source = profile.schedule[index];
        const newSchedule = profile.schedule.map(d => ({
            ...d,
            enabled: source.enabled,
            startTime: source.startTime,
            endTime: source.endTime
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
                <CardDescription>Configure when this service can be booked.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Global Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Slot Duration (min)</Label>
                        <Input
                            type="number"
                            value={profile.slotDuration}
                            onChange={(e) => updateProfile({ ...profile, slotDuration: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Buffer Time (min)</Label>
                        <Input
                            type="number"
                            value={profile.bufferTime}
                            onChange={(e) => updateProfile({ ...profile, bufferTime: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Max Bookings/Slot</Label>
                        <Input
                            type="number"
                            value={profile.maxBookingsPerSlot}
                            onChange={(e) => updateProfile({ ...profile, maxBookingsPerSlot: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Service Radius (km)</Label>
                        <Input
                            type="number"
                            value={profile.serviceRadiusKm || 0}
                            onChange={(e) => updateProfile({ ...profile, serviceRadiusKm: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <Separator />

                {/* Schedule Grid */}
                <div className="space-y-4">
                    <div className="grid grid-cols-[100px_1fr_1fr_60px_auto] gap-4 items-center font-medium text-sm text-gray-500 mb-2 px-2">
                        <div>Day</div>
                        <div>Start</div>
                        <div>End</div>
                        <div>Active</div>
                        <div></div>
                    </div>

                    {profile.schedule.map((day, index) => (
                        <div key={day.day} className="grid grid-cols-[100px_1fr_1fr_60px_auto] gap-4 items-center p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="capitalize font-medium">{day.day}</div>

                            <Input
                                type="time"
                                value={day.startTime}
                                onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                disabled={!day.enabled}
                                className="h-9"
                            />

                            <Input
                                type="time"
                                value={day.endTime}
                                onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                disabled={!day.enabled}
                                className="h-9"
                            />

                            <div className="flex justify-center">
                                <Switch
                                    checked={day.enabled}
                                    onCheckedChange={(c) => handleScheduleChange(index, 'enabled', c)}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => applyToAll(index)}
                                className="text-xs text-primary hover:underline whitespace-nowrap"
                                title="Apply these hours to all days"
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
