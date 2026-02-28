"use client";

import React from 'react';
import { Service, AvailabilityProfile } from '@/service/services/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceAvailabilityOverviewProps {
    service: Service;
}

export default function ServiceAvailabilityOverview({ service }: ServiceAvailabilityOverviewProps) {
    const availability = service.availability;

    if (!availability || !availability.schedule) {
        return (
            <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="text-orange-600 h-5 w-5" />
                        <h3 className="text-lg font-bold text-slate-900">Operating Hours</h3>
                    </div>
                    <p className="text-slate-500 text-sm italic">Specific hours not provided. Contact the provider for more details.</p>
                </CardContent>
            </Card>
        );
    }

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Sort schedule based on dayOrder
    const sortedSchedule = [...availability.schedule].sort((a, b) => {
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });

    return (
        <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-orange-600 h-5 w-5" />
                        <h3 className="text-lg font-bold text-slate-900">Availability & Hours</h3>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase text-[10px]">
                        {service.isActive ? 'Accepting Bookings' : 'Paused'}
                    </Badge>
                </div>

                <div className="space-y-3">
                    {sortedSchedule.map((item) => (
                        <div key={item.day} className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                            item.enabled ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60"
                        )}>
                            <div className="flex items-center gap-3">
                                {item.enabled ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-slate-300" />
                                )}
                                <span className={cn(
                                    "font-bold text-sm capitalize",
                                    item.enabled ? "text-slate-900" : "text-slate-400"
                                )}>
                                    {item.day}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {item.enabled ? (
                                    <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-lg">
                                        <Clock className="h-3 w-3 text-orange-600" />
                                        <span className="text-xs font-black text-orange-700">
                                            {item.startTime} - {item.endTime}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Clock className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Slot Duration</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Each session lasts approximately <span className="font-bold text-orange-600">{availability.slotDuration || service.duration || 60} minutes</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
