'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CampaignTargetType, CampaignDisplayType, CampaignUnlockMode, SpendingChannel } from '../types';
import { Lock, Unlock, Globe, Info, Layers, Search, X, Check, ChevronDown, ChevronUp, Users, Building2, CalendarRange } from 'lucide-react';
import { useGetAdminUsers, useGetAdminBusinesses } from '@/service/admin/hook';
import { cn } from '@/lib/utils';
import { Season } from '@/service/seasons/api';

interface CampaignFormProps {
    season?: Season | null;
}

export default function CampaignForm({ season }: CampaignFormProps = {}) {
    const router = useRouter();

    // Core Configuration
    const [name, setName] = useState(season?.name ?? '');
    const [expiryDate, setExpiryDate] = useState(
        season?.endDate ? new Date(season.endDate).toISOString().split('T')[0] : ''
    );
    const [targetType, setTargetType] = useState<CampaignTargetType>(CampaignTargetType.CONSUMERS);
    const [displayType, setDisplayType] = useState<CampaignDisplayType>(CampaignDisplayType.VOUCHER);
    const [unlockMode, setUnlockMode] = useState<CampaignUnlockMode>(CampaignUnlockMode.REQUIRE_FULL_UNLOCK);

    // Audience Selection
    const [selectAll, setSelectAll] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [audienceSearch, setAudienceSearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch audiences from admin API
    const { data: usersData, isLoading: usersLoading } = useGetAdminUsers(
        { search: audienceSearch, type: 'customer', limit: 50 },
    );
    const { data: bizData, isLoading: bizLoading } = useGetAdminBusinesses(
        { search: audienceSearch, limit: 50 },
    );

    const audienceItems = targetType === CampaignTargetType.BUSINESS
        ? (bizData?.data || []).map(b => ({ id: b.id, label: b.name, sub: b.email }))
        : (usersData?.data || []).map(u => ({ id: u.id, label: u.name, sub: u.email }));

    const isLoadingAudience = targetType === CampaignTargetType.BUSINESS ? bizLoading : usersLoading;

    // Reset audience selections when type changes
    useEffect(() => {
        setSelectedIds([]);
        setSelectAll(true);
        setAudienceSearch('');
    }, [targetType]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleId = (id: string) => {
        setSelectAll(false);
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectAll(true);
        setSelectedIds([]);
    };

    // Amounts
    const [totalValueStr, setTotalValueStr] = useState('30');
    const [levelValue, setLevelValue] = useState(10);

    // Value Explanations
    const [titles, setTitles] = useState({ v1: '247GBS Credit', v2: 'System Credit', v3: 'Your Contribution' });
    const [descriptions, setDescriptions] = useState({ v1: '', v2: '', v3: '' });
    const [usages, setUsages] = useState({ v1: '', v2: '', v3: '' });

    // Value Channels
    const [channels, setChannels] = useState({
        v1: 'Hyperlocal, Nearby',
        v2: 'Online',
        v3: 'Hyperlocal, Nearby, Online',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto split logic
    useEffect(() => {
        const total = parseFloat(totalValueStr) || 0;
        setLevelValue(total / 3);
    }, [totalValueStr]);

    const handleChannelChange = (valueKey: 'v1' | 'v2' | 'v3', val: string) => {
        setChannels(prev => ({ ...prev, [valueKey]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1500));
        alert("Campaign Cashback Created Successfully!");
        router.push('/admin');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">

            {/* SECTION 1: Base Details */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Info className="w-5 h-5 text-emerald-600" /> Basic Details</h3>

                <div className="space-y-3">
                    <Label htmlFor="campaignName" className="text-sm font-semibold">
                        Campaign Name {season && <span className="ml-1 text-orange-600 font-normal text-xs">(Inherited from season)</span>}
                    </Label>
                    <Input
                        id="campaignName"
                        placeholder="e.g., Summer Special £30 Cashback"
                        value={name}
                        onChange={e => !season && setName(e.target.value)}
                        readOnly={!!season}
                        required
                        className={cn("max-w-md", season && "bg-orange-50 border-orange-300 cursor-not-allowed text-orange-700 font-medium")}
                    />
                </div>

                {/* Validity / Expiry Date */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                        Card Validity {season && <span className="ml-1 text-orange-600 font-normal text-xs">(Inherited from {season.name})</span>}
                    </Label>

                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        {/* Start Date — only shown for seasonal */}
                        {season && (
                            <div className="space-y-1">
                                <Label htmlFor="startDate" className="text-xs font-semibold text-gray-500 uppercase">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={new Date(season.startDate).toISOString().split('T')[0]}
                                    readOnly
                                    className="max-w-xs h-10 bg-orange-50 border-orange-300 cursor-not-allowed text-orange-700 font-medium"
                                />
                            </div>
                        )}

                        {/* Expiry / End Date */}
                        <div className="space-y-1">
                            <Label htmlFor="expiryDate" className="text-xs font-semibold text-gray-500 uppercase">
                                {season ? 'End Date' : 'Expiry Date'}
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={expiryDate}
                                    min={!season ? new Date().toISOString().split('T')[0] : undefined}
                                    onChange={e => !season && setExpiryDate(e.target.value)}
                                    readOnly={!!season}
                                    required
                                    className={cn("max-w-xs h-10", season && "bg-orange-50 border-orange-300 cursor-not-allowed text-orange-700 font-medium")}
                                />
                                {expiryDate && !season && (() => {
                                    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
                                    const label = days >= 365
                                        ? `${Math.round(days / 365)} year${Math.round(days / 365) !== 1 ? 's' : ''}`
                                        : days >= 30
                                            ? `${Math.round(days / 30)} month${Math.round(days / 30) !== 1 ? 's' : ''}`
                                            : `${days} day${days !== 1 ? 's' : ''}`;
                                    return (
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold",
                                            days <= 7 ? "bg-red-100 text-red-700" :
                                                days <= 30 ? "bg-amber-100 text-amber-700" :
                                                    "bg-emerald-100 text-emerald-700"
                                        )}>
                                            ⏳ Valid for {label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {season
                            ? `Dates are locked to the "${season.name}" season and cannot be edited.`
                            : 'The card will expire at midnight on this date. Customers will not be able to redeem after this point.'}
                    </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">

                    {/* ── Target Audience ── */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Target Audience</Label>

                        {/* Master type toggle: Business vs Consumers */}
                        <RadioGroup value={targetType} onValueChange={(val: any) => setTargetType(val)} className="flex gap-3">
                            <div className={cn(
                                "flex items-center gap-2 border-2 p-3 rounded-lg cursor-pointer transition-all flex-1",
                                targetType === CampaignTargetType.BUSINESS ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'
                            )}>
                                <RadioGroupItem value={CampaignTargetType.BUSINESS} id="business" />
                                <Label htmlFor="business" className="cursor-pointer flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-emerald-600" /> Business
                                </Label>
                            </div>
                            <div className={cn(
                                "flex items-center gap-2 border-2 p-3 rounded-lg cursor-pointer transition-all flex-1",
                                targetType === CampaignTargetType.CONSUMERS ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                            )}>
                                <RadioGroupItem value={CampaignTargetType.CONSUMERS} id="consumers" />
                                <Label htmlFor="consumers" className="cursor-pointer flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-blue-600" /> Consumers
                                </Label>
                            </div>
                        </RadioGroup>

                        {/* All / Specific toggle buttons */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all",
                                    selectAll
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => { setSelectAll(false); setDropdownOpen(o => !o); }}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                                    !selectAll
                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                {targetType === CampaignTargetType.BUSINESS ? 'Specific Businesses' : 'Specific Users'}
                                {!selectAll && selectedIds.length > 0 && (
                                    <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                        {selectedIds.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Dropdown — only when "Specific" is active */}
                        {!selectAll && (
                            <div ref={dropdownRef} className="relative">
                                {dropdownOpen && (
                                    <div className="border rounded-xl shadow-lg overflow-hidden bg-white">
                                        {/* Search bar */}
                                        <div className="p-2 border-b">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                                <Input
                                                    autoFocus
                                                    value={audienceSearch}
                                                    onChange={e => setAudienceSearch(e.target.value)}
                                                    placeholder={`Search ${targetType === CampaignTargetType.BUSINESS ? 'businesses' : 'consumers'}...`}
                                                    className="pl-7 h-8 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-56 overflow-y-auto">
                                            {isLoadingAudience ? (
                                                <div className="text-center py-6 text-sm text-gray-400">Loading...</div>
                                            ) : audienceItems.length === 0 ? (
                                                <div className="text-center py-6 text-sm text-gray-400">No results found</div>
                                            ) : audienceItems.map(item => {
                                                const isChecked = selectedIds.includes(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => toggleId(item.id)}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                                                            isChecked && "bg-blue-50"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                                                            isChecked ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                                        )}>
                                                            {isChecked && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{item.label}</div>
                                                            {item.sub && <div className="text-xs text-gray-400 truncate">{item.sub}</div>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {selectedIds.length > 0 && (
                                            <div className="p-2 border-t flex justify-between items-center bg-gray-50">
                                                <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedIds([])}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                >
                                                    Clear all
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected chips */}
                        {!selectAll && selectedIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedIds.map(id => {
                                    const item = audienceItems.find(a => a.id === id);
                                    return item ? (
                                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                            {item.label}
                                            <button
                                                type="button"
                                                onClick={e => { e.stopPropagation(); toggleId(id); }}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ) : null;
                                })}

                            </div>
                        )}
                    </div>

                    {/* ── Card Display Style ── */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Card Display Style</Label>
                        <RadioGroup value={displayType} onValueChange={(val: any) => setDisplayType(val)} className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer w-full max-w-sm">
                                <RadioGroupItem value={CampaignDisplayType.VOUCHER} id="cd-voucher" />
                                <Label htmlFor="cd-voucher" className="cursor-pointer">Voucher UI</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer w-full max-w-sm">
                                <RadioGroupItem value={CampaignDisplayType.E_CARD} id="cd-ecard" />
                                <Label htmlFor="cd-ecard" className="cursor-pointer">Digital E-Card UI</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </section>

            {/* SECTION 2: Value Splitting Engine */}
            <section className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-300 pb-2">
                    <Layers className="w-5 h-5 text-blue-600" /> Value Structure & Splitting
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-3">
                        <Label htmlFor="totalValue" className="text-sm font-semibold text-slate-800">Total Campaign Value (£)</Label>
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">£</span>
                            <Input id="totalValue" type="number" min="3" step="3" value={totalValueStr} onChange={e => setTotalValueStr(e.target.value)} required className="pl-8 font-bold text-lg h-12" />
                        </div>
                        <p className="text-xs text-muted-foreground">The system will automatically divide this evenly across the 3 locked values.</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Automated Split Logic</h4>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-emerald-700 font-medium">Value 1 (247GBS Preload)</span>
                            <span className="font-bold">£{levelValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-emerald-700 font-medium">Value 2 (System Preload)</span>
                            <span className="font-bold">£{levelValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-700 font-medium">Value 3 (Cust. Contribution)</span>
                            <span className="font-bold">£{levelValue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-300 space-y-4">
                    <Label className="text-sm font-semibold text-slate-800">Unlock Conditions logic</Label>
                    <RadioGroup value={unlockMode} onValueChange={(val: any) => setUnlockMode(val)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`border-2 p-4 rounded-xl cursor-pointer transition-all ${unlockMode === CampaignUnlockMode.REQUIRE_FULL_UNLOCK ? 'border-blue-600 bg-blue-50' : 'hover:bg-white'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <RadioGroupItem value={CampaignUnlockMode.REQUIRE_FULL_UNLOCK} id="lock-full" />
                                <Label htmlFor="lock-full" className="cursor-pointer font-bold flex items-center gap-1.5"><Lock className="w-4 h-4 text-red-500" /> Require Full Unlock</Label>
                            </div>
                            <p className="text-xs text-slate-500 pl-6">Customer MUST pay their £{levelValue.toFixed(2)} contribution before ANY value can be used.</p>
                        </div>

                        <div className={`border-2 p-4 rounded-xl cursor-pointer transition-all ${unlockMode === CampaignUnlockMode.ALLOW_PRELOADED_USAGE ? 'border-blue-600 bg-blue-50' : 'hover:bg-white'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                                <RadioGroupItem value={CampaignUnlockMode.ALLOW_PRELOADED_USAGE} id="lock-partial" />
                                <Label htmlFor="lock-partial" className="cursor-pointer font-bold flex items-center gap-1.5"><Unlock className="w-4 h-4 text-emerald-500" /> Allow Preloaded Usage</Label>
                            </div>
                            <p className="text-xs text-slate-500 pl-6">Customer can use the preloaded values immediately. Contribution only required to unlock the final third.</p>
                        </div>
                    </RadioGroup>
                </div>
            </section>

            {/* SECTION 3: Detailed Configuration Per Value */}
            <section className="space-y-6 pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2"><Globe className="w-5 h-5 text-indigo-600" /> Granular Value Configuration</h3>
                <p className="text-sm text-gray-500 mb-6">Configure exactly what the user sees when they hover/tap each value on the frontend, and define where each value can explicitly be spent.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Value 1 Config */}
                    <div className="border border-emerald-200 bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-50 border-b border-emerald-200 p-3 font-bold text-emerald-800">
                            Value 1 (247GBS Preloaded)
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Hover Title</Label>
                                <Input value={titles.v1} onChange={e => setTitles({ ...titles, v1: e.target.value })} className="h-9" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Hover Description</Label>
                                <Textarea value={descriptions.v1} onChange={e => setDescriptions({ ...descriptions, v1: e.target.value })} className="h-20 resize-none text-sm" placeholder="Why are they getting this?" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Usage Explainer</Label>
                                <Input value={usages.v1} onChange={e => setUsages({ ...usages, v1: e.target.value })} className="h-9" placeholder="e.g., Redeemable internally" />
                            </div>
                            <div className="pt-3 border-t">
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Valid Channels (Labels)</Label>
                                <div className="flex gap-2 mb-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Online</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Hyperlocal</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Nearby</span>
                                </div>
                                <Input value={channels.v1} onChange={e => handleChannelChange('v1', e.target.value)} className="h-9" placeholder="Enter valid channels..." />
                            </div>
                        </div>
                    </div>

                    {/* Value 2 Config */}
                    <div className="border border-emerald-200 bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-50 border-b border-emerald-200 p-3 font-bold text-emerald-800">
                            Value 2 (System Preloaded)
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Hover Title</Label>
                                <Input value={titles.v2} onChange={e => setTitles({ ...titles, v2: e.target.value })} className="h-9" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Hover Description</Label>
                                <Textarea value={descriptions.v2} onChange={e => setDescriptions({ ...descriptions, v2: e.target.value })} className="h-20 resize-none text-sm" placeholder="Why are they getting this?" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Usage Explainer</Label>
                                <Input value={usages.v2} onChange={e => setUsages({ ...usages, v2: e.target.value })} className="h-9" placeholder="e.g., Only in MCOM Mall" />
                            </div>
                            <div className="pt-3 border-t">
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Valid Channels (Labels)</Label>
                                <div className="flex gap-2 mb-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Online</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Hyperlocal</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Nearby</span>
                                </div>
                                <Input value={channels.v2} onChange={e => handleChannelChange('v2', e.target.value)} className="h-9" placeholder="Enter valid channels..." />
                            </div>
                        </div>
                    </div>

                    {/* Value 3 Config */}
                    <div className="border border-blue-200 bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-blue-50 border-b border-blue-200 p-3 font-bold text-blue-800">
                            Value 3 (Customer Contribution)
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Hover Title</Label>
                                <Input value={titles.v3} onChange={e => setTitles({ ...titles, v3: e.target.value })} className="h-9" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Hover Description</Label>
                                <Textarea value={descriptions.v3} onChange={e => setDescriptions({ ...descriptions, v3: e.target.value })} className="h-20 resize-none text-sm" placeholder="Why do they need to pay?" />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block">Usage Explainer</Label>
                                <Input value={usages.v3} onChange={e => setUsages({ ...usages, v3: e.target.value })} className="h-9" placeholder="e.g., Use anywhere" />
                            </div>
                            <div className="pt-3 border-t">
                                <Label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Valid Channels (Labels)</Label>
                                <div className="flex gap-2 mb-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Online</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Hyperlocal</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Nearby</span>
                                </div>
                                <Input value={channels.v3} onChange={e => handleChannelChange('v3', e.target.value)} className="h-9" placeholder="Enter valid channels..." />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="pt-8 border-t border-slate-200 flex justify-end">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="mr-4">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 shadow-md">
                    {isSubmitting ? 'Creating Campaign...' : 'Generate New Campaign Cashback'}
                </Button>
            </div>

        </form>
    );
}
