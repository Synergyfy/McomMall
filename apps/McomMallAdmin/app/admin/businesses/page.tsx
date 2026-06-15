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
    Building2,
    Users,
    Activity,
    Lock,
    MapPin,
    LayoutList,
    Contact,
    History,
    FileText,
    BarChart3,
    Gem,
    Megaphone,
    Gift,
    CreditCard,
    ChevronDown,
    X,
    Check,
    Plus,
    Layout,
    Image as ImageIcon,
    ExternalLink,
    Zap,
    TrendingUp,
    Smartphone,
    Globe,
    Calendar,
    Clock,
    DollarSign,
    AlertCircle,
    Download,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    MessageSquare,
    ChevronLeft
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Mock Data ---

const mockBusinesses = [
    {
        id: 'B001',
        name: 'Artisan Coffee Co.',
        category: 'Food & Drink',
        borough: 'Camden',
        tier: 'Platinum',
        score: 94,
        verificationStatus: 'Verified',
        engagementRate: '8.4%',
        status: 'Active',
        visibility: 'Featured'
    },
    {
        id: 'B002',
        name: 'Urban Threads',
        category: 'Retail',
        borough: 'Westminster',
        tier: 'Gold',
        score: 82,
        verificationStatus: 'Verified',
        engagementRate: '6.2%',
        status: 'Active',
        visibility: 'High'
    },
    {
        id: 'B003',
        name: 'TechHub Coworking',
        category: 'Services',
        borough: 'Hackney',
        tier: 'Silver',
        score: 75,
        verificationStatus: 'Pending',
        engagementRate: '4.8%',
        status: 'Warning',
        visibility: 'Medium'
    },
    {
        id: 'B004',
        name: 'The Green Larder',
        category: 'Food & Drink',
        borough: 'Greenwich',
        tier: 'Bronze',
        score: 68,
        verificationStatus: 'Unverified',
        engagementRate: '3.1%',
        status: 'Pending',
        visibility: 'Low'
    },
    {
        id: 'B005',
        name: 'Vintage Vinyls',
        category: 'Retail',
        borough: 'Islington',
        tier: 'Gold',
        score: 88,
        verificationStatus: 'Verified',
        engagementRate: '7.5%',
        status: 'Suspended',
        visibility: 'Hidden'
    }
];

const kpis = [
    { title: 'Pending Approvals', value: '24', trend: '+5', trendType: 'up', icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Verified Businesses', value: '3,842', trend: '+12%', trendType: 'up', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Suspended Entities', value: '18', trend: '-2', trendType: 'down', icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Featured Slots', value: '45/50', trend: 'Full', trendType: 'neutral', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Membership Growth', value: '£42.5k', trend: '+18%', trendType: 'up', icon: Gem, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Visibility Index', value: '82%', trend: '+4%', trendType: 'up', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

// --- Components ---

export default function BusinessManagementDashboard() {
    const [view, setView] = useState<'list' | 'profile' | 'verification'>('list');
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBusinesses = useMemo(() => {
        return mockBusinesses.filter(b => 
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    if (view === 'profile' && selectedBusiness) {
        return <BusinessProfileView business={selectedBusiness} onBack={() => setView('list')} />;
    }

    if (view === 'verification' && selectedBusiness) {
        return <BusinessVerificationView business={selectedBusiness} onBack={() => setView('list')} />;
    }

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Management</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Operational command for onboarding, verification, and visibility oversight.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 font-bold text-slate-700 border-slate-200 bg-white rounded-xl shadow-sm">
                        Export Report
                    </Button>
                    <Button className="h-11 px-6 font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-200">
                        Manual Onboard
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm hover:border-orange-200 transition-all group bg-white rounded-2xl overflow-hidden">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={cn("p-2.5 rounded-xl transition-colors", kpi.bg, kpi.color)}>
                                    <kpi.icon className="h-5 w-5" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    kpi.trendType === 'up' ? "bg-emerald-50 text-emerald-600" : 
                                    kpi.trendType === 'down' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                                )}>
                                    {kpi.trendType === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : 
                                     kpi.trendType === 'down' ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
                                    {kpi.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Entity Directory</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">Real-time management of all marketplace participants.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search business, ID, or borough..." 
                                    className="pl-11 h-12 text-sm font-bold border-slate-200 shadow-sm bg-white rounded-xl focus:ring-2 focus:ring-orange-100 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-12 px-6 text-sm font-bold text-slate-700 border-slate-200 bg-white gap-2 rounded-xl">
                                <Filter className="w-4 h-4" /> Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">Business / Category</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Borough</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Membership</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Score</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Verification</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Engagement</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Status</TableHead>
                                <TableHead className="text-right pr-8 h-14"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBusinesses.map((b) => (
                                <TableRow 
                                    key={b.id} 
                                    className="hover:bg-slate-50/50 cursor-pointer group transition-colors"
                                    onClick={() => { setSelectedBusiness(b); setView('profile'); }}
                                >
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[12px] font-black text-slate-600 border border-slate-200 shadow-sm group-hover:bg-white group-hover:border-orange-200 transition-all">
                                                {b.name.substring(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">{b.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{b.category} • {b.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {b.borough}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                                            b.tier === 'Platinum' ? "bg-slate-900 text-white" :
                                            b.tier === 'Gold' ? "bg-amber-100 text-amber-700" :
                                            b.tier === 'Silver' ? "bg-slate-200 text-slate-700" : "bg-orange-50 text-orange-700"
                                        )}>
                                            {b.tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className={cn(
                                            "w-9 h-9 rounded-full border-2 mx-auto flex items-center justify-center text-[11px] font-black",
                                            b.score > 90 ? "border-emerald-500 text-emerald-600 bg-emerald-50/30" : 
                                            b.score > 70 ? "border-blue-500 text-blue-600 bg-blue-50/30" : "border-orange-500 text-orange-600 bg-orange-50/30"
                                        )}>
                                            {b.score}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                                            b.verificationStatus === 'Verified' ? "bg-emerald-100 text-emerald-700" :
                                            b.verificationStatus === 'Pending' ? "bg-amber-100 text-amber-700 shadow-sm shadow-amber-100" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {b.verificationStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: b.engagementRate }} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 tracking-tighter">{b.engagementRate}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                                            b.status === 'Active' ? "bg-emerald-500 text-white" :
                                            b.status === 'Warning' ? "bg-orange-500 text-white" : 
                                            b.status === 'Suspended' ? "bg-red-600 text-white" : "bg-slate-200 text-slate-500"
                                        )}>
                                            {b.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8 py-5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-slate-100">
                                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Entity Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={(e) => { e.stopPropagation(); setSelectedBusiness(b); setView('profile'); }}>
                                                    <Eye className="w-4 h-4 text-slate-500" /> View Detailed Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-emerald-600" onClick={(e) => { e.stopPropagation(); setSelectedBusiness(b); setView('verification'); }}>
                                                    <ShieldCheck className="w-4 h-4" /> Verify Business
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={(e) => e.stopPropagation()}>
                                                    <Edit3 className="w-4 h-4 text-slate-500" /> Edit Operational Info
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={(e) => e.stopPropagation()}>
                                                    <Star className="w-4 h-4 text-amber-500" /> Feature on Marketplace
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-blue-600" onClick={(e) => e.stopPropagation()}>
                                                    <ShieldAlert className="w-4 h-4" /> Trigger Content Audit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-orange-600" onClick={(e) => e.stopPropagation()}>
                                                    <Contact className="w-4 h-4" /> Contact Merchant
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-red-600" onClick={(e) => e.stopPropagation()}>
                                                    <Ban className="w-4 h-4" /> Suspend Operations
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
        </div>
    );
}

// --- Detail View Component ---

function BusinessProfileView({ business, onBack }: { business: any, onBack: () => void }) {
    return (
        <div className="bg-white min-h-screen p-8">
            {/* Immersive Hero Header with Radius */}
            <div className="relative h-[320px] w-full overflow-hidden bg-slate-900 rounded-[2.5rem]">
                {/* Banner Image Placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-60 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                {/* Top Nav Overlay */}
                <div className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-20">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onBack}
                        className="rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 shadow-lg shadow-orange-900/40">
                            {business.status}
                        </Badge>
                        <Button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-black text-xs uppercase tracking-widest rounded-xl h-10 px-6 transition-all active:scale-95">
                            Entity Actions
                        </Button>
                    </div>
                </div>

                {/* Profile Info Overlay - Adjusted for Clipped Logo */}
                <div className="absolute bottom-0 inset-x-0 p-10 flex items-end justify-between z-10">
                    <div className="flex items-center gap-8">
                        <div className="w-40 h-40 rounded-t-[2.5rem] bg-white p-3 shadow-2xl border-x border-t border-slate-100 flex items-center justify-center translate-y-10 overflow-hidden">
                            <div className="w-full h-full rounded-t-[1.8rem] bg-slate-900 flex items-center justify-center text-4xl font-black text-white shadow-inner">
                                {business.name.substring(0,1).toUpperCase()}
                            </div>
                        </div>
                        <div className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-orange-600/20 text-orange-400 border border-orange-500/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 backdrop-blur-sm">
                                    <CheckCircle2 className="w-3 h-3 mr-1.5 inline" /> Verified Merchant
                                </Badge>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {business.id}</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">{business.name}</h1>
                            <div className="flex items-center gap-4 mt-3 text-slate-300 font-bold text-sm">
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {business.borough}</span>
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                                <span className="flex items-center gap-2"><LayoutList className="w-4 h-4 text-orange-500" /> {business.category}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pb-4">
                        <Button variant="outline" className="h-12 px-8 font-black text-slate-700 border-slate-200 bg-white rounded-2xl shadow-xl hover:bg-slate-50 transition-all active:scale-95 gap-3">
                            <Edit3 className="w-4 h-4" /> Edit Profile
                        </Button>
                        <Button className="h-12 px-10 font-black text-white bg-orange-600 hover:bg-orange-700 rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-95 gap-3">
                            <Plus className="w-4 h-4" /> New Promotion
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-10 pt-20 pb-10">
                <Tabs defaultValue="overview" className="space-y-10">
                    <TabsList className="bg-slate-50 p-1.5 rounded-[1.8rem] border border-slate-200 w-full overflow-x-auto h-16 justify-start no-scrollbar shadow-sm">
                        {[
                            { value: 'overview', label: 'Overview', icon: LayoutList },
                            { value: 'storefront', label: 'Storefront', icon: Building2 },
                            { value: 'campaigns', label: 'Campaigns', icon: Megaphone },
                            { value: 'rewards', label: 'Rewards', icon: Gift },
                            { value: 'membership', label: 'Membership', icon: Gem },
                            { value: 'visibility', label: 'Visibility', icon: Activity },
                            { value: 'analytics', label: 'Analytics', icon: BarChart3 },
                            { value: 'activity', label: 'Activity Logs', icon: History },
                            { value: 'verification', label: 'Verification', icon: ShieldAlert },
                            { value: 'billing', label: 'Billing', icon: CreditCard },
                        ].map((tab) => (
                            <TabsTrigger 
                                key={tab.value}
                                value={tab.value} 
                                className="rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white h-11 px-5 transition-all"
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* --- Overview Tab --- */}
                    <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Business Snapshot</h3>
                                            <Badge variant="outline" className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 border-blue-200">
                                                Operational Data
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                                                <p className="text-sm font-bold text-slate-700">{business.category}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Borough</p>
                                                <p className="text-sm font-bold text-slate-700">{business.borough}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membership Tier</p>
                                                <p className="text-sm font-bold text-slate-700">{business.tier}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</p>
                                                <p className="text-sm font-bold text-slate-700">October 12, 2023</p>
                                            </div>
                                        </div>
                                        <div className="pt-8 border-t border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Bio</p>
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                                Premium {business.category} establishment located in the heart of {business.borough}. 
                                                Specializing in high-quality products and community engagement through the MCOM Mall platform. 
                                                Consistently maintaining a visibility score above 90% and participating in all local high street initiatives.
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-8">Performance Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Marketplace Rank', value: '#12', trend: '+2', icon: Star },
                                            { label: 'Customer Reach', value: '4.2k', trend: '+15%', icon: Users },
                                            { label: 'Total Sales', value: '£18.4k', trend: '+8%', icon: CreditCard },
                                        ].map((stat, i) => (
                                            <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <stat.icon className="w-5 h-5 text-slate-400" />
                                                    <span className="text-[10px] font-black text-emerald-600">{stat.trend}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                    <p className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
                                    <div className="bg-slate-900 p-8 text-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility Index</p>
                                            <Activity className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black">{business.score}</span>
                                            <span className="text-lg font-bold text-slate-500">/100</span>
                                        </div>
                                        <div className="mt-8 space-y-4">
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]" style={{ width: `${business.score}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-8 space-y-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-50 rounded-lg">
                                                        <ShieldAlert className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-900">Verification</span>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase">{business.verificationStatus}</Badge>
                                            </div>
                                        </div>
                                        <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-xl">
                                            Run Security Audit <Lock className="w-4 h-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- Storefront Tab --- */}
                    <TabsContent value="storefront" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Active Listings</h3>
                                        <Button size="sm" className="bg-orange-600 font-black text-[10px] uppercase rounded-xl">+ Add Product</Button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            { name: 'House Blend Beans', price: '£12.50', stock: 45, img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400' },
                                            { name: 'Ceramic Pour-over', price: '£24.00', stock: 12, img: 'https://images.unsplash.com/photo-1544787210-2213d84ad960?auto=format&fit=crop&q=80&w=400' },
                                            { name: 'Cold Brew Kit', price: '£35.00', stock: 8, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400' },
                                        ].map((item, i) => (
                                            <div key={i} className="group cursor-pointer">
                                                <div className="aspect-square rounded-2xl bg-slate-100 overflow-hidden mb-3 border border-slate-100 group-hover:border-orange-200 transition-all">
                                                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                                <p className="text-xs font-black text-slate-900">{item.name}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-[10px] font-bold text-slate-500">{item.price}</p>
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0 border-emerald-200">{item.stock} in stock</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                            <div className="lg:col-span-4 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Storefront Config</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-black text-slate-800">Public Status</p>
                                                <p className="text-[10px] font-bold text-slate-400">Visibility on MCOM Mall</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-black text-slate-800">In-Store Pickup</p>
                                                <p className="text-[10px] font-bold text-slate-400">Allow customers to collect</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="pt-6 border-t border-slate-100">
                                            <Button variant="outline" className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
                                                <Globe className="w-4 h-4" /> View Live Storefront
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- Campaigns Tab --- */}
                    <TabsContent value="campaigns" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-black text-[10px] uppercase pl-8 h-14">Campaign Name</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase h-14">Status</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase h-14 text-center">Reach</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase h-14 text-center">CTR</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase pr-8 h-14 text-right">Schedule</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { name: 'Summer Solstice Flash', status: 'Active', reach: '1.2k', ctr: '4.8%', date: 'Jun 1 - Jun 30' },
                                        { name: 'Borough Anniversary', status: 'Completed', reach: '4.5k', ctr: '6.2%', date: 'May 10 - May 15' },
                                        { name: 'Morning Rush Boost', status: 'Scheduled', reach: '-', ctr: '-', date: 'Jul 15 - Jul 20' },
                                    ].map((c, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-50 rounded-lg"><Megaphone className="w-4 h-4 text-orange-600" /></div>
                                                    <span className="text-xs font-black text-slate-900">{c.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black uppercase border-none px-2",
                                                    c.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                                                    c.status === 'Scheduled' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                                                )}>{c.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-bold text-slate-700">{c.reach}</TableCell>
                                            <TableCell className="text-center text-xs font-bold text-slate-700">{c.ctr}</TableCell>
                                            <TableCell className="pr-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-tighter">{c.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* --- Rewards Tab --- */}
                    <TabsContent value="rewards" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: 'Free Espresso Shot', points: 150, redeems: 124, status: 'Active', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
                                { title: '15% Off House Beans', points: 450, redeems: 82, status: 'Active', icon: Gift, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { title: 'Barista Workshop Pass', points: 2500, redeems: 14, status: 'Paused', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((r, i) => (
                                <Card key={i} className="border-slate-200 shadow-sm rounded-3xl bg-white p-6 hover:border-orange-200 transition-all group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={cn("p-3 rounded-2xl", r.bg, r.color)}>
                                            <r.icon className="w-6 h-6" />
                                        </div>
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase border-none px-2.5 py-1",
                                            r.status === 'Active' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                        )}>{r.status}</Badge>
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 mb-1">{r.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.points} Points Required</p>
                                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Redeemed</p>
                                            <p className="text-lg font-black text-slate-900 tracking-tight">{r.redeems}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-slate-100"><Edit3 className="w-4 h-4 text-slate-400" /></Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* --- Membership Tab --- */}
                    <TabsContent value="membership" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <Card className="border-slate-200 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                                <div className="bg-slate-900 p-10 text-white flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/50">
                                                <Gem className="w-6 h-6 text-white" />
                                            </div>
                                            <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1">Active Plan</Badge>
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight">{business.tier} Tier</h2>
                                        <p className="text-slate-400 font-bold mt-2">Next renewal: October 12, 2024 (Annual Billing)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Credits</p>
                                        <p className="text-5xl font-black text-white tracking-tighter">12,500 <span className="text-xl text-slate-600 font-bold uppercase tracking-widest ml-1">MCOM</span></p>
                                    </div>
                                </div>
                                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Included Benefits</h4>
                                        {[
                                            'Top 5% Priority Search Ranking',
                                            'Borough-wide Push Notifications (2/mo)',
                                            'Advanced Customer Analytics Dashboard',
                                            'Featured Placement on High Street Maps',
                                            'Dedicated Account Manager'
                                        ].map((b, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Quick Actions</h4>
                                            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6">Manage your subscription, upgrade tiers, or add additional ad-hoc marketing credits.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <Button className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest">Upgrade to Enterprise</Button>
                                            <Button variant="outline" className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest">Manage Billing</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- Visibility Tab --- */}
                    <TabsContent value="visibility" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-8">Discovery Heatmap (30d)</h3>
                                    <div className="aspect-[21/9] bg-slate-100 rounded-[2rem] relative overflow-hidden flex items-center justify-center border border-slate-200 border-dashed">
                                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0.1278,51.5074,12/1200x500?access_token=pk.eyJ1IjoibWNvbSIsImEiOiJjbDF2Yn...')] opacity-30 grayscale" />
                                        <p className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Live Map Layer Rendering...
                                        </p>
                                    </div>
                                </Card>
                            </div>
                            <div className="lg:col-span-4 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Optimization Audit</h3>
                                    <div className="space-y-6">
                                        {[
                                            { label: 'Storefront Imagery', score: 95, status: 'Great' },
                                            { label: 'Keyword Density', score: 82, status: 'Good' },
                                            { label: 'Profile Completion', score: 100, status: 'Perfect' },
                                            { label: 'Engagement Consistency', score: 74, status: 'Improving' },
                                        ].map((a, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{a.label}</span>
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{a.status}</span>
                                                </div>
                                                <Progress value={a.score} className="h-1.5 bg-slate-100" indicatorClassName="bg-orange-500" />
                                            </div>
                                        ))}
                                        <div className="pt-6 border-t border-slate-100">
                                            <Button className="w-full bg-slate-900 text-white rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl">
                                                <TrendingUp className="w-4 h-4" /> Boost Visibility
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- Analytics Tab --- */}
                    <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Storefront Views', value: '42,892', trend: '+12%', icon: Eye },
                                { label: 'Avg. Stay Time', value: '2m 14s', trend: '+4%', icon: Clock },
                                { label: 'Conversion Rate', value: '3.82%', trend: '-1.5%', icon: Activity },
                                { label: 'Net Revenue', value: '£14,280', trend: '+18%', icon: CreditCard },
                            ].map((s, i) => (
                                <Card key={i} className="border-slate-200 shadow-sm rounded-3xl bg-white p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-600"><s.icon className="w-5 h-5" /></div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                                            s.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                        )}>{s.trend}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <Card className="mt-8 border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Growth Trends</h3>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase">Last 30 Days</Button>
                                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase">Export CSV</Button>
                                </div>
                            </div>
                            <div className="aspect-[21/7] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <BarChart3 className="w-10 h-10 text-slate-200" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Chart Layer Placeholder</p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* --- Activity Logs Tab --- */}
                    <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Operational Audit Trail</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">System-wide logs for {business.name}</p>
                                </div>
                                <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-6 gap-2">
                                    <Download className="w-4 h-4" /> Download Full History
                                </Button>
                            </div>
                            <div className="p-4 space-y-2">
                                {[
                                    { event: 'Tier Upgrade', user: 'Admin (System)', date: 'Oct 12, 14:22', icon: Gem, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { event: 'Profile Security Audit Passed', user: 'Admin (Security)', date: 'Oct 10, 09:15', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                    { event: 'Banner Image Updated', user: 'Merchant (Owner)', date: 'Oct 08, 11:45', icon: ImageIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
                                    { event: 'Visibility Boost Activated', user: 'System (Auto)', date: 'Oct 05, 00:00', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { event: 'New Promotion Launched', user: 'Merchant (Marketing)', date: 'Oct 02, 16:30', icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                ].map((l, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                        <div className="flex items-center gap-5">
                                            <div className={cn("p-2.5 rounded-xl", l.bg, l.color)}>
                                                <l.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">{l.event}</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-tight">By {l.user}</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{l.date}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* --- Verification Tab --- */}
                    <TabsContent value="verification" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-8">Verification Documents</h3>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Business License (2024)', type: 'PDF', status: 'Approved', size: '2.4MB' },
                                            { name: 'Insurance Certificate', type: 'PDF', status: 'Approved', size: '1.1MB' },
                                            { name: 'Premises Ownership Proof', type: 'JPG', status: 'Approved', size: '4.8MB' },
                                        ].map((doc, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm"><FileText className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition-colors" /></div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900">{doc.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{doc.type} • {doc.size}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">{doc.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                            <div className="lg:col-span-4 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Verification Tools</h3>
                                    <div className="space-y-4">
                                        <Button className="w-full bg-slate-900 text-white rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl">
                                            <Globe className="w-4 h-4" /> Google Verification
                                        </Button>
                                        <Button variant="outline" className="w-full rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest gap-2">
                                            <Smartphone className="w-4 h-4" /> SMS Verification
                                        </Button>
                                        <div className="pt-6 mt-6 border-t border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed text-center italic">
                                                Last verified: Oct 12, 2023 <br />Next audit due: Oct 12, 2024
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- Billing Tab --- */}
                    <TabsContent value="billing" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
                                    <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Invoicing & Payments</h3>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="font-black text-[10px] uppercase pl-8">Invoice ID</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase">Amount</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase">Status</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase text-right pr-8">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { id: 'INV-9021', amt: '£1,250.00', status: 'Paid', date: 'Sep 12, 2023' },
                                                { id: 'INV-8842', amt: '£1,250.00', status: 'Paid', date: 'Aug 12, 2023' },
                                                { id: 'INV-8651', amt: '£350.00', status: 'Paid', date: 'Jul 28, 2023' },
                                            ].map((inv, i) => (
                                                <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                                                    <TableCell className="pl-8 py-5 text-xs font-black text-slate-900 underline decoration-slate-200 cursor-pointer">{inv.id}</TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-700">{inv.amt}</TableCell>
                                                    <TableCell><Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">{inv.status}</Badge></TableCell>
                                                    <TableCell className="text-right pr-8 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{inv.date}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                            <div className="lg:col-span-4 space-y-8">
                                <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-8">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Payment Method</h3>
                                    <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-16 h-16" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Visa Professional</p>
                                            <p className="text-lg font-black tracking-widest mb-6">•••• •••• •••• 4242</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-slate-500">Exp 12/26</span>
                                                <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-white p-0">Update</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 space-y-3">
                                        <Button variant="outline" className="w-full rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest gap-2">
                                            Manage Cards
                                        </Button>
                                        <Button variant="ghost" className="w-full text-red-600 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest">
                                            Cancel Subscription
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// --- Verification View Component ---

const mockVerificationData = {
    owner: {
        name: 'Sarah Jenkins',
        role: 'Managing Director',
        contact: '+44 7700 900123',
        verifiedIdentity: true,
    },
    riskProfile: {
        score: 12,
        level: 'Low',
        indicators: [
            { id: 1, label: 'IP Address Location Match', status: 'pass' },
            { id: 2, label: 'Company Registry Match', status: 'pass' },
            { id: 3, label: 'High-risk Domain Check', status: 'pass' },
            { id: 4, label: 'Multiple Accounts Flag', status: 'flag' },
        ]
    },
    documents: [
        { id: 'doc1', name: 'Certificate of Incorporation.pdf', type: 'PDF', size: '1.2 MB', date: 'Oct 24', status: 'pending' },
        { id: 'doc2', name: 'Utility Bill (Proof of Address).jpg', type: 'Image', size: '3.4 MB', date: 'Oct 24', status: 'pending' },
        { id: 'doc3', name: 'Public Liability Insurance.pdf', type: 'PDF', size: '840 KB', date: 'Oct 24', status: 'pending' },
    ]
};

function BusinessVerificationView({ business, onBack }: { business: any, onBack: () => void }) {
    const [activeDoc, setActiveDoc] = useState(mockVerificationData.documents[0].id);
    const [actionModal, setActionModal] = useState<'approve' | 'reject' | 'request_info' | 'escalate' | null>(null);

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 rounded-full hover:bg-slate-200">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Entity Verification</h1>
                            <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">In Review</Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-1">Application ID: VREQ-{business.id}-4A • Submitted: Oct 24, 2023</p>
                    </div>
                </div>
                
                {/* Global Actions */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 font-bold text-slate-700 border-slate-200 bg-white rounded-xl shadow-sm gap-2" onClick={() => setActionModal('request_info')}>
                        <MessageSquare className="w-4 h-4" /> Request Info
                    </Button>
                    <Button variant="outline" className="h-11 px-6 font-bold text-red-700 border-red-200 bg-red-50 hover:bg-red-100 rounded-xl shadow-sm gap-2" onClick={() => setActionModal('escalate')}>
                        <AlertTriangle className="w-4 h-4" /> Escalate
                    </Button>
                    <div className="w-px h-8 bg-slate-200 mx-2" />
                    <Button className="h-11 px-6 font-black text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 gap-2" onClick={() => setActionModal('reject')}>
                        <X className="w-4 h-4" /> Reject
                    </Button>
                    <Button className="h-11 px-8 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 gap-2" onClick={() => setActionModal('approve')}>
                        <Check className="w-4 h-4" /> Approve
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* LEFT PANEL: Business Details */}
                <div className="xl:col-span-4 space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
                        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black tracking-widest uppercase">{business.name}</h2>
                                <p className="text-xs font-bold text-slate-400 mt-1">{business.category}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl">
                                {business.name.substring(0,1).toUpperCase()}
                            </div>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Details</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 leading-tight">{business.address || `${business.borough}, London`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-4 h-4 text-slate-400" />
                                        <p className="text-xs font-bold text-slate-700">{business.phone || '+44 20 7123 4567'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <p className="text-xs font-bold text-slate-700">{business.email || `contact@${business.name.toLowerCase().replace(/[^a-z]/g, '')}.co.uk`}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <p className="text-xs font-bold text-slate-700">Reg: CRN-{Math.floor(Math.random() * 9000000) + 1000000}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator className="bg-slate-100" />
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ownership Profile</h3>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-900">{mockVerificationData.owner.name}</p>
                                            {mockVerificationData.owner.verifiedIdentity && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{mockVerificationData.owner.role}</p>
                                        <p className="text-xs font-bold text-slate-600 mt-1">{mockVerificationData.owner.contact}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-100 shadow-sm rounded-3xl bg-white overflow-hidden">
                        <div className="p-4 bg-red-50 flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                            <h3 className="text-xs font-black text-red-900 uppercase tracking-widest">Risk Analysis</h3>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-slate-900">{mockVerificationData.riskProfile.score}</span>
                                        <span className="text-xs font-bold text-slate-500">/ 100</span>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] uppercase px-3 py-1">
                                    {mockVerificationData.riskProfile.level} Risk
                                </Badge>
                            </div>
                            <Progress value={mockVerificationData.riskProfile.score} className="h-2 bg-slate-100 mb-6" indicatorClassName="bg-emerald-500" />
                            
                            <div className="space-y-3">
                                {mockVerificationData.riskProfile.indicators.map(ind => (
                                    <div key={ind.id} className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-600">{ind.label}</span>
                                        {ind.status === 'pass' ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT PANEL: Verification Tools */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Auto-Verification Checks */}
                        <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Globe className="w-4 h-4" /></div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Google Business</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500">Match Found</span>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">Verified</Badge>
                            </div>
                        </Card>
                        
                        <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><MessageSquare className="w-4 h-4" /></div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Email Domain</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500">DNS Verified</span>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">Verified</Badge>
                            </div>
                        </Card>

                        <Card className="border-slate-200 shadow-sm rounded-3xl bg-white p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><Smartphone className="w-4 h-4" /></div>
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Phone Number</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-500">SMS OTP</span>
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase">Verified</Badge>
                            </div>
                        </Card>
                    </div>

                    {/* Document Viewer */}
                    <Card className="border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden flex flex-col md:flex-row h-[600px]">
                        {/* Doc List */}
                        <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col">
                            <div className="p-5 border-b border-slate-100">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Submitted Documents</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {mockVerificationData.documents.map(doc => (
                                    <button 
                                        key={doc.id}
                                        onClick={() => setActiveDoc(doc.id)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl transition-all border",
                                            activeDoc === doc.id 
                                                ? "bg-white border-orange-200 shadow-sm" 
                                                : "bg-transparent border-transparent hover:bg-slate-100"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <FileText className={cn("w-5 h-5 shrink-0 mt-0.5", activeDoc === doc.id ? "text-orange-600" : "text-slate-400")} />
                                            <div>
                                                <p className="text-xs font-black text-slate-900 line-clamp-2">{doc.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1">{doc.type} • {doc.size}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Doc Preview */}
                        <div className="flex-1 flex flex-col bg-slate-900 relative">
                            <div className="absolute top-0 inset-x-0 p-4 flex justify-end gap-2 z-10">
                                <Button variant="secondary" size="icon" className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl backdrop-blur-md">
                                    <Layout className="w-4 h-4" />
                                </Button>
                                <Button variant="secondary" size="icon" className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl backdrop-blur-md">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="flex-1 flex items-center justify-center p-8">
                                {/* Placeholder for Document Preview */}
                                <div className="aspect-[1/1.4] w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden relative">
                                    <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-8 text-center border-4 border-white">
                                        <FileText className="w-16 h-16 text-slate-300 mb-4" />
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Document Render View</p>
                                        <p className="text-xs font-bold text-slate-500 mt-2">Secure PDF Viewer</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-950 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400">Reviewing: {mockVerificationData.documents.find(d => d.id === activeDoc)?.name}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="h-9 px-4 font-bold text-red-400 border-red-900/50 bg-red-950 hover:bg-red-900 hover:text-red-300 rounded-lg">Reject Doc</Button>
                                    <Button size="sm" className="h-9 px-4 font-bold text-emerald-400 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900/50 rounded-lg">Verify Doc</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ACTION MODALS */}
            {/* Approve Modal */}
            <Dialog open={actionModal === 'approve'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-0 overflow-hidden sm:max-w-md">
                    <div className="bg-emerald-50 p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <DialogTitle className="text-xl font-black text-emerald-900 tracking-tight">Approve Business</DialogTitle>
                        <DialogDescription className="text-emerald-700 font-bold mt-2">
                            This will instantly verify {business.name} and unlock their storefront and payment processing capabilities.
                        </DialogDescription>
                    </div>
                    <div className="p-6 bg-white space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            <p className="text-xs font-bold text-slate-700">All risk indicators and documents have passed validation.</p>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                            <Button onClick={() => { setActionModal(null); onBack(); }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-white shadow-lg shadow-emerald-200">Confirm Verification</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={actionModal === 'reject'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <X className="w-5 h-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Reject Application</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            Select a reason for rejecting this business entity application.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="fraud">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Select Reason" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="fraud" className="font-bold cursor-pointer rounded-lg">High Fraud Risk / Blacklisted</SelectItem>
                                <SelectItem value="fake" className="font-bold cursor-pointer rounded-lg">Falsified Documents</SelectItem>
                                <SelectItem value="unsupported" className="font-bold cursor-pointer rounded-lg">Unsupported Business Category</SelectItem>
                                <SelectItem value="other" className="font-bold cursor-pointer rounded-lg">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder="Additional notes (optional)" className="resize-none rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400" />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => { setActionModal(null); onBack(); }} className="rounded-xl bg-red-600 hover:bg-red-700 font-black text-white shadow-lg shadow-red-200">Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Info Modal */}
            <Dialog open={actionModal === 'request_info'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Request Information</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            Send a message to the applicant requesting updated documents or clarifications.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="doc_missing">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Select Topic" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="doc_missing" className="font-bold cursor-pointer rounded-lg">Missing Registration Document</SelectItem>
                                <SelectItem value="doc_blur" className="font-bold cursor-pointer rounded-lg">Illegible ID / Utility Bill</SelectItem>
                                <SelectItem value="address" className="font-bold cursor-pointer rounded-lg">Address Discrepancy</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea 
                            placeholder="Type your message to the applicant..." 
                            className="resize-none h-32 rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400" 
                            defaultValue="Your uploaded utility bill is blurry. Please upload a clear, high-resolution copy of a utility bill issued within the last 3 months."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => { setActionModal(null); onBack(); }} className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-white shadow-lg shadow-blue-200">Send Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Escalate Modal */}
            <Dialog open={actionModal === 'escalate'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Escalate Review</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            Route this application to the senior compliance or fraud investigation team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="fraud_team">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Assign To" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="fraud_team" className="font-bold cursor-pointer rounded-lg">Fraud & Risk Team</SelectItem>
                                <SelectItem value="compliance_lead" className="font-bold cursor-pointer rounded-lg">Compliance Director</SelectItem>
                                <SelectItem value="legal" className="font-bold cursor-pointer rounded-lg">Legal Dept</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea 
                            placeholder="Reason for escalation..." 
                            className="resize-none h-24 rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400" 
                        />
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                            <ShieldAlert className="w-5 h-5 text-amber-600" />
                            <p className="text-[10px] uppercase tracking-widest font-black text-amber-800">Application will be locked until resolved.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => { setActionModal(null); onBack(); }} className="rounded-xl bg-amber-600 hover:bg-amber-700 font-black text-white shadow-lg shadow-amber-200">Escalate Application</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
