'use client';

import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Edit3,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    MapPin,
    TrendingUp,
    Download,
    Calendar,
    Plus,
    Pause,
    Zap,
    ChevronRight,
    ChevronLeft,
    Check,
    Clock,
    Percent,
    Tag,
    Eye,
    Trash2,
    Play,
    Timer,
    Flame,
    Snowflake,
    Crown,
    Heart,
    Gift,
    X,
    AlertTriangle,
    CalendarPlus,
    Sparkles,
    Store,
    BarChart3,
    DollarSign,
    Users,
    Activity,
    ShoppingBag,
    Building2,
    Info,
    UploadCloud,
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
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// --- Mock Data ---

const promotionTypes = [
    { key: 'all', label: 'All Promotions', icon: Tag, count: 48 },
    { key: 'flash', label: 'Flash Deals', icon: Flame, count: 14 },
    { key: 'seasonal', label: 'Seasonal', icon: Snowflake, count: 8 },
    { key: 'borough', label: 'Borough', icon: MapPin, count: 12 },
    { key: 'featured', label: 'Featured', icon: Crown, count: 6 },
    { key: 'loyalty', label: 'Loyalty', icon: Heart, count: 8 },
];

const mockPromotions = [
    {
        id: 'PRM-401',
        name: '50% Off First Order',
        business: 'The Artisan Bakery',
        borough: 'Camden',
        discount: '50%',
        type: 'flash',
        status: 'Active',
        performance: 92,
        redemptions: 1842,
        revenue: '£24,500',
        expiration: 'Jun 15, 2024',
        featured: true,
    },
    {
        id: 'PRM-402',
        name: 'Summer BOGO Drinks',
        business: 'Borough Coffee Co.',
        borough: 'Hackney',
        discount: 'BOGO',
        type: 'seasonal',
        status: 'Active',
        performance: 78,
        redemptions: 956,
        revenue: '£12,800',
        expiration: 'Aug 31, 2024',
        featured: false,
    },
    {
        id: 'PRM-403',
        name: 'Camden Heritage 20% Off',
        business: 'Camden Records',
        borough: 'Camden',
        discount: '20%',
        type: 'borough',
        status: 'Active',
        performance: 65,
        redemptions: 432,
        revenue: '£8,200',
        expiration: 'Jul 1, 2024',
        featured: false,
    },
    {
        id: 'PRM-404',
        name: 'VIP Early Access Sale',
        business: 'Neon Vintage',
        borough: 'Islington',
        discount: '30%',
        type: 'featured',
        status: 'Scheduled',
        performance: 0,
        redemptions: 0,
        revenue: '£0',
        expiration: 'Jul 20, 2024',
        featured: true,
    },
    {
        id: 'PRM-405',
        name: 'Loyalty Members Free Dessert',
        business: 'Taste of Napoli',
        borough: 'Westminster',
        discount: 'Free Item',
        type: 'loyalty',
        status: 'Active',
        performance: 88,
        redemptions: 2104,
        revenue: '£18,400',
        expiration: 'Dec 31, 2024',
        featured: false,
    },
    {
        id: 'PRM-406',
        name: 'Flash Friday 40% Off',
        business: 'Greenwich Market Goods',
        borough: 'Greenwich',
        discount: '40%',
        type: 'flash',
        status: 'Expired',
        performance: 71,
        redemptions: 890,
        revenue: '£15,300',
        expiration: 'May 31, 2024',
        featured: false,
    },
    {
        id: 'PRM-407',
        name: 'Winter Warmers Bundle',
        business: 'Hackney Brew House',
        borough: 'Hackney',
        discount: '25%',
        type: 'seasonal',
        status: 'Paused',
        performance: 54,
        redemptions: 312,
        revenue: '£5,100',
        expiration: 'Mar 15, 2024',
        featured: false,
    },
    {
        id: 'PRM-408',
        name: 'Refer & Save £10',
        business: 'Lambeth Fresh Market',
        borough: 'Lambeth',
        discount: '£10',
        type: 'loyalty',
        status: 'Active',
        performance: 83,
        redemptions: 1567,
        revenue: '£22,100',
        expiration: 'Sep 30, 2024',
        featured: true,
    },
];

const kpis = [
    { title: 'Active Promotions', value: '48', trend: '+6', trendType: 'up', icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Total Redemptions', value: '24.8k', trend: '+18%', trendType: 'up', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Revenue Generated', value: '£186k', trend: '+22%', trendType: 'up', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Avg. Performance', value: '76%', trend: '+4%', trendType: 'up', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Featured Deals', value: '6', trend: '+2', trendType: 'up', icon: Crown, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Expiring Soon', value: '5', trend: '3 days', trendType: 'neutral', icon: Timer, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function PromotionsManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState('all');

    // Create Promotion Modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createModalMode, setCreateModalMode] = useState<'create' | 'edit'>('create');
    const [editingPromotion, setEditingPromotion] = useState<any>(null);
    const [createStep, setCreateStep] = useState(1);

    // Action Modals
    const [featureModal, setFeatureModal] = useState<{ open: boolean; promo: any }>({ open: false, promo: null });
    const [extendModal, setExtendModal] = useState<{ open: boolean; promo: any }>({ open: false, promo: null });
    const [pauseModal, setPauseModal] = useState<{ open: boolean; promo: any }>({ open: false, promo: null });
    const [removeModal, setRemoveModal] = useState<{ open: boolean; promo: any }>({ open: false, promo: null });

    // 5-step wizard for creating promotions
    const steps = ['Details', 'Discount', 'Targeting', 'Design', 'Review'];

    const filteredPromotions = useMemo(() => {
        return mockPromotions.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.borough.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = activeType === 'all' || p.type === activeType;
            return matchesSearch && matchesType;
        });
    }, [searchQuery, activeType]);

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                            <Percent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Promotions Management</h1>
                            <p className="text-sm font-bold text-slate-500 mt-1">Control flash deals, seasonal campaigns, and visibility promotions.</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 font-bold text-slate-700 border-slate-200 bg-white rounded-xl shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Export Data
                    </Button>
                    <Button className="h-11 px-6 font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-200 gap-2" onClick={() => { setCreateStep(1); setCreateModalMode('create'); setEditingPromotion(null); setCreateModalOpen(true); }}>
                        <Plus className="w-4 h-4" /> Create Promotion
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm hover:border-orange-200 transition-all group bg-white rounded-3xl overflow-hidden relative">
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

            {/* Promotion Type Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {promotionTypes.map((type) => (
                    <button
                        key={type.key}
                        onClick={() => setActiveType(type.key)}
                        className={cn(
                            "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap border",
                            activeType === type.key
                                ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200"
                                : "bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:bg-orange-50 shadow-sm"
                        )}
                    >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                        <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full",
                            activeType === type.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>{type.count}</span>
                    </button>
                ))}
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Promotion Directory</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">Manage all active, scheduled, and past promotions across boroughs.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search promotions..."
                                    className="pl-11 h-12 text-sm font-bold border-slate-200 shadow-sm bg-white rounded-xl focus:ring-2 focus:ring-orange-100 transition-all"
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
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">Promotion Name</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Business</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Borough</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Discount</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Status</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Performance</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Expiration</TableHead>
                                <TableHead className="text-right pr-8 h-14"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPromotions.map((p) => (
                                <TableRow
                                    key={p.id}
                                    className="hover:bg-orange-50/30 cursor-pointer group transition-colors"
                                >
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {p.featured && (
                                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <p className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">{p.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{p.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <Store className="w-3.5 h-3.5 text-slate-500" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700">{p.business}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {p.borough}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <Badge className="bg-orange-100 text-orange-700 border-none font-black text-xs px-3 py-1">
                                            {p.discount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                                            p.status === 'Active' ? "bg-emerald-100 text-emerald-700" :
                                            p.status === 'Scheduled' ? "bg-blue-100 text-blue-700" :
                                            p.status === 'Paused' ? "bg-amber-100 text-amber-700" :
                                            "bg-slate-100 text-slate-600"
                                        )}>
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col items-center gap-1.5 w-full px-4">
                                            <div className="flex items-center justify-between w-full text-[10px] font-black">
                                                <span className={cn(
                                                    p.performance > 80 ? "text-emerald-600" :
                                                    p.performance > 40 ? "text-orange-600" : "text-slate-400"
                                                )}>{p.performance}%</span>
                                                <span className="text-slate-400">{p.redemptions.toLocaleString()} used</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full rounded-full transition-all",
                                                    p.performance > 80 ? "bg-emerald-500" :
                                                    p.performance > 40 ? "bg-orange-500" : "bg-slate-300"
                                                )} style={{ width: `${p.performance}%` }} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <p className="text-xs font-bold text-slate-900">{p.expiration}</p>
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
                                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Promotion Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={(e) => { e.stopPropagation(); setCreateStep(1); setCreateModalMode('edit'); setEditingPromotion(p); setCreateModalOpen(true); }}>
                                                    <Edit3 className="w-4 h-4 text-slate-500" /> Edit Promotion
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-amber-600" onClick={(e) => { e.stopPropagation(); setFeatureModal({ open: true, promo: p }); }}>
                                                    <Star className="w-4 h-4" /> {p.featured ? 'Unfeature' : 'Feature'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-blue-600" onClick={(e) => { e.stopPropagation(); setExtendModal({ open: true, promo: p }); }}>
                                                    <CalendarPlus className="w-4 h-4" /> Extend Duration
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-amber-600" onClick={(e) => { e.stopPropagation(); setPauseModal({ open: true, promo: p }); }}>
                                                    <Pause className="w-4 h-4" /> {p.status === 'Paused' ? 'Resume' : 'Pause'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-red-600" onClick={(e) => { e.stopPropagation(); setRemoveModal({ open: true, promo: p }); }}>
                                                    <Trash2 className="w-4 h-4" /> Remove
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

            {/* ====== CREATE / EDIT PROMOTION WIZARD ====== */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl p-0 overflow-hidden sm:max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-8 text-white relative flex-shrink-0">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black shadow-lg">
                                <Percent className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{createModalMode === 'edit' ? `Edit: ${editingPromotion?.name}` : 'Create New Promotion'}</h2>
                                <p className="text-xs font-bold text-orange-100 mt-1">{createModalMode === 'edit' ? 'Modify deal parameters, targeting, and visibility.' : 'Launch a flash deal, seasonal offer, or visibility promotion.'}</p>
                            </div>
                        </div>
                        {/* Stepper */}
                        <div className="mt-8 flex items-center justify-between w-full relative">
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
                                            isActive ? "bg-white text-orange-600 border-4 border-orange-500" :
                                            isCompleted ? "bg-white text-orange-600" : "bg-orange-700 text-orange-300 border-2 border-orange-500"
                                        )}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest absolute -bottom-6 w-24 text-center",
                                            isActive ? "text-white" : isCompleted ? "text-orange-100" : "text-orange-300"
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
                                        <h3 className="text-xl font-black text-slate-900">1. Promotion Details</h3>
                                        <p className="text-sm font-bold text-slate-500">Define the core identity of this promotion.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Promotion Name</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Customer-facing promotion title. Keep it punchy.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Input placeholder="e.g. Summer BOGO Madness" defaultValue={createModalMode === 'edit' ? editingPromotion?.name : ''} className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Promotion Type</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Determines how this promotion is categorized and surfaced.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="flash">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="flash" className="font-bold cursor-pointer rounded-lg">Flash Deal</SelectItem>
                                                        <SelectItem value="seasonal" className="font-bold cursor-pointer rounded-lg">Seasonal Promotion</SelectItem>
                                                        <SelectItem value="borough" className="font-bold cursor-pointer rounded-lg">Borough Promotion</SelectItem>
                                                        <SelectItem value="featured" className="font-bold cursor-pointer rounded-lg">Featured Promotion</SelectItem>
                                                        <SelectItem value="loyalty" className="font-bold cursor-pointer rounded-lg">Loyalty Promotion</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Business</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">The storefront running this promotion.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="bakery">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Select Business" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="bakery" className="font-bold cursor-pointer rounded-lg">The Artisan Bakery</SelectItem>
                                                        <SelectItem value="coffee" className="font-bold cursor-pointer rounded-lg">Borough Coffee Co.</SelectItem>
                                                        <SelectItem value="records" className="font-bold cursor-pointer rounded-lg">Camden Records</SelectItem>
                                                        <SelectItem value="vintage" className="font-bold cursor-pointer rounded-lg">Neon Vintage</SelectItem>
                                                        <SelectItem value="napoli" className="font-bold cursor-pointer rounded-lg">Taste of Napoli</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Description</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Short promotional copy shown to customers. Max 200 chars.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Textarea placeholder="Grab 50% off your first order this weekend only!" className="resize-none h-24 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">2. Discount Configuration</h3>
                                        <p className="text-sm font-bold text-slate-500">Set the deal mechanics and redemption limits.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Discount Type</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Percentage off, fixed amount, BOGO, or free item.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="percentage">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="percentage" className="font-bold cursor-pointer rounded-lg">Percentage Off</SelectItem>
                                                        <SelectItem value="fixed" className="font-bold cursor-pointer rounded-lg">Fixed Amount Off</SelectItem>
                                                        <SelectItem value="bogo" className="font-bold cursor-pointer rounded-lg">Buy One Get One</SelectItem>
                                                        <SelectItem value="freeitem" className="font-bold cursor-pointer rounded-lg">Free Item</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Discount Value</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">The numeric value of the discount (e.g., 50 for 50%).</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input placeholder="e.g. 50" type="number" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Max Redemptions</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Total number of times this deal can be redeemed. Leave empty for unlimited.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input placeholder="e.g. 500 (leave blank for unlimited)" type="number" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Min. Order Value</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Minimum basket total required to activate the promotion.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input placeholder="e.g. £10.00" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Per-User Limit</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Max times a single customer can redeem this.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                                                <span className="text-sm font-bold text-slate-700">Limit to once per customer</span>
                                                <Switch defaultChecked />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">3. Targeting & Scheduling</h3>
                                        <p className="text-sm font-bold text-slate-500">Where and when will this promotion run?</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Borough</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Geographic targeting for this promotion.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Select defaultValue="camden">
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                    <SelectValue placeholder="Select Borough" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="all" className="font-bold cursor-pointer rounded-lg">All Boroughs</SelectItem>
                                                    <SelectItem value="camden" className="font-bold cursor-pointer rounded-lg">Camden</SelectItem>
                                                    <SelectItem value="hackney" className="font-bold cursor-pointer rounded-lg">Hackney</SelectItem>
                                                    <SelectItem value="islington" className="font-bold cursor-pointer rounded-lg">Islington</SelectItem>
                                                    <SelectItem value="westminster" className="font-bold cursor-pointer rounded-lg">Westminster</SelectItem>
                                                    <SelectItem value="greenwich" className="font-bold cursor-pointer rounded-lg">Greenwich</SelectItem>
                                                    <SelectItem value="lambeth" className="font-bold cursor-pointer rounded-lg">Lambeth</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Start Date</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">When this deal goes live to customers.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input type="date" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">End Date</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">When this deal expires automatically.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Input type="date" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Time Restrictions</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Limit promotion to specific hours (e.g., lunch-only deals).</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                                                <span className="text-sm font-bold text-slate-700">Enable time-of-day restrictions</span>
                                                <Switch />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Customer Segment</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Target specific user groups for this promotion.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Select defaultValue="all">
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                    <SelectValue placeholder="Target Audience" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                    <SelectItem value="all" className="font-bold cursor-pointer rounded-lg">All Customers</SelectItem>
                                                    <SelectItem value="new" className="font-bold cursor-pointer rounded-lg">New Customers Only</SelectItem>
                                                    <SelectItem value="loyalty" className="font-bold cursor-pointer rounded-lg">Loyalty Members</SelectItem>
                                                    <SelectItem value="vip" className="font-bold cursor-pointer rounded-lg">VIP Tier Only</SelectItem>
                                                    <SelectItem value="lapsed" className="font-bold cursor-pointer rounded-lg">Lapsed Customers</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">4. Promotion Design</h3>
                                        <p className="text-sm font-bold text-slate-500">How this promotion appears in the app and marketing materials.</p>
                                    </div>
                                    <div className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Banner Image</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">1200x400px minimum. PNG or WebP recommended.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="w-full h-36 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-orange-50/30 transition-colors cursor-pointer group">
                                                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-orange-500 transition-colors" />
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-orange-600">Drop your banner here or click to upload</span>
                                                <span className="text-[10px] font-bold text-slate-400">Supports PNG, JPG, WebP up to 5MB</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Promotional Copy</label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Short marketing copy for notifications and in-app cards.</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Textarea placeholder="Don't miss out! 50% off your first order this weekend." className="resize-none h-24 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Highlight Color</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Accent color used in app cards and banners.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="orange">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Pick Color" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="orange" className="font-bold cursor-pointer rounded-lg">🟠 Brand Orange</SelectItem>
                                                        <SelectItem value="red" className="font-bold cursor-pointer rounded-lg">🔴 Urgency Red</SelectItem>
                                                        <SelectItem value="green" className="font-bold cursor-pointer rounded-lg">🟢 Fresh Green</SelectItem>
                                                        <SelectItem value="purple" className="font-bold cursor-pointer rounded-lg">🟣 Premium Purple</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700">Visibility</label>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild><Info className="w-4 h-4 text-slate-400 cursor-help" /></TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">Where this promotion appears in the customer experience.</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Select defaultValue="all">
                                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white">
                                                        <SelectValue placeholder="Visibility" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                                        <SelectItem value="all" className="font-bold cursor-pointer rounded-lg">Homepage + Search + Business Page</SelectItem>
                                                        <SelectItem value="search" className="font-bold cursor-pointer rounded-lg">Search Results Only</SelectItem>
                                                        <SelectItem value="business" className="font-bold cursor-pointer rounded-lg">Business Page Only</SelectItem>
                                                        <SelectItem value="push" className="font-bold cursor-pointer rounded-lg">Push Notification Only</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {createStep === 5 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">5. Review & Launch</h3>
                                        <p className="text-sm font-bold text-slate-500">Verify all parameters before going live.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Promotion Summary</h4>
                                            <div className="grid grid-cols-2 gap-6">
                                                {[
                                                    { label: 'Promotion Name', value: createModalMode === 'edit' ? editingPromotion?.name : 'Summer BOGO Madness' },
                                                    { label: 'Type', value: 'Flash Deal' },
                                                    { label: 'Discount', value: '50% Off' },
                                                    { label: 'Business', value: 'The Artisan Bakery' },
                                                    { label: 'Borough', value: 'Camden' },
                                                    { label: 'Max Redemptions', value: '500' },
                                                    { label: 'Duration', value: 'Jun 1 – Jun 15, 2024' },
                                                    { label: 'Audience', value: 'All Customers' },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                                        <span className="text-sm font-black text-slate-900">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <Sparkles className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-orange-900">Ready to launch</p>
                                                <p className="text-xs font-bold text-orange-700 mt-0.5">This promotion will be visible to all customers in the selected borough immediately upon launch.</p>
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
                            {createStep < 5 ? (
                                <Button
                                    className="rounded-xl bg-orange-600 hover:bg-orange-700 font-black text-white shadow-lg shadow-orange-200 gap-2 px-8"
                                    onClick={() => setCreateStep(s => Math.min(5, s + 1))}
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-white shadow-lg shadow-emerald-200 gap-2 px-8"
                                    onClick={() => setCreateModalOpen(false)}
                                >
                                    <Zap className="w-4 h-4" /> {createModalMode === 'edit' ? 'Save Changes' : 'Launch Promotion'}
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ====== FEATURE MODAL ====== */}
            <Dialog open={featureModal.open} onOpenChange={(o) => setFeatureModal({ ...featureModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col items-center text-center py-6 space-y-5">
                        <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center">
                            <Star className="w-10 h-10 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">{featureModal.promo?.featured ? 'Remove from Featured' : 'Feature Promotion'}</h2>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                {featureModal.promo?.featured
                                    ? `"${featureModal.promo?.name}" will be removed from the featured section on the homepage.`
                                    : `"${featureModal.promo?.name}" will be pinned to the featured carousel on the homepage, increasing visibility significantly.`
                                }
                            </p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 w-full text-left">
                            <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Featured Slot Impact</p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-amber-500" />
                                    <span className="font-bold text-slate-700">+340% impressions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-amber-500" />
                                    <span className="font-bold text-slate-700">+85% redemptions</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setFeatureModal({ open: false, promo: null })}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 font-black text-white h-12 shadow-lg shadow-amber-200" onClick={() => setFeatureModal({ open: false, promo: null })}>
                                <Star className="w-4 h-4 mr-2" /> Confirm
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== EXTEND MODAL ====== */}
            <Dialog open={extendModal.open} onOpenChange={(o) => setExtendModal({ ...extendModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col items-center text-center py-6 space-y-5">
                        <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center">
                            <CalendarPlus className="w-10 h-10 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Extend Duration</h2>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                Extend the expiration for <span className="text-slate-900 font-black">"{extendModal.promo?.name}"</span>.
                                Current expiry: <span className="text-slate-900 font-black">{extendModal.promo?.expiration}</span>.
                            </p>
                        </div>
                        <div className="w-full space-y-3 text-left">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-700">New Expiration Date</label>
                            <Input type="date" className="h-12 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white transition-colors" />
                            <label className="text-xs font-black uppercase tracking-widest text-slate-700">Reason for Extension</label>
                            <Textarea placeholder="e.g. High demand, extending by 2 weeks..." className="resize-none h-20 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                        </div>
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setExtendModal({ open: false, promo: null })}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-white h-12 shadow-lg shadow-blue-200" onClick={() => setExtendModal({ open: false, promo: null })}>
                                <CalendarPlus className="w-4 h-4 mr-2" /> Extend
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== PAUSE MODAL ====== */}
            <Dialog open={pauseModal.open} onOpenChange={(o) => setPauseModal({ ...pauseModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col items-center text-center py-6 space-y-5">
                        <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center">
                            {pauseModal.promo?.status === 'Paused'
                                ? <Play className="w-10 h-10 text-emerald-600" />
                                : <Pause className="w-10 h-10 text-amber-600" />
                            }
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                {pauseModal.promo?.status === 'Paused' ? 'Resume Promotion' : 'Pause Promotion'}
                            </h2>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                {pauseModal.promo?.status === 'Paused'
                                    ? `"${pauseModal.promo?.name}" will resume and become visible to customers again.`
                                    : `"${pauseModal.promo?.name}" will be temporarily hidden from all customers. You can resume it later.`
                                }
                            </p>
                        </div>
                        {pauseModal.promo?.status !== 'Paused' && (
                            <div className="w-full space-y-3 text-left">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-700">Reason for Pausing</label>
                                <Textarea placeholder="e.g. Stock issues, need to adjust terms..." className="resize-none h-20 rounded-xl border-slate-200 bg-slate-50 font-bold focus:bg-white" />
                            </div>
                        )}
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setPauseModal({ open: false, promo: null })}>Cancel</Button>
                            <Button className={cn("flex-1 rounded-xl font-black text-white h-12 shadow-lg",
                                pauseModal.promo?.status === 'Paused' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                            )} onClick={() => setPauseModal({ open: false, promo: null })}>
                                {pauseModal.promo?.status === 'Paused'
                                    ? <><Play className="w-4 h-4 mr-2" /> Resume</>
                                    : <><Pause className="w-4 h-4 mr-2" /> Pause</>
                                }
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ====== REMOVE MODAL ====== */}
            <Dialog open={removeModal.open} onOpenChange={(o) => setRemoveModal({ ...removeModal, open: o })}>
                <DialogContent className="rounded-[2.5rem] border-slate-100 shadow-2xl sm:max-w-lg">
                    <div className="flex flex-col items-center text-center py-6 space-y-5">
                        <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center">
                            <Trash2 className="w-10 h-10 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Remove Promotion</h2>
                            <p className="text-sm font-bold text-slate-500 mt-2">
                                Are you sure you want to permanently remove <span className="text-slate-900 font-black">"{removeModal.promo?.name}"</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 w-full text-left">
                            <p className="text-xs font-black text-red-700">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                {removeModal.promo?.redemptions?.toLocaleString()} redemptions and all associated analytics data will be archived.
                            </p>
                        </div>
                        <div className="w-full space-y-3 text-left">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-700">Type "REMOVE" to confirm</label>
                            <Input placeholder="REMOVE" className="h-12 rounded-xl border-red-200 bg-red-50/50 font-bold focus:bg-white transition-colors" />
                        </div>
                        <div className="flex gap-3 w-full">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setRemoveModal({ open: false, promo: null })}>Cancel</Button>
                            <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 font-black text-white h-12 shadow-lg shadow-red-200" onClick={() => setRemoveModal({ open: false, promo: null })}>
                                <Trash2 className="w-4 h-4 mr-2" /> Remove Permanently
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
