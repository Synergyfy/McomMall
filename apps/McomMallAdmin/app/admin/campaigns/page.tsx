'use client';

import React, { useState, useMemo } from 'react';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Eye, 
    Edit3, 
    Ban, 
    CheckCircle2, 
    ShieldAlert, 
    Star, 
    ArrowUpRight, 
    ArrowDownRight,
    Users,
    Activity,
    MapPin,
    Contact,
    History,
    Gem,
    Gift,
    MessageSquare,
    Gamepad2,
    HeartPulse,
    Award,
    TrendingUp,
    Download,
    Megaphone,
    Calendar,
    Map,
    Store,
    BarChart3,
    DollarSign,
    Plus,
    Pause,
    Zap,
    ChevronRight,
    ChevronLeft,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Info, UploadCloud } from "lucide-react";
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// --- Mock Data ---

const mockCampaigns = [
    {
        id: 'CMP-819',
        name: 'Summer High Street Festival',
        borough: 'Camden',
        status: 'Active',
        businessesInvolved: 124,
        reach: '45.2k',
        engagement: 82,
        startDate: 'Jun 1, 2024',
        endDate: 'Aug 31, 2024',
        revenue: '£124,500'
    },
    {
        id: 'CMP-442',
        name: 'Tech Tuesdays Hub',
        borough: 'Hackney',
        status: 'Scheduled',
        businessesInvolved: 45,
        reach: '12.4k',
        engagement: 0,
        startDate: 'Jul 15, 2024',
        endDate: 'Oct 15, 2024',
        revenue: '£0'
    },
    {
        id: 'CMP-912',
        name: 'Local Artisan Showcase',
        borough: 'Islington',
        status: 'Active',
        businessesInvolved: 82,
        reach: '28.9k',
        engagement: 94,
        startDate: 'May 10, 2024',
        endDate: 'Jun 10, 2024',
        revenue: '£89,200'
    },
    {
        id: 'CMP-105',
        name: 'Winter Wonderland Markets',
        borough: 'Westminster',
        status: 'Ended',
        businessesInvolved: 210,
        reach: '150.8k',
        engagement: 88,
        startDate: 'Nov 15, 2023',
        endDate: 'Jan 5, 2024',
        revenue: '£452,000'
    },
    {
        id: 'CMP-532',
        name: 'Greenwich Heritage Week',
        borough: 'Greenwich',
        status: 'Paused',
        businessesInvolved: 32,
        reach: '8.1k',
        engagement: 41,
        startDate: 'Apr 1, 2024',
        endDate: 'Apr 14, 2024',
        revenue: '£12,400'
    }
];

const kpis = [
    { title: 'Active Campaigns', value: '42', trend: '+5', trendType: 'up', icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Scheduled Campaigns', value: '18', trend: '+2', trendType: 'up', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Borough Campaigns', value: '12', trend: 'Stable', trendType: 'neutral', icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'High Street Campaigns', value: '28', trend: '+8', trendType: 'up', icon: Store, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Campaign Engagement', value: '76%', trend: '+12%', trendType: 'up', icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-50' },
    { title: 'Campaign Revenue', value: '£842k', trend: '+24%', trendType: 'up', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function CampaignManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createModalMode, setCreateModalMode] = useState<'create' | 'edit'>('create');
    const [editingCampaign, setEditingCampaign] = useState<any>(null);
    const [createStep, setCreateStep] = useState(1);
    
    // Analytics Modal State
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [analyticsCampaign, setAnalyticsCampaign] = useState<any>(null);
    
    // 7-step Flow
    const steps = [
        'Details', 
        'Borough', 
        'Businesses', 
        'Rewards', 
        'Design', 
        'Scheduling', 
        'Review'
    ];

    const filteredCampaigns = useMemo(() => {
        return mockCampaigns.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.borough.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <Megaphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campaign Management</h1>
                            <p className="text-sm font-bold text-slate-500 mt-1">Control all campaigns across boroughs and high streets.</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 font-bold text-slate-700 border-slate-200 bg-white rounded-xl shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Export Data
                    </Button>
                    <Button className="h-11 px-6 font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 gap-2" onClick={() => { setCreateStep(1); setCreateModalMode('create'); setEditingCampaign(null); setCreateModalOpen(true); }}>
                        <Plus className="w-4 h-4" /> Create Campaign
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm hover:border-indigo-200 transition-all group bg-white rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
                            <kpi.icon className="w-24 h-24" />
                        </div>
                        <CardContent className="p-6 space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className={cn("p-3 rounded-2xl transition-colors shadow-sm", kpi.bg, kpi.color)}>
                                    <kpi.icon className="h-5 w-5" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    kpi.trendType === 'up' ? "bg-emerald-50 text-emerald-600" : 
                                    kpi.trendType === 'down' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    {kpi.trendType === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : 
                                     kpi.trendType === 'down' ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
                                    {kpi.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.title}</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Campaign Directory</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">Track and manage all active, scheduled, and past campaigns.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search campaigns..." 
                                    className="pl-11 h-12 text-sm font-bold border-slate-200 shadow-sm bg-white rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-12 px-6 text-sm font-bold text-slate-700 border-slate-200 bg-white gap-2 rounded-xl shadow-sm hover:bg-slate-50">
                                <Filter className="w-4 h-4" /> Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">Campaign Name</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Borough</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Status</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Businesses Involved</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right h-14">Reach</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Engagement</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Timeline</TableHead>
                                <TableHead className="text-right pr-8 h-14"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCampaigns.map((c) => (
                                <TableRow 
                                    key={c.id} 
                                    className="hover:bg-indigo-50/30 cursor-pointer group transition-colors"
                                >
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">{c.id}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {c.borough}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                                            c.status === 'Active' ? "bg-emerald-100 text-emerald-700" :
                                            c.status === 'Scheduled' ? "bg-blue-100 text-blue-700" :
                                            c.status === 'Paused' ? "bg-amber-100 text-amber-700" :
                                            "bg-slate-100 text-slate-600"
                                        )}>
                                            {c.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-black text-slate-900">
                                        {c.businessesInvolved}
                                    </TableCell>
                                    <TableCell className="text-right py-5 text-sm font-black text-slate-900 tracking-tight">
                                        {c.reach}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col items-center gap-1.5 w-full px-4">
                                            <div className="flex items-center justify-between w-full text-[10px] font-black">
                                                <span className={cn(
                                                    c.engagement > 80 ? "text-emerald-600" :
                                                    c.engagement > 40 ? "text-indigo-600" : "text-slate-400"
                                                )}>{c.engagement}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full rounded-full",
                                                    c.engagement > 80 ? "bg-emerald-500" :
                                                    c.engagement > 40 ? "bg-indigo-500" : "bg-slate-300"
                                                )} style={{ width: `${c.engagement}%` }} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-900">{c.startDate}</p>
                                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">to {c.endDate}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8 py-5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-slate-100">
                                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Campaign Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={(e) => { e.stopPropagation(); setCreateStep(1); setCreateModalMode('edit'); setEditingCampaign(c); setCreateModalOpen(true); }}>
                                                    <Edit3 className="w-4 h-4 text-slate-500" /> Edit Campaign
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-indigo-600">
                                                    <Star className="w-4 h-4" /> Feature Campaign
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-emerald-600">
                                                    <Zap className="w-4 h-4" /> Boost Engagement
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-blue-600" onClick={(e) => { e.stopPropagation(); setAnalyticsCampaign(c); setAnalyticsModalOpen(true); }}>
                                                    <BarChart3 className="w-4 h-4" /> View Analytics
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-amber-600">
                                                    <Pause className="w-4 h-4" /> Pause Campaign
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Campaign Creation Flow Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl p-0 overflow-hidden sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="bg-slate-900 p-8 text-white relative flex-shrink-0">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black shadow-lg">
                                <Megaphone className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{createModalMode === 'edit' ? `Edit Campaign: ${editingCampaign?.name}` : 'Create New Campaign'}</h2>
                                <p className="text-xs font-bold text-slate-400 mt-1">{createModalMode === 'edit' ? 'Modify targets, logic, and timeline for this campaign.' : 'Design, target, and launch your next high street promotion.'}</p>
                            </div>
                        </div>
                        {/* Stepper */}
                        <div className="mt-8 flex items-center justify-between w-full relative">
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 rounded-full" />
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${((createStep - 1) / (steps.length - 1)) * 100}%` }} />
                            {steps.map((stepName, idx) => {
                                const stepNum = idx + 1;
                                const isActive = stepNum === createStep;
                                const isCompleted = stepNum < createStep;
                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors shadow-lg",
                                            isActive ? "bg-indigo-500 text-white border-4 border-slate-900" :
                                            isCompleted ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-500 border-2 border-slate-700"
                                        )}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest absolute -bottom-6 w-24 text-center",
                                            isActive ? "text-white" : isCompleted ? "text-indigo-300" : "text-slate-600"
                                        )}>{stepName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="p-8 bg-slate-50 flex-1 overflow-y-auto min-h-[300px] max-h-[50vh]">
                        <TooltipProvider>
                            {createStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">1. Campaign Details</h3>
                                        <p className="text-sm font-bold text-slate-500">Set the core identity and objectives for this promotion.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Campaign Name</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Internal name used for tracking and analytics.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input placeholder="e.g. Summer High Street Festival 2024" defaultValue={createModalMode === 'edit' ? editingCampaign?.name : ''} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Campaign Type</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Determines the primary reward mechanism.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="multiplier">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="multiplier" className="font-bold cursor-pointer rounded-lg">Point Multiplier</SelectItem>
                                                        <SelectItem value="cashback" className="font-bold cursor-pointer rounded-lg">Direct Cashback</SelectItem>
                                                        <SelectItem value="voucher" className="font-bold cursor-pointer rounded-lg">Voucher Drop</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Primary Objective</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">What behavior are we trying to drive?</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="footfall">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Select Objective" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="footfall" className="font-bold cursor-pointer rounded-lg">Increase Weekend Footfall</SelectItem>
                                                        <SelectItem value="retention" className="font-bold cursor-pointer rounded-lg">Customer Retention</SelectItem>
                                                        <SelectItem value="acquisition" className="font-bold cursor-pointer rounded-lg">New User Acquisition</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">2. Borough Selection</h3>
                                        <p className="text-sm font-bold text-slate-500">Select the geographical boundaries for this campaign.</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-indigo-900">Global Campaign</p>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-indigo-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Applies to all boroughs simultaneously.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <p className="text-xs font-bold text-indigo-700 mt-1">Target all active high streets across London.</p>
                                            </div>
                                            <Switch />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Specific Boroughs</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Select individual boroughs to target.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {['Camden', 'Hackney', 'Islington', 'Westminster', 'Greenwich', 'Lambeth'].map((b, i) => (
                                                    <div key={b} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                        <Checkbox id={`borough-${i}`} defaultChecked={i === 0 || i === 2} />
                                                        <label htmlFor={`borough-${i}`} className="text-sm font-bold text-slate-700 cursor-pointer">{b}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">3. Business Assignment</h3>
                                        <p className="text-sm font-bold text-slate-500">Which businesses participate in this campaign?</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-emerald-900">All Businesses in Selected Boroughs</p>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-emerald-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Automatically includes every active storefront.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <p className="text-xs font-bold text-emerald-700 mt-1">142 storefronts currently match.</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        
                                        <div className="space-y-3 opacity-50 pointer-events-none">
                                            <div className="flex items-center gap-2 mb-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Specific Categories</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Filter down by business category.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {['Food & Beverage', 'Retail', 'Services', 'Entertainment', 'Health & Beauty'].map((b, i) => (
                                                    <div key={b} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100">
                                                        <Checkbox id={`cat-${i}`} />
                                                        <label htmlFor={`cat-${i}`} className="text-sm font-bold text-slate-700">{b}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">4. Rewards Integration</h3>
                                        <p className="text-sm font-bold text-slate-500">Configure the economic engine for this campaign.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Multiplier Rate</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">E.g., 2x means double points earned.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="2x">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Rate" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="1.5x" className="font-bold cursor-pointer rounded-lg">1.5x Boost</SelectItem>
                                                        <SelectItem value="2x" className="font-bold cursor-pointer rounded-lg">2x Boost</SelectItem>
                                                        <SelectItem value="3x" className="font-bold cursor-pointer rounded-lg">3x Mega Boost</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Total Budget Pool</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Maximum points pool allocated to this campaign.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input placeholder="e.g. 1500000" defaultValue="1500000" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Dynamic Scaling</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Automatically adjusts rewards down as budget depletes.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                                                <span className="text-sm font-bold text-slate-700">Enable algorithmic budget protection</span>
                                                <Switch defaultChecked />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 5 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">5. Promotion Design</h3>
                                        <p className="text-sm font-bold text-slate-500">How this campaign appears in the consumer app.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Banner Artwork</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Dimensions: 1200x400px minimum. WebP preferred.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer group">
                                                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">Click to upload banner image</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Marketing Copy</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Keep it punchy. Under 120 characters.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Textarea placeholder="Earn double points all weekend long!" className="resize-none h-24 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 6 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">6. Scheduling</h3>
                                        <p className="text-sm font-bold text-slate-500">Set the exact timeline for campaign active hours.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Start Date</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">When the campaign becomes visible in-app.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input type="date" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">End Date</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Campaign automatically disables at 23:59 on this date.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input type="date" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Timeboxing</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Restrict rewards to specific times of day.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                                                <span className="text-sm font-bold text-slate-700">Limit to Happy Hour (2PM - 6PM)</span>
                                                <Switch />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 7 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">7. Review & Launch</h3>
                                        <p className="text-sm font-bold text-slate-500">Verify your campaign configurations before pushing to production.</p>
                                    </div>
                                    <Card className="border-slate-200 bg-white shadow-sm rounded-3xl p-6">
                                        <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            <div>
                                                <span className="font-black text-emerald-900">All checks passed. Ready for launch.</span>
                                                <p className="text-xs font-bold text-emerald-700 mt-1">No budget warnings or targeting conflicts detected.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-500">Campaign Name</span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Step 1 Details</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="font-black text-slate-900">Summer Festival 2024</span>
                                            </div>
                                            <Separator className="bg-slate-100" />
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-500">Target Boroughs</span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Step 2 Geography</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="font-black text-slate-900">Camden, Islington</span>
                                            </div>
                                            <Separator className="bg-slate-100" />
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-500">Businesses Assigned</span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Step 3 Participants</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="font-black text-slate-900">142 Active Storefronts</span>
                                            </div>
                                            <Separator className="bg-slate-100" />
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-500">Rewards Pool</span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Step 4 Economics</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="font-black text-slate-900">1.5M Points Cap (2x Multiplier)</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </TooltipProvider>
                    </div>
                    
                    <DialogFooter className="p-6 bg-white border-t border-slate-100 flex-shrink-0 flex items-center justify-between">
                        <Button 
                            variant="ghost" 
                            className={cn("rounded-xl font-bold gap-2", createStep === 1 ? "invisible" : "")}
                            onClick={() => setCreateStep(s => Math.max(1, s - 1))}
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => setCreateModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                            {createStep < 7 ? (
                                <Button 
                                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-white shadow-lg shadow-indigo-200 gap-2 px-8"
                                    onClick={() => setCreateStep(s => Math.min(7, s + 1))}
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button 
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-white shadow-lg shadow-emerald-200 gap-2 px-8"
                                    onClick={() => setCreateModalOpen(false)}
                                >
                                    <Zap className="w-4 h-4" /> {createModalMode === 'edit' ? 'Save Changes' : 'Launch Campaign'}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Immersive Analytics Modal */}
            <Dialog open={analyticsModalOpen} onOpenChange={setAnalyticsModalOpen}>
                <DialogContent className="rounded-[3rem] border border-orange-100 shadow-2xl p-0 overflow-hidden sm:max-w-[95vw] h-[95vh] flex flex-col bg-white text-slate-900">
                    {/* Immersive Header */}
                    <div className="p-8 flex-shrink-0 relative overflow-hidden border-b border-orange-50">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-orange-50/50 z-0" />
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-200/30 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-orange-100 border border-orange-200 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.15)]">
                                    <BarChart3 className="w-10 h-10 text-orange-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900">{analyticsCampaign?.name}</h2>
                                        <Badge className="bg-orange-100 text-orange-700 border-none px-3 font-black tracking-widest uppercase text-[10px]">{analyticsCampaign?.status}</Badge>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">Deep-dive performance metrics for {analyticsCampaign?.borough} • {analyticsCampaign?.startDate} to {analyticsCampaign?.endDate}</p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => setAnalyticsModalOpen(false)} className="rounded-xl font-bold hover:bg-orange-100 text-slate-600 h-12 px-6">Close Analytics</Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 pt-0 z-10 space-y-6">
                        {/* High-Level KPIs */}
                        <div className="grid grid-cols-4 gap-6">
                            {[
                                { label: 'Attributed Revenue', val: analyticsCampaign?.revenue, change: '+14.2%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Points Distributed', val: '1.24M', change: '+5.4%', icon: Gift, color: 'text-orange-600', bg: 'bg-orange-50' },
                                { label: 'Total Reach', val: analyticsCampaign?.reach, change: '+22.1%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Engagement Rate', val: `${analyticsCampaign?.engagement}%`, change: '+8.3%', icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-50' },
                            ].map((kpi, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-5">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", kpi.bg)}>
                                        <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{kpi.label}</p>
                                        <div className="flex items-end gap-3">
                                            <p className="text-2xl font-black text-slate-900">{kpi.val}</p>
                                            <p className="text-xs font-black text-emerald-600 mb-1">{kpi.change}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="col-span-2 p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-black text-slate-900">Revenue & Engagement Timeline</h3>
                                    <Select defaultValue="7d">
                                        <SelectTrigger className="w-32 h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-700 font-bold">
                                            <SelectValue placeholder="Last 7 Days" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-100 text-slate-700 rounded-xl shadow-lg">
                                            <SelectItem value="7d" className="font-bold rounded-lg cursor-pointer">Last 7 Days</SelectItem>
                                            <SelectItem value="30d" className="font-bold rounded-lg cursor-pointer">Last 30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full h-72 rounded-2xl bg-gradient-to-t from-orange-50/50 to-transparent border border-orange-100 flex items-end justify-between px-8 pb-4 relative">
                                    {/* Mock Chart Bars */}
                                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                        <div key={i} className="w-12 bg-orange-400/80 rounded-t-lg relative group transition-all hover:bg-orange-500 cursor-crosshair" style={{ height: `${h}%` }}>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                £{(h * 120).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Businesses */}
                            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6 flex flex-col">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Top Participating Businesses</h3>
                                    <p className="text-xs font-bold text-slate-500">Highest volume generated during campaign.</p>
                                </div>
                                <div className="space-y-4 flex-1">
                                    {[
                                        { name: 'The Artisan Bakery', rev: '£12,450', pts: '45k' },
                                        { name: 'Camden Records', rev: '£9,800', pts: '32k' },
                                        { name: 'Neon Vintage', rev: '£7,200', pts: '28k' },
                                        { name: 'Borough Coffee Co.', rev: '£5,400', pts: '19k' },
                                    ].map((biz, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-black text-orange-600">{i+1}</div>
                                                <p className="text-sm font-bold text-slate-700">{biz.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">{biz.rev}</p>
                                                <p className="text-[10px] font-bold text-slate-500">{biz.pts} pts</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
