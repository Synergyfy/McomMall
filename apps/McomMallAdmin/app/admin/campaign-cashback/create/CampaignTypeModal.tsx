'use client';

import React, { useState } from 'react';
import { X, CalendarRange, Ticket, Sparkles, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Season } from '@/service/seasons/api';
import { cn } from '@/lib/utils';

import { useGetSeasons } from '@/service/seasons/hook';
import { Loader2 } from 'lucide-react';

const HARDCODED_SEASONS: Season[] = [
    { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Spring Season (UK)', startDate: '2026-03-01', endDate: '2026-05-31' } as Season,
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Easter Sale Period', startDate: '2026-03-25', endDate: '2026-04-12' } as Season,
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Summer Season (UK)', startDate: '2026-06-01', endDate: '2026-08-31' } as Season,
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Autumn Season (UK)', startDate: '2026-09-01', endDate: '2026-11-30' } as Season,
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Black Friday Week', startDate: '2026-11-23', endDate: '2026-11-30' } as Season,
    { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Winter Season (UK)', startDate: '2026-12-01', endDate: '2027-02-28' } as Season,
    { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Boxing Day & Jan Sales', startDate: '2026-12-26', endDate: '2027-01-31' } as Season,
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
    const { data: liveSeasons = [], isLoading } = useGetSeasons();

    // Merge live seasons with hardcoded ones, avoiding duplicates by name
    const seasons = [
        ...liveSeasons,
        ...HARDCODED_SEASONS.filter(hs => !liveSeasons.some(ls => ls.name === hs.name))
    ];

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
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    <p className="text-sm font-medium">Fetching active seasons...</p>
                                </div>
                            ) : seasons.length > 0 ? (
                                seasons.map(season => (
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
                                ))
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-slate-50 border-slate-200">
                                    <CalendarRange className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-500">No Seasons Found</p>
                                    <p className="text-xs text-slate-400 mt-1 px-4">You need to create a season template in the Seasons module before you can launch seasonal campaigns.</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-4 h-8 text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
                                        onClick={() => window.location.href = '/admin/seasons'}
                                    >
                                        Go to Seasons
                                    </Button>
                                </div>
                            )}
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
