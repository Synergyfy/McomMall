'use client';

import React, { useState } from 'react';
import { X, CalendarRange, Ticket, Sparkles, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Season } from '@/service/seasons/api';
import { cn } from '@/lib/utils';

const HARDCODED_SEASONS: Season[] = [
    { id: 'spring-2026', name: 'Spring Season (UK)', startDate: '2026-03-01', endDate: '2026-05-31' } as Season,
    { id: 'easter-2026', name: 'Easter Sale Period', startDate: '2026-03-25', endDate: '2026-04-12' } as Season,
    { id: 'summer-2026', name: 'Summer Season (UK)', startDate: '2026-06-01', endDate: '2026-08-31' } as Season,
    { id: 'autumn-2026', name: 'Autumn Season (UK)', startDate: '2026-09-01', endDate: '2026-11-30' } as Season,
    { id: 'black-friday-2026', name: 'Black Friday Week', startDate: '2026-11-23', endDate: '2026-11-30' } as Season,
    { id: 'winter-2026', name: 'Winter Season (UK)', startDate: '2026-12-01', endDate: '2027-02-28' } as Season,
    { id: 'boxing-day-jan-2026', name: 'Boxing Day & January Sales', startDate: '2026-12-26', endDate: '2027-01-31' } as Season,
];

export type CampaignCategory = 'regular' | 'seasonal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectRegular: () => void;
    onSelectSeasonal: (season: Season) => void;
}

export const CampaignTypeModal: React.FC<Props> = ({ isOpen, onClose, onSelectRegular, onSelectSeasonal }) => {
    const [step, setStep] = useState<'type' | 'season-pick'>('type');

    if (!isOpen) return null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-800 to-slate-900 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Choose Campaign Type</h2>
                        <p className="text-sm text-slate-300 mt-0.5">
                            {step === 'type' ? 'Select how this campaign will run' : 'Pick or create a season for this campaign'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Step 1 — Type selection */}
                {step === 'type' && (
                    <div className="p-6 grid grid-cols-2 gap-4">
                        {/* Regular */}
                        <button
                            onClick={onSelectRegular}
                            className="group flex flex-col items-center gap-3 border-2 rounded-xl p-6 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center"
                        >
                            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                <Ticket className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-lg">Regular</div>
                                <div className="text-xs text-slate-500 mt-1">Standard campaign with custom validity dates</div>
                            </div>
                        </button>

                        {/* Seasonal */}
                        <button
                            onClick={() => setStep('season-pick')}
                            className="group flex flex-col items-center gap-3 border-2 rounded-xl p-6 hover:border-orange-500 hover:bg-orange-50/50 transition-all text-center"
                        >
                            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <CalendarRange className="w-7 h-7 text-orange-600" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-lg">Seasonal</div>
                                <div className="text-xs text-slate-500 mt-1">Inherits dates from a predefined season template</div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Step 2 — Season pick */}
                {step === 'season-pick' && (
                    <div className="p-6 space-y-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {HARDCODED_SEASONS.map(season => (
                                <button
                                    key={season.id}
                                    onClick={() => onSelectSeasonal(season)}
                                    className="w-full flex items-center justify-between border rounded-xl px-4 py-3 hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
                                >
                                    <div>
                                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-orange-500" />
                                            {season.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {formatDate(season.startDate)} → {formatDate(season.endDate)}
                                        </div>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 group-hover:text-orange-500 transition-colors" />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep('type')}
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ← Back to type selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
