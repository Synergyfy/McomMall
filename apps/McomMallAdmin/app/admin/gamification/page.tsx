'use client';

import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Edit3,
    ArrowUpRight,
    ArrowDownRight,
    MapPin,
    TrendingUp,
    Download,
    Plus,
    Pause,
    Zap,
    ChevronRight,
    ChevronLeft,
    Check,
    Play,
    Flame,
    Crown,
    Heart,
    Gift,
    X,
    AlertTriangle,
    Sparkles,
    BarChart3,
    DollarSign,
    Users,
    Activity,
    Info,
    Star,
    Dice1,
    Dice5,
    Target,
    Trophy,
    Medal,
    CalendarCheck,
    Share2,
    Settings,
    Percent,
    Eye,
    Trash2,
    Rocket,
    ShieldAlert,
    RotateCcw,
    Box,
    Layers,
    Ticket,
    Timer,
    Gamepad2,
    UploadCloud,
    Clock,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// --- Mock Data ---

const gameTypeCards = [
    { key: 'spin', label: 'Spin Wheel', icon: RotateCcw, color: 'from-violet-500 to-fuchsia-500', shadow: 'shadow-violet-200', activeGames: 4, players: '12.4k', emoji: '🎡' },
    { key: 'box', label: 'Box Rewards', icon: Box, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-200', activeGames: 3, players: '8.9k', emoji: '📦' },
    { key: 'scratch', label: 'Scratch Cards', icon: Layers, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-200', activeGames: 5, players: '15.2k', emoji: '🎫' },
    { key: 'challenge', label: 'Challenges', icon: Target, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-200', activeGames: 8, players: '22.1k', emoji: '🏆' },
    { key: 'checkin', label: 'Daily Check-ins', icon: CalendarCheck, color: 'from-amber-500 to-yellow-500', shadow: 'shadow-amber-200', activeGames: 2, players: '31.5k', emoji: '📅' },
    { key: 'referral', label: 'Referral Games', icon: Share2, color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-200', activeGames: 3, players: '6.8k', emoji: '🤝' },
];

const mockGames = [
    {
        id: 'GAM-101',
        name: 'Lucky Spin Weekend',
        type: 'spin',
        typeLabel: 'Spin Wheel',
        borough: 'Camden',
        status: 'Active',
        participants: 4521,
        rewardsGiven: 2180,
        engagement: 89,
        winRate: 34,
        launchedDate: 'Jun 1, 2024',
        abuseFlag: false,
    },
    {
        id: 'GAM-102',
        name: 'Mystery Box Madness',
        type: 'box',
        typeLabel: 'Box Rewards',
        borough: 'Hackney',
        status: 'Active',
        participants: 3200,
        rewardsGiven: 1420,
        engagement: 76,
        winRate: 45,
        launchedDate: 'May 20, 2024',
        abuseFlag: false,
    },
    {
        id: 'GAM-103',
        name: 'Scratch & Win Summer',
        type: 'scratch',
        typeLabel: 'Scratch Cards',
        borough: 'Westminster',
        status: 'Active',
        participants: 8900,
        rewardsGiven: 4200,
        engagement: 94,
        winRate: 28,
        launchedDate: 'Jun 5, 2024',
        abuseFlag: false,
    },
    {
        id: 'GAM-104',
        name: '7-Day Streak Challenge',
        type: 'challenge',
        typeLabel: 'Challenges',
        borough: 'All Boroughs',
        status: 'Active',
        participants: 15200,
        rewardsGiven: 6800,
        engagement: 91,
        winRate: 62,
        launchedDate: 'May 1, 2024',
        abuseFlag: false,
    },
    {
        id: 'GAM-105',
        name: 'Daily Login Rewards',
        type: 'checkin',
        typeLabel: 'Daily Check-ins',
        borough: 'All Boroughs',
        status: 'Active',
        participants: 31500,
        rewardsGiven: 18400,
        engagement: 97,
        winRate: 100,
        launchedDate: 'Jan 1, 2024',
        abuseFlag: false,
    },
    {
        id: 'GAM-106',
        name: 'Refer a Friend Frenzy',
        type: 'referral',
        typeLabel: 'Referral Games',
        borough: 'Islington',
        status: 'Paused',
        participants: 2100,
        rewardsGiven: 890,
        engagement: 64,
        winRate: 42,
        launchedDate: 'Apr 15, 2024',
        abuseFlag: true,
    },
    {
        id: 'GAM-107',
        name: 'Greenwich Gold Rush',
        type: 'scratch',
        typeLabel: 'Scratch Cards',
        borough: 'Greenwich',
        status: 'Scheduled',
        participants: 0,
        rewardsGiven: 0,
        engagement: 0,
        winRate: 30,
        launchedDate: 'Jul 1, 2024',
        abuseFlag: false,
    },
    {
        id: 'GAM-108',
        name: 'Weekend Warrior Spin',
        type: 'spin',
        typeLabel: 'Spin Wheel',
        borough: 'Lambeth',
        status: 'Ended',
        participants: 5600,
        rewardsGiven: 2800,
        engagement: 72,
        winRate: 38,
        launchedDate: 'Mar 1, 2024',
        abuseFlag: false,
    },
];

const kpis = [
    { title: 'Active Games', value: '25', trend: '+4', trendType: 'up', icon: Gamepad2, color: 'text-violet-600', bg: 'bg-violet-50' },
    { title: 'Rewards Distributed', value: '36.7k', trend: '+12%', trendType: 'up', icon: Gift, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Daily Participants', value: '18.4k', trend: '+8%', trendType: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Leaderboard Activity', value: '4.2k', trend: '+15%', trendType: 'up', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Engagement Rate', value: '84%', trend: '+6%', trendType: 'up', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Abuse Reports', value: '3', trend: '-2', trendType: 'down', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function GamificationManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState('all');

    // Create Game Modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createModalMode, setCreateModalMode] = useState<'create' | 'edit'>('create');
    const [editingGame, setEditingGame] = useState<any>(null);
    const [createStep, setCreateStep] = useState(1);

    // Action Modals
    const [rewardsModal, setRewardsModal] = useState<{ open: boolean; game: any }>({ open: false, game: null });
    const [rulesModal, setRulesModal] = useState<{ open: boolean; game: any }>({ open: false, game: null });
    const [probabilityModal, setProbabilityModal] = useState<{ open: boolean; game: any }>({ open: false, game: null });
    const [boroughModal, setBoroughModal] = useState<{ open: boolean; game: any }>({ open: false, game: null });
    const [launchModal, setLaunchModal] = useState<{ open: boolean; game: any }>({ open: false, game: null });
    const [pauseModal, setPauseModal] = useState<{ open: boolean; game: any }>({ open: false, game: null });

    const steps = ['Game Setup', 'Rewards', 'Rules', 'Probabilities', 'Borough', 'Review'];

    const filteredGames = useMemo(() => {
        return mockGames.filter(g => {
            const matchesSearch =
                g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.borough.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = activeType === 'all' || g.type === activeType;
            return matchesSearch && matchesType;
        });
    }, [searchQuery, activeType]);

    const getTypeColor = (type: string) => {
        const card = gameTypeCards.find(c => c.key === type);
        return card?.color || 'from-slate-500 to-slate-600';
    };

    const getTypeEmoji = (type: string) => {
        const card = gameTypeCards.find(c => c.key === type);
        return card?.emoji || '🎮';
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20 relative">
                            <Gamepad2 className="w-6 h-6 text-white" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                                <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gamification Management</h1>
                            <p className="text-sm font-bold text-slate-500 mt-1">Energize your high streets with games, rewards, and challenges.</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 font-bold text-slate-700 border-slate-200 bg-white rounded-xl shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Export Data
                    </Button>
                    <Button className="h-11 px-6 font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl shadow-lg shadow-violet-200 gap-2" onClick={() => { setCreateStep(1); setCreateModalMode('create'); setEditingGame(null); setCreateModalOpen(true); }}>
                        <Plus className="w-4 h-4" /> Create Game
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm hover:border-violet-200 transition-all group bg-white rounded-3xl overflow-hidden relative">
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
                                    kpi.trendType === 'down' && kpi.title === 'Abuse Reports' ? "bg-emerald-50 text-emerald-600" :
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

            {/* Game Types — Interactive Visual Cards */}
            <div>
                <h2 className="text-lg font-black text-slate-900 mb-4">Game Types</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {gameTypeCards.map((type) => (
                        <button
                            key={type.key}
                            onClick={() => setActiveType(activeType === type.key ? 'all' : type.key)}
                            className={cn(
                                "relative overflow-hidden rounded-3xl p-5 text-left transition-all duration-300 group border-2",
                                activeType === type.key
                                    ? "border-violet-400 shadow-xl scale-[1.02]"
                                    : "border-transparent shadow-sm hover:shadow-lg hover:scale-[1.01]"
                            )}
                        >
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", type.color)} />
                            <div className="absolute -bottom-4 -right-4 text-6xl opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 transform duration-500">{type.emoji}</div>
                            <div className="relative z-10 space-y-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <type.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">{type.label}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{type.activeGames} active</span>
                                        <span className="text-[10px] font-black text-white/70">{type.players}</span>
                                    </div>
                                </div>
                            </div>
                            {activeType === type.key && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                                    <Check className="w-3.5 h-3.5 text-violet-600" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Games Table */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Game Directory</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">All active, scheduled, and past games across boroughs.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search games..."
                                    className="pl-11 h-12 text-sm font-bold border-slate-200 shadow-sm bg-white rounded-xl focus:ring-2 focus:ring-violet-100 transition-all"
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
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">Game Name</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Type</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Borough</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Status</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Participants</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Win Rate</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Engagement</TableHead>
                                <TableHead className="text-right pr-8 h-14"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGames.map((g) => (
                                <TableRow
                                    key={g.id}
                                    className="hover:bg-violet-50/30 cursor-pointer group transition-colors"
                                >
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-sm flex-shrink-0", getTypeColor(g.type))}>
                                                {getTypeEmoji(g.type)}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors">{g.name}</p>
                                                    {g.abuseFlag && (
                                                        <Badge className="bg-red-100 text-red-700 border-none text-[9px] font-black px-2 py-0.5">
                                                            <ShieldAlert className="w-3 h-3 mr-1" /> FLAGGED
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{g.id} • Launched {g.launchedDate}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge variant="outline" className="text-[10px] font-black border-slate-200 text-slate-600 px-3 py-1 rounded-full">
                                            {g.typeLabel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {g.borough}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                                            g.status === 'Active' ? "bg-emerald-100 text-emerald-700" :
                                            g.status === 'Scheduled' ? "bg-blue-100 text-blue-700" :
                                            g.status === 'Paused' ? "bg-amber-100 text-amber-700" :
                                            "bg-slate-100 text-slate-600"
                                        )}>
                                            {g.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <p className="text-sm font-black text-slate-900">{g.participants.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-slate-500">{g.rewardsGiven.toLocaleString()} rewards</p>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full rounded-full",
                                                    g.winRate > 60 ? "bg-emerald-500" :
                                                    g.winRate > 30 ? "bg-violet-500" : "bg-amber-500"
                                                )} style={{ width: `${g.winRate}%` }} />
                                            </div>
                                            <span className="text-xs font-black text-slate-900">{g.winRate}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col items-center gap-1.5 w-full px-4">
                                            <span className={cn(
                                                "text-[10px] font-black",
                                                g.engagement > 80 ? "text-emerald-600" :
                                                g.engagement > 50 ? "text-violet-600" : "text-slate-400"
                                            )}>{g.engagement}%</span>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full rounded-full transition-all",
                                                    g.engagement > 80 ? "bg-emerald-500" :
                                                    g.engagement > 50 ? "bg-violet-500" : "bg-slate-300"
                                                )} style={{ width: `${g.engagement}%` }} />
                                            </div>
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
                                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Game Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={(e) => { e.stopPropagation(); setCreateStep(1); setCreateModalMode('edit'); setEditingGame(g); setCreateModalOpen(true); }}>
                                                    <Edit3 className="w-4 h-4 text-slate-500" /> Edit Game
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-orange-600" onClick={(e) => { e.stopPropagation(); setRewardsModal({ open: true, game: g }); }}>
                                                    <Gift className="w-4 h-4" /> Configure Rewards
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-blue-600" onClick={(e) => { e.stopPropagation(); setRulesModal({ open: true, game: g }); }}>
                                                    <Settings className="w-4 h-4" /> Set Rules
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-violet-600" onClick={(e) => { e.stopPropagation(); setProbabilityModal({ open: true, game: g }); }}>
                                                    <Dice5 className="w-4 h-4" /> Set Probabilities
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-emerald-600" onClick={(e) => { e.stopPropagation(); setBoroughModal({ open: true, game: g }); }}>
                                                    <MapPin className="w-4 h-4" /> Assign Boroughs
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                {g.status === 'Scheduled' ? (
                                                    <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-fuchsia-600" onClick={(e) => { e.stopPropagation(); setLaunchModal({ open: true, game: g }); }}>
                                                        <Rocket className="w-4 h-4" /> Launch Now
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-amber-600" onClick={(e) => { e.stopPropagation(); setPauseModal({ open: true, game: g }); }}>
                                                        {g.status === 'Paused' ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ====== CREATE / EDIT GAME WIZARD ====== */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl p-0 overflow-hidden sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 text-white relative flex-shrink-0 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-400/10 rounded-full blur-2xl" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black shadow-lg backdrop-blur-sm">
                                🎮
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{createModalMode === 'edit' ? `Edit: ${editingGame?.name}` : 'Create New Game'}</h2>
                                <p className="text-xs font-bold text-violet-100 mt-1">{createModalMode === 'edit' ? 'Modify game mechanics, rewards, and targeting.' : 'Design an engaging game experience for your community.'}</p>
                            </div>
                        </div>
                        {/* Stepper */}
                        <div className="mt-8 flex items-center justify-between w-full relative z-10">
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/20 rounded-full" />
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-white rounded-full transition-all duration-500" style={{ width: `${((createStep - 1) / (steps.length - 1)) * 100}%` }} />
                            {steps.map((stepName, idx) => {
                                const stepNum = idx + 1;
                                const isActive = stepNum === createStep;
                                const isCompleted = stepNum < createStep;
                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors shadow-lg",
                                            isActive ? "bg-white text-violet-600 border-4 border-violet-500" :
                                            isCompleted ? "bg-white text-violet-600" : "bg-violet-700 text-violet-300 border-2 border-violet-400"
                                        )}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest absolute -bottom-6 w-24 text-center",
                                            isActive ? "text-white" : isCompleted ? "text-violet-100" : "text-violet-300"
                                        )}>{stepName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 flex-1 overflow-y-auto min-h-[300px] max-h-[50vh]">
                        <TooltipProvider>
                            {/* Step 1: Game Setup */}
                            {createStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">1. Game Setup</h3>
                                        <p className="text-sm font-bold text-slate-500">Define the core mechanics and identity.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Game Name</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Customer-facing game title. Make it exciting!</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input placeholder="e.g. Lucky Spin Weekend" defaultValue={createModalMode === 'edit' ? editingGame?.name : ''} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Game Type</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">The core mechanic players will interact with.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {gameTypeCards.map((type) => (
                                                    <div key={type.key} className={cn(
                                                        "relative overflow-hidden rounded-2xl p-4 cursor-pointer border-2 transition-all hover:scale-[1.02]",
                                                        "border-slate-200 hover:border-violet-300"
                                                    )}>
                                                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", type.color)} />
                                                        <div className="relative z-10 flex items-center gap-3">
                                                            <span className="text-2xl">{type.emoji}</span>
                                                            <span className="text-sm font-black text-slate-900">{type.label}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Description</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Brief description shown on the game screen. Max 200 chars.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Textarea placeholder="Spin the wheel every weekend for a chance to win amazing prizes!" className="resize-none h-24 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Rewards */}
                            {createStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">2. Configure Rewards</h3>
                                        <p className="text-sm font-bold text-slate-500">Define what players can win.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Reward Tiers</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Each tier represents a possible outcome. Configure value and frequency.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            {[
                                                { tier: 'Grand Prize', emoji: '🏆', color: 'bg-amber-50 border-amber-200' },
                                                { tier: 'Major Reward', emoji: '🎁', color: 'bg-violet-50 border-violet-200' },
                                                { tier: 'Minor Reward', emoji: '⭐', color: 'bg-blue-50 border-blue-200' },
                                                { tier: 'Consolation', emoji: '🎯', color: 'bg-slate-50 border-slate-200' },
                                            ].map((reward, i) => (
                                                <div key={i} className={cn("p-4 rounded-2xl border flex items-center gap-4", reward.color)}>
                                                    <span className="text-2xl">{reward.emoji}</span>
                                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-500 uppercase">{reward.tier}</label>
                                                            <Input placeholder="e.g. £50 voucher" className="h-10 rounded-lg border-slate-200 bg-white text-sm font-bold mt-1" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-500 uppercase">Value</label>
                                                            <Input placeholder="£50" className="h-10 rounded-lg border-slate-200 bg-white text-sm font-bold mt-1" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-500 uppercase">Daily Limit</label>
                                                            <Input placeholder="5" type="number" className="h-10 rounded-lg border-slate-200 bg-white text-sm font-bold mt-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Total Reward Budget</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Maximum total value of rewards that can be distributed.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input placeholder="e.g. £10,000" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Rules */}
                            {createStep === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">3. Set Rules</h3>
                                        <p className="text-sm font-bold text-slate-500">Define participation rules and anti-abuse measures.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Plays Per Day</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Max times a user can play per day.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input placeholder="e.g. 3" type="number" defaultValue="3" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Min. Points to Play</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Minimum loyalty points required to participate.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input placeholder="e.g. 100" type="number" defaultValue="100" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Require verified email', tooltip: 'Players must have a verified email to participate.', checked: true },
                                                { label: 'Require minimum 1 purchase', tooltip: 'Players must have at least 1 completed transaction.', checked: true },
                                                { label: 'Block flagged accounts', tooltip: 'Automatically block users flagged for abuse.', checked: true },
                                                { label: 'Allow repeated wins', tooltip: 'Same user can win the same reward tier multiple times.', checked: false },
                                                { label: 'Cooldown between plays', tooltip: 'Enforce a minimum wait time between each play attempt.', checked: false },
                                            ].map((rule, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-slate-700">{rule.label}</span>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild><Info className="w-3.5 h-3.5 text-slate-400 cursor-help" /></TooltipTrigger>
                                                            <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">{rule.tooltip}</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <Switch defaultChecked={rule.checked} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Probabilities */}
                            {createStep === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">4. Set Probabilities</h3>
                                        <p className="text-sm font-bold text-slate-500">Fine-tune the odds for each reward tier.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex items-center gap-3 mb-2">
                                            <Dice5 className="w-5 h-5 text-violet-600 flex-shrink-0" />
                                            <p className="text-xs font-bold text-violet-800">Probabilities must total 100%. Adjust the sliders to distribute odds across tiers.</p>
                                        </div>
                                        {[
                                            { tier: 'Grand Prize', emoji: '🏆', value: 2, color: 'text-amber-600' },
                                            { tier: 'Major Reward', emoji: '🎁', value: 8, color: 'text-violet-600' },
                                            { tier: 'Minor Reward', emoji: '⭐', value: 30, color: 'text-blue-600' },
                                            { tier: 'Consolation', emoji: '🎯', value: 40, color: 'text-slate-600' },
                                            { tier: 'No Win', emoji: '❌', value: 20, color: 'text-red-500' },
                                        ].map((prob, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{prob.emoji}</span>
                                                        <span className="text-sm font-black text-slate-900">{prob.tier}</span>
                                                    </div>
                                                    <span className={cn("text-lg font-black", prob.color)}>{prob.value}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={cn(
                                                        "h-full rounded-full transition-all",
                                                        prob.tier === 'Grand Prize' ? "bg-amber-400" :
                                                        prob.tier === 'Major Reward' ? "bg-violet-500" :
                                                        prob.tier === 'Minor Reward' ? "bg-blue-400" :
                                                        prob.tier === 'Consolation' ? "bg-slate-400" : "bg-red-300"
                                                    )} style={{ width: `${prob.value}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                        <Separator className="bg-slate-100" />
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm font-black text-slate-900">Total</span>
                                            <span className="text-lg font-black text-emerald-600">100% ✓</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Borough Assignment */}
                            {createStep === 5 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">5. Assign Boroughs</h3>
                                        <p className="text-sm font-bold text-slate-500">Where will this game be available?</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-violet-50 border border-violet-100">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-violet-900">All Boroughs</p>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-violet-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Make this game available across all London boroughs.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <p className="text-xs font-bold text-violet-700 mt-1">Game will be accessible to all registered users.</p>
                                            </div>
                                            <Switch />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Specific Boroughs</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Select individual boroughs for geographic targeting.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {['Camden', 'Hackney', 'Islington', 'Westminster', 'Greenwich', 'Lambeth'].map((b, i) => (
                                                    <div key={b} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-violet-50 transition-colors">
                                                        <Checkbox id={`gam-borough-${i}`} defaultChecked={i === 0 || i === 3} />
                                                        <label htmlFor={`gam-borough-${i}`} className="text-sm font-bold text-slate-700 cursor-pointer">{b}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Review */}
                            {createStep === 6 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">6. Review & Launch</h3>
                                        <p className="text-sm font-bold text-slate-500">Double-check everything before going live.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Game Summary</h4>
                                            <div className="grid grid-cols-2 gap-6">
                                                {[
                                                    { label: 'Game Name', value: createModalMode === 'edit' ? editingGame?.name : 'Lucky Spin Weekend' },
                                                    { label: 'Game Type', value: 'Spin Wheel' },
                                                    { label: 'Boroughs', value: 'Camden, Westminster' },
                                                    { label: 'Plays/Day', value: '3 per user' },
                                                    { label: 'Grand Prize', value: '£50 voucher (2%)' },
                                                    { label: 'Total Budget', value: '£10,000' },
                                                    { label: 'Anti-Abuse', value: 'Email verified + 1 purchase' },
                                                    { label: 'Repeated Wins', value: 'Disabled' },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                                        <span className="text-sm font-black text-slate-900">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 rounded-2xl border border-violet-100 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                <Rocket className="w-5 h-5 text-violet-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-violet-900">Ready to launch</p>
                                                <p className="text-xs font-bold text-violet-700 mt-0.5">This game will become available to players in the selected boroughs immediately.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TooltipProvider>
                    </div>

                    <DialogFooter className="p-6 border-t border-slate-100 bg-white flex-shrink-0 flex justify-between">
                        <Button
                            variant="ghost"
                            className="rounded-xl font-bold text-slate-600 hover:bg-slate-100 gap-2"
                            onClick={() => createStep > 1 ? setCreateStep(s => s - 1) : setCreateModalOpen(false)}
                        >
                            {createStep > 1 ? <><ChevronLeft className="w-4 h-4" /> Back</> : 'Cancel'}
                        </Button>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-400">Step {createStep} of {steps.length}</span>
                            {createStep < 6 ? (
                                <Button
                                    className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 font-black text-white shadow-lg shadow-violet-200 gap-2 px-8"
                                    onClick={() => setCreateStep(s => Math.min(6, s + 1))}
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-white shadow-lg shadow-emerald-200 gap-2 px-8"
                                    onClick={() => setCreateModalOpen(false)}
                                >
                                    <Rocket className="w-4 h-4" /> {createModalMode === 'edit' ? 'Save Changes' : 'Launch Game'}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ====== CONFIGURE REWARDS MODAL ====== */}
            <Dialog open={rewardsModal.open} onOpenChange={(o) => setRewardsModal({ ...rewardsModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-2xl">
                    <div className="flex flex-col py-6 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center">
                                <Gift className="w-8 h-8 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Configure Rewards</h2>
                                <p className="text-sm font-bold text-slate-500 mt-1">Adjust reward tiers for <span className="text-slate-900 font-black">{rewardsModal.game?.name}</span></p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { tier: 'Grand Prize', current: '£50 voucher', limit: '5/day', emoji: '🏆' },
                                { tier: 'Major Reward', current: '£20 voucher', limit: '20/day', emoji: '🎁' },
                                { tier: 'Minor Reward', current: '500 points', limit: '100/day', emoji: '⭐' },
                                { tier: 'Consolation', current: '50 points', limit: 'Unlimited', emoji: '🎯' },
                            ].map((r, i) => (
                                <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center gap-4">
                                    <span className="text-2xl">{r.emoji}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-slate-900">{r.tier}</p>
                                        <p className="text-xs font-bold text-slate-500">Current: {r.current} • Limit: {r.limit}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs">Edit</Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setRewardsModal({ open: false, game: null })}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 font-black text-white h-12 shadow-lg shadow-orange-200" onClick={() => setRewardsModal({ open: false, game: null })}>
                                Save Rewards
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== SET RULES MODAL ====== */}
            <Dialog open={rulesModal.open} onOpenChange={(o) => setRulesModal({ ...rulesModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col py-6 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center">
                                <Settings className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Set Rules</h2>
                                <p className="text-sm font-bold text-slate-500 mt-1">Configure participation rules for <span className="text-slate-900 font-black">{rulesModal.game?.name}</span></p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Require verified email', checked: true },
                                { label: 'Minimum 1 completed purchase', checked: true },
                                { label: 'Block flagged accounts', checked: true },
                                { label: 'Allow repeated wins per tier', checked: false },
                                { label: 'Enable 30-minute cooldown', checked: false },
                            ].map((rule, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                                    <span className="text-sm font-bold text-slate-700">{rule.label}</span>
                                    <Switch defaultChecked={rule.checked} />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Max Plays / Day</label>
                                <Input defaultValue="3" type="number" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Min. Points</label>
                                <Input defaultValue="100" type="number" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setRulesModal({ open: false, game: null })}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-white h-12 shadow-lg shadow-blue-200" onClick={() => setRulesModal({ open: false, game: null })}>
                                Save Rules
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== SET PROBABILITIES MODAL ====== */}
            <Dialog open={probabilityModal.open} onOpenChange={(o) => setProbabilityModal({ ...probabilityModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col py-6 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-violet-100 flex items-center justify-center">
                                <Dice5 className="w-8 h-8 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Set Probabilities</h2>
                                <p className="text-sm font-bold text-slate-500 mt-1">Adjust win odds for <span className="text-slate-900 font-black">{probabilityModal.game?.name}</span></p>
                            </div>
                        </div>
                        <div className="bg-violet-50 p-3 rounded-xl border border-violet-100">
                            <p className="text-xs font-bold text-violet-800 text-center">Current Win Rate: <span className="font-black">{probabilityModal.game?.winRate}%</span> • Must total 100%</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { tier: '🏆 Grand Prize', value: 2, bar: 'bg-amber-400' },
                                { tier: '🎁 Major Reward', value: 8, bar: 'bg-violet-500' },
                                { tier: '⭐ Minor Reward', value: 30, bar: 'bg-blue-400' },
                                { tier: '🎯 Consolation', value: 40, bar: 'bg-slate-400' },
                                { tier: '❌ No Win', value: 20, bar: 'bg-red-300' },
                            ].map((p, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black text-slate-900">{p.tier}</span>
                                        <Input defaultValue={p.value} type="number" className="w-20 h-8 rounded-lg text-center font-black text-sm border-slate-200" />
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", p.bar)} style={{ width: `${p.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setProbabilityModal({ open: false, game: null })}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 font-black text-white h-12 shadow-lg shadow-violet-200" onClick={() => setProbabilityModal({ open: false, game: null })}>
                                Save Probabilities
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== ASSIGN BOROUGHS MODAL ====== */}
            <Dialog open={boroughModal.open} onOpenChange={(o) => setBoroughModal({ ...boroughModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col py-6 space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Assign Boroughs</h2>
                                <p className="text-sm font-bold text-slate-500 mt-1">Set geographic availability for <span className="text-slate-900 font-black">{boroughModal.game?.name}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <div>
                                <p className="font-black text-emerald-900">All Boroughs</p>
                                <p className="text-xs font-bold text-emerald-700 mt-0.5">Currently: {boroughModal.game?.borough}</p>
                            </div>
                            <Switch defaultChecked={boroughModal.game?.borough === 'All Boroughs'} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['Camden', 'Hackney', 'Islington', 'Westminster', 'Greenwich', 'Lambeth', 'Southwark', 'Tower Hamlets'].map((b, i) => (
                                <div key={b} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-emerald-50 transition-colors">
                                    <Checkbox id={`assign-borough-${i}`} defaultChecked={boroughModal.game?.borough === b || boroughModal.game?.borough === 'All Boroughs'} />
                                    <label htmlFor={`assign-borough-${i}`} className="text-sm font-bold text-slate-700 cursor-pointer">{b}</label>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setBoroughModal({ open: false, game: null })}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-white h-12 shadow-lg shadow-emerald-200" onClick={() => setBoroughModal({ open: false, game: null })}>
                                Save Boroughs
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== LAUNCH MODAL ====== */}
            <Dialog open={launchModal.open} onOpenChange={(o) => setLaunchModal({ ...launchModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col items-center text-center py-6 space-y-5">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                            <Rocket className="w-10 h-10 text-fuchsia-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Launch Game Now</h2>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                <span className="text-slate-900 font-black">"{launchModal.game?.name}"</span> will go live immediately in <span className="text-slate-900 font-black">{launchModal.game?.borough}</span>.
                            </p>
                        </div>
                        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 rounded-2xl border border-violet-100 w-full">
                            <p className="text-xs font-bold text-violet-800 text-center">Players will be notified via push notification and in-app banner.</p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setLaunchModal({ open: false, game: null })}>Not Yet</Button>
                            <Button className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 font-black text-white h-12 shadow-lg shadow-violet-200" onClick={() => setLaunchModal({ open: false, game: null })}>
                                <Rocket className="w-4 h-4 mr-2" /> Launch Now
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== PAUSE/RESUME MODAL ====== */}
            <Dialog open={pauseModal.open} onOpenChange={(o) => setPauseModal({ ...pauseModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col items-center text-center py-6 space-y-5">
                        <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center">
                            {pauseModal.game?.status === 'Paused'
                                ? <Play className="w-10 h-10 text-emerald-600" />
                                : <Pause className="w-10 h-10 text-amber-600" />
                            }
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                {pauseModal.game?.status === 'Paused' ? 'Resume Game' : 'Pause Game'}
                            </h2>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                {pauseModal.game?.status === 'Paused'
                                    ? `"${pauseModal.game?.name}" will resume and become playable again.`
                                    : `"${pauseModal.game?.name}" will be temporarily unavailable to all players.`
                                }
                            </p>
                        </div>
                        {pauseModal.game?.status !== 'Paused' && (
                            <div className="w-full space-y-3 text-left">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Reason</label>
                                <Textarea placeholder="e.g. Adjusting reward tiers, investigating abuse..." className="resize-none h-20 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                            </div>
                        )}
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setPauseModal({ open: false, game: null })}>Cancel</Button>
                            <Button className={cn("flex-1 rounded-xl font-black text-white h-12 shadow-lg",
                                pauseModal.game?.status === 'Paused' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                            )} onClick={() => setPauseModal({ open: false, game: null })}>
                                {pauseModal.game?.status === 'Paused'
                                    ? <><Play className="w-4 h-4 mr-2" /> Resume</>
                                    : <><Pause className="w-4 h-4 mr-2" /> Pause</>
                                }
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
