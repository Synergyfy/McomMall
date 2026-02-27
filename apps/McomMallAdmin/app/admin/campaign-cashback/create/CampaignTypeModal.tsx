'use client';

import React, { useState } from 'react';
import { X, CalendarRange, Ticket, Sparkles, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetSeasons, useCreateSeason } from '@/service/seasons/hook';
import { Season } from '@/service/seasons/api';
import { cn } from '@/lib/utils';

export type CampaignCategory = 'regular' | 'seasonal';

interface Props {
    isOpen: boolean;
    onSelectRegular: () => void;
    onSelectSeasonal: (season: Season) => void;
}

export const CampaignTypeModal: React.FC<Props> = ({ isOpen, onSelectRegular, onSelectSeasonal }) => {
    const [step, setStep] = useState<'type' | 'season-pick'>('type');
    const [showNewSeasonForm, setShowNewSeasonForm] = useState(false);

    // New season form state
    const [newSeasonName, setNewSeasonName] = useState('');
    const [newSeasonStart, setNewSeasonStart] = useState('');
    const [newSeasonEnd, setNewSeasonEnd] = useState('');

    const { data: seasons = [], isLoading: seasonsLoading } = useGetSeasons();
    const { mutateAsync: createSeason, isPending: creating } = useCreateSeason();

    if (!isOpen) return null;

    const handleCreateSeason = async () => {
        if (!newSeasonName || !newSeasonStart || !newSeasonEnd) return;
        const season = await createSeason({
            name: newSeasonName,
            startDate: newSeasonStart,
            endDate: newSeasonEnd,
        });
        onSelectSeasonal(season);
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <h2 className="text-lg font-bold">Choose Campaign Type</h2>
                    <p className="text-sm text-slate-300 mt-0.5">
                        {step === 'type' ? 'Select how this campaign will run' : 'Pick or create a season for this campaign'}
                    </p>
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
                        {/* Existing seasons */}
                        {seasonsLoading ? (
                            <div className="text-center py-8 text-slate-400 text-sm">Loading seasons...</div>
                        ) : seasons.length === 0 && !showNewSeasonForm ? (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                No seasons defined yet.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {seasons.map(season => (
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
                        )}

                        {/* Create new season */}
                        {!showNewSeasonForm ? (
                            <button
                                onClick={() => setShowNewSeasonForm(true)}
                                className="w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 text-sm font-medium text-slate-500 hover:border-orange-400 hover:text-orange-600 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Create New Season
                            </button>
                        ) : (
                            <div className="border rounded-xl p-4 space-y-3 bg-orange-50/40">
                                <h4 className="font-bold text-sm text-slate-700">New Season</h4>
                                <div>
                                    <Label className="text-xs font-semibold">Season Name</Label>
                                    <Input
                                        placeholder="e.g., Summer 2026"
                                        value={newSeasonName}
                                        onChange={e => setNewSeasonName(e.target.value)}
                                        className="mt-1 h-9"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs font-semibold">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={newSeasonStart}
                                            onChange={e => setNewSeasonStart(e.target.value)}
                                            className="mt-1 h-9"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold">End Date</Label>
                                        <Input
                                            type="date"
                                            value={newSeasonEnd}
                                            min={newSeasonStart}
                                            onChange={e => setNewSeasonEnd(e.target.value)}
                                            className="mt-1 h-9"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        type="button"
                                        onClick={handleCreateSeason}
                                        disabled={creating || !newSeasonName || !newSeasonStart || !newSeasonEnd}
                                        className="bg-orange-500 hover:bg-orange-600 text-white flex-1 h-9"
                                    >
                                        {creating ? 'Creating...' : 'Create & Use This Season'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setShowNewSeasonForm(false)}
                                        className="h-9"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => { setStep('type'); setShowNewSeasonForm(false); }}
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
