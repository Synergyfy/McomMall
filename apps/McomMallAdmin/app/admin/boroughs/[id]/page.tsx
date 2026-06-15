'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { 
    ChevronLeft,
    Building2, 
    Users, 
    Rocket, 
    Gift, 
    Calendar, 
    Activity,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    Store,
    Heart,
    BarChart3,
    MessageSquare,
    ShieldCheck,
    Globe,
    Eye,
    Zap,
    TrendingUp,
    MoreVertical,
    Edit3,
    Plus,
    LayoutDashboard,
    Share2,
    Lock,
    Search,
    Filter,
    Download,
    Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// --- Mock Data Finder ---
const boroughs = [
    { id: '1', name: 'Westminster', area: 'Central London', region: 'West End', engagement: '94.2%', health: 'A+', activity: 'Active Operational' },
    { id: '2', name: 'Camden', area: 'North London', region: 'North-West', engagement: '88.5%', health: 'A', activity: 'Operational' },
    { id: '3', name: 'Tower Hamlets', area: 'East London', region: 'East', engagement: '92.1%', health: 'A+', activity: 'High Activity' },
    { id: '4', name: 'Islington', area: 'Greater London Area', region: 'North-East', engagement: '84.2%', health: 'A+', activity: 'Active Operational' },
];

export default function BoroughProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const borough = boroughs.find(b => b.id === id) || boroughs[3]; // Default to Islington for demo

    return (
        <div className="space-y-8 pb-20">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link href="/admin/boroughs">
                    <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Inventory
                    </Button>
                </Link>
                <div className="h-4 w-px bg-slate-200" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Borough Profile / {borough.name}</p>
            </div>

            {/* Profile Header Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-50 overflow-hidden shadow-inner group-hover:border-orange-200 transition-colors">
                                <Building2 className="h-10 w-10 text-slate-300 group-hover:text-orange-400 transition-colors" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-orange-600 border-4 border-white flex items-center justify-center shadow-lg">
                                <ShieldCheck className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{borough.name} Borough</h1>
                                <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold py-1 px-3 rounded-full hover:bg-blue-100 transition-colors cursor-default">
                                    {borough.activity}
                                </Badge>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-300" /> {borough.area} • Region {borough.region}
                            </p>
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-orange-50 rounded-lg">
                                        <TrendingUp className="h-3.5 w-3.5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Engagement Score</p>
                                        <p className="text-sm font-black text-slate-800">{borough.engagement}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <Heart className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Community Health</p>
                                        <p className="text-sm font-black text-slate-800">{borough.health}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-50 gap-2 shadow-sm">
                                    <Edit3 className="h-4 w-4" /> Edit Profile
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-white">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black text-slate-900">Edit Profile</DialogTitle>
                                    <DialogDescription className="text-xs font-bold text-slate-500">
                                        Make changes to the borough profile here. Click save when you're done.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="name" className="text-right text-xs font-black text-slate-700 uppercase tracking-wider">
                                            Name
                                        </label>
                                        <Input id="name" defaultValue={borough.name} className="col-span-3 font-bold border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="area" className="text-right text-xs font-black text-slate-700 uppercase tracking-wider">
                                            Area
                                        </label>
                                        <Input id="area" defaultValue={borough.area} className="col-span-3 font-bold border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="region" className="text-right text-xs font-black text-slate-700 uppercase tracking-wider">
                                            Region
                                        </label>
                                        <Input id="region" defaultValue={borough.region} className="col-span-3 font-bold border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">Save changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 shadow-lg shadow-orange-200">
                                    <Plus className="h-4 w-4" /> New Campaign
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] bg-white">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black text-slate-900">Launch New Campaign</DialogTitle>
                                    <DialogDescription className="text-xs font-bold text-slate-500">
                                        Set up a new promotional or engagement campaign for the borough.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <label htmlFor="campaignName" className="text-xs font-black text-slate-700 uppercase tracking-wider">Campaign Name</label>
                                        <Input id="campaignName" placeholder="e.g. Summer High Street Boost" className="font-bold border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="budget" className="text-xs font-black text-slate-700 uppercase tracking-wider">Budget Limit</label>
                                            <Input id="budget" type="number" placeholder="£" className="font-bold border-slate-200 text-slate-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="target" className="text-xs font-black text-slate-700 uppercase tracking-wider">Target Audience</label>
                                            <Input id="target" placeholder="e.g. All Residents" className="font-bold border-slate-200 text-slate-900" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="desc" className="text-xs font-black text-slate-700 uppercase tracking-wider">Description</label>
                                        <Input id="desc" placeholder="Brief description of goals..." className="font-bold border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">Launch Campaign</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </Card>

            {/* Main Profile Tabs */}
            <Tabs defaultValue="overview" className="w-full space-y-8">
                <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start rounded-none h-12 p-0 gap-8 overflow-x-auto no-scrollbar">
                    {['Overview', 'Businesses', 'Customers', 'Campaigns', 'Events', 'Rewards', 'Community', 'Analytics', 'Visibility'].map((tab) => (
                        <TabsTrigger 
                            key={tab} 
                            value={tab.toLowerCase()} 
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none px-0 text-sm font-bold text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-widest transition-all"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* --- OVERVIEW CONTENT --- */}
                <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard2 title="Total Businesses" value="1,284" trend="+12.4%" icon={Store} color="orange" />
                        <StatCard2 title="Active Customers" value="42.5k" trend="+8.1%" icon={Users} color="blue" />
                        <StatCard2 title="Footfall Density" value="8.2k/day" trend="-2.3%" icon={Activity} color="indigo" trendDown />
                        <StatCard2 title="MCOM Impact" value="£1.42M" trend="+18.8%" icon={Zap} color="emerald" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Growth Chart (Visual Placeholder) */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-800">Growth & Engagement Trends</CardTitle>
                                    <CardDescription className="text-xs">Comparative analysis of business growth vs user engagement.</CardDescription>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                    <button className="px-3 py-1 text-[10px] font-bold text-slate-600 rounded-md hover:bg-white hover:shadow-sm transition-all">12M</button>
                                    <button className="px-3 py-1 text-[10px] font-bold text-slate-600 rounded-md hover:bg-white hover:shadow-sm transition-all">6M</button>
                                    <button className="px-3 py-1 text-[10px] font-bold text-slate-900 bg-white shadow-sm rounded-md transition-all">30D</button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-end gap-2 pt-6">
                                    {[45, 60, 40, 75, 85, 55, 95, 110, 65, 100, 125, 140].map((h, i) => (
                                        <div key={i} className="flex-1 group relative">
                                            <div 
                                                className={cn(
                                                    "w-full rounded-t-lg transition-all duration-500 group-hover:brightness-95",
                                                    i === 11 ? "bg-orange-600" : "bg-orange-100"
                                                )} 
                                                style={{ height: `${h}px` }} 
                                            />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                                {h}%
                                            </div>
                                            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase text-center">
                                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Regional Activity (Visual Placeholder) */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden group">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-800">Regional Activity</CardTitle>
                                <CardDescription className="text-xs">Density heatmap of active businesses.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 relative">
                                <div className="aspect-[4/5] bg-slate-950 flex items-center justify-center overflow-hidden">
                                    {/* Mock Radar/Heatmap Svg */}
                                    <div className="relative w-full h-full opacity-40">
                                        <div className="absolute inset-0 border-[0.5px] border-slate-800 rounded-full animate-pulse scale-75" />
                                        <div className="absolute inset-0 border-[0.5px] border-slate-800 rounded-full animate-pulse scale-50" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-1 h-full bg-slate-800 rotate-45" />
                                            <div className="w-1 h-full bg-slate-800 -rotate-45" />
                                        </div>
                                        <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-orange-500 rounded-full blur-md animate-ping" />
                                        <div className="absolute bottom-1/4 right-1/3 w-6 h-6 bg-blue-500 rounded-full blur-lg opacity-60" />
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-2xl space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-900">Angel High Street</p>
                                            <Badge variant="outline" className="border-none bg-transparent shadow-none h-4 text-[9px] text-orange-600 font-black p-0 uppercase">High Density</Badge>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400">342 Active Merchants</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transitions Table */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/30">
                            <CardTitle className="text-lg font-bold text-slate-800">Recent Business Transitions</CardTitle>
                            <Button variant="ghost" size="sm" className="text-[11px] font-black uppercase text-orange-600 hover:text-orange-700 tracking-tighter">View All Activities</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 pl-8">Merchant Name</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Category</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Last Sync</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400 text-center">Activity Score</TableHead>
                                        <TableHead className="text-right pr-8 h-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { name: 'Borough Market Fine Foods', cat: 'Grocery / Artisanal', status: 'ONBOARDED', time: '2 mins ago', score: 4 },
                                        { name: 'The Little Coffee Co.', cat: 'Cafe / Hospitality', status: 'PENDING REVIEW', time: '14 mins ago', score: 2 },
                                        { name: 'Greenery Florist', cat: 'Retail / Lifestyle', status: 'LIVE', time: '1 hour ago', score: 5 },
                                    ].map((m, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 transition-colors group">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-400 border border-slate-50 group-hover:bg-white transition-colors">
                                                        {m.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <p className="font-bold text-slate-800 text-sm tracking-tight">{m.name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-slate-500">{m.cat}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded-md",
                                                    m.status === 'ONBOARDED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    m.status === 'LIVE' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    {m.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-400">{m.time}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <div key={s} className={cn(
                                                            "w-3 h-1 rounded-full",
                                                            s <= m.score ? "bg-orange-500" : "bg-slate-100"
                                                        )} />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-900 rounded-lg">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- BUSINESSES CONTENT --- */}
                <TabsContent value="businesses" className="space-y-8 animate-in fade-in duration-500">
                    {/* Business KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard2 title="Active Businesses" value="1,284" trend="+4.2%" icon={Store} color="orange" />
                        <StatCard2 title="Storefront Traffic" value="84.2k" trend="+12.8%" icon={Activity} color="blue" />
                        <StatCard2 title="Avg Visibility Score" value="7.8/10" trend="-0.6%" icon={Eye} color="indigo" trendDown />
                        <StatCard2 title="Membership Yield" value="£142.5k" trend="+2.1%" icon={Zap} color="emerald" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Commerce Cluster Density */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm relative overflow-hidden bg-white">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-800">Commerce Cluster Density</CardTitle>
                                    <CardDescription className="text-xs">Live view of business activity across high-street zones.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold gap-1.5 rounded-lg border-slate-200 shadow-none">
                                        <Filter className="h-3 w-3" /> Layers
                                    </Button>
                                    <Badge variant="outline" className="h-8 px-3 border-orange-100 bg-orange-50 text-orange-600 font-bold gap-1.5 rounded-lg shadow-none">
                                        <Activity className="h-3 w-3 animate-pulse" /> Active Heatmap
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="h-80 relative flex items-center justify-center">
                                {/* Simulated Grid/Map Background */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                
                                <div className="relative w-full h-full">
                                    {/* Heatmap Clusters */}
                                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
                                    <div className="absolute top-[40%] left-[55%] w-6 h-6 bg-orange-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                    </div>
                                    
                                    <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
                                    <div className="absolute bottom-[38%] left-[28%] w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-xl" />

                                    <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                                    <div className="absolute top-[35%] right-[27%] w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-lg" />
                                </div>

                                {/* Map Overlay Legend */}
                                <div className="absolute bottom-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl space-y-2.5 min-w-[140px]">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">Zone Legend</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-600 shadow-sm" />
                                            <span className="text-[10px] font-bold text-slate-700">High Density</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                                            <span className="text-[10px] font-bold text-slate-700">Growth Zone</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-sm" />
                                            <span className="text-[10px] font-bold text-slate-700">Transition Area</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Traffic Distribution */}
                        <Card className="border-slate-200 shadow-sm flex flex-col bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-800">Traffic Distribution</CardTitle>
                                <CardDescription className="text-xs">By commerce category</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between py-6">
                                <div className="space-y-6">
                                    {[
                                        { label: 'Hospitality & Food', value: 62, color: 'bg-orange-500' },
                                        { label: 'Boutique Retail', value: 28, color: 'bg-blue-500' },
                                        { label: 'Services & Wellness', value: 18, color: 'bg-indigo-500' },
                                        { label: 'Co-working & Tech', value: 12, color: 'bg-slate-800' }
                                    ].map((item, i) => (
                                        <div key={i} className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                                                <span className="text-[11px] font-black text-slate-900">{item.value}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex gap-3 items-start">
                                    <div className="p-2 bg-white rounded-xl shadow-sm border border-orange-100">
                                        <TrendingUp className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                                        Hospitality traffic is up <span className="font-black text-orange-600">12% this week</span>. Suggesting targeted evening promotions in the Central Arcade.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Directory */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 py-6 px-8">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900">Detailed Directory</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <button className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">All</button>
                                    <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-3 py-1 rounded-full uppercase tracking-tighter">Premium</button>
                                    <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-3 py-1 rounded-full uppercase tracking-tighter">Standard</button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <Input placeholder="Filter by name..." className="pl-9 h-9 text-xs border-slate-100 bg-slate-50/50 w-64 rounded-xl focus-visible:ring-orange-500" />
                                </div>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100"><Filter className="h-4 w-4 text-slate-500" /></Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100"><Share2 className="h-4 w-4 text-slate-500" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-12">Business Name</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Membership Tier</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Visibility Score</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Storefront Traffic</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Status</TableHead>
                                        <TableHead className="text-right pr-8 h-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { name: 'Artisanal Bakery Co.', location: 'Central Arcade • Food & Drink', tier: 'PREMIUM GOLD', tierColor: 'bg-orange-50 text-orange-700 border-orange-100', score: 9.4, traffic: '12.4k', status: 'Active' },
                                        { name: 'Lumina Tech Hub', location: 'West Hub • Co-working', tier: 'SILVER PLUS', tierColor: 'bg-blue-50 text-blue-700 border-blue-100', score: 7.2, traffic: '4.1k', status: 'Active' },
                                        { name: 'Vintage Soul Boutique', location: 'East Side • Retail', tier: 'BASIC FREE', tierColor: 'bg-slate-50 text-slate-600 border-slate-200', score: 4.8, traffic: '1.2k', status: 'Pending' },
                                        { name: 'Green Thumbs Florist', location: 'Central Arcade • Retail', tier: 'PREMIUM PLATINUM', tierColor: 'bg-indigo-50 text-indigo-700 border-indigo-100', score: 8.9, traffic: '8.7k', status: 'Active' },
                                    ].map((b, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 transition-colors group border-slate-50">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-[11px] text-slate-400 border border-slate-100 shadow-sm group-hover:bg-white transition-colors">
                                                        {b.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-slate-800 text-sm tracking-tight">{b.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{b.location}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-[9px] font-black px-2.5 py-1 rounded-lg border-none shadow-sm", b.tierColor)}>
                                                    {b.tier}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-700 w-6">{b.score}</span>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-1000",
                                                                b.score > 8 ? "bg-orange-500" : b.score > 5 ? "bg-blue-500" : "bg-slate-300"
                                                            )} 
                                                            style={{ width: `${b.score * 10}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-black text-slate-700">{b.traffic}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", b.status === 'Active' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]")} />
                                                    <span className="text-[11px] font-bold text-slate-600">{b.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange-600 rounded-lg"><Edit3 className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-6 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 4 of 1,284 businesses</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, '...', 321].map((p, i) => (
                                        <button key={i} className={cn(
                                            "w-8 h-8 rounded-lg text-[11px] font-black transition-all",
                                            p === 1 ? "bg-orange-600 text-white shadow-lg shadow-orange-100" : "text-slate-400 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-100"
                                        )}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* --- CUSTOMERS CONTENT --- */}
                <TabsContent value="customers" className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Participation</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">Manage borough engagement, reward loyalty, and analyze local commerce behaviors.</p>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Borough Users</p>
                                    <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px]">+12% <ArrowUpRight className="h-3 w-3 ml-1" /></Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">12,482</p>
                                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full w-3/4 bg-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Participation</p>
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px]">84% <Activity className="h-3 w-3 ml-1" /></Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">8,920</p>
                                <p className="text-[10px] font-bold text-slate-400">Users engaged in last 7 days.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Retention Trend</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-orange-700"/> Loyal</div>
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-orange-200"/> New</div>
                                    </div>
                                </div>
                                <div className="h-12 flex items-end gap-1">
                                    {[30, 40, 35, 50, 60, 65, 70, 75, 80, 85, 45, 30].map((h, i) => (
                                        <div key={i} className={cn("flex-1 rounded-t-sm", i > 3 && i < 10 ? "bg-orange-700" : "bg-orange-200")} style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customer List */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 py-6 px-8">
                            <div className="flex items-center gap-2">
                                <button className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">All Customers</button>
                                <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 px-4 py-1.5 rounded-full transition-colors">Top Spenders</button>
                                <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 px-4 py-1.5 rounded-full transition-colors">Risk of Churn</button>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200"><Filter className="h-4 w-4 text-slate-500" /></Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200"><BarChart3 className="h-4 w-4 text-slate-500" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-12">Customer</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Engagement</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Rewards Points</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">QR Activity (7D)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Last Activity</TableHead>
                                        <TableHead className="text-right pr-8 h-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { initials: 'EJ', color: 'bg-orange-100 text-orange-700', name: 'Emily Jensen', email: 'emily.j@example.com', tier: 'VIP Platinum', tierColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', points: '4,250 pts', active: [2, 4, 3, 5, 4, 6], last: '2 hours ago' },
                                        { img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', name: 'Marcus Thorne', email: 'm.thorne@domain.net', tier: 'Frequent', tierColor: 'bg-blue-50 text-blue-600 border-blue-100', points: '1,820 pts', active: [1, 2, 1, 3, 2], last: 'Yesterday' },
                                        { initials: 'SR', color: 'bg-blue-100 text-blue-700', name: 'Sarah Rogers', email: 's.rogers@web.co', tier: 'Newcomer', tierColor: 'bg-orange-50 text-orange-600 border-orange-100', points: '450 pts', active: [1], last: '10 mins ago' },
                                    ].map((c, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    {c.img ? (
                                                        <img src={c.img} alt={c.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                                    ) : (
                                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm", c.color)}>
                                                            {c.initials}
                                                        </div>
                                                    )}
                                                    <div className="space-y-0.5">
                                                        <p className="font-black text-slate-800 text-sm tracking-tight">{c.name}</p>
                                                        <p className="text-[11px] font-bold text-slate-400">{c.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-[9px] font-black px-2.5 py-1 rounded-lg border-none shadow-sm uppercase", c.tierColor)}>
                                                    {c.tier}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-black text-slate-700">{c.points}</TableCell>
                                            <TableCell>
                                                <div className="flex items-end gap-1 h-6">
                                                    {c.active.map((h, j) => (
                                                        <div key={j} className="w-1.5 bg-orange-700 rounded-full" style={{ height: `${h * 15}%` }} />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-500">{c.last}</TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-6 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 1-10 of 12,482 customers</p>
                                <div className="flex items-center gap-1">
                                    <button className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center border border-slate-200 bg-white"><ChevronLeft className="h-4 w-4" /></button>
                                    <button className="w-8 h-8 rounded-lg text-[11px] font-black bg-orange-700 text-white shadow-md">1</button>
                                    <button className="w-8 h-8 rounded-lg text-[11px] font-black text-slate-500 border border-slate-200 bg-white hover:bg-slate-50">2</button>
                                    <button className="w-8 h-8 rounded-lg text-[11px] font-black text-slate-500 border border-slate-200 bg-white hover:bg-slate-50">3</button>
                                    <button className="w-8 h-8 rounded-lg text-slate-400 flex items-center justify-center border border-slate-200 bg-white"><ChevronLeft className="h-4 w-4 rotate-180" /></button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Map */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden relative">
                            <CardContent className="p-6">
                                <div className="bg-slate-900 rounded-2xl overflow-hidden relative h-[400px] flex items-center justify-center shadow-inner">
                                    {/* Map placeholder */}
                                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                                    
                                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur rounded-xl p-4 w-64 shadow-xl z-10">
                                        <h3 className="font-black text-sm text-slate-900">QR Activity Density</h3>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 mb-4 leading-relaxed">Most active clusters identified in High Street and Central Plaza areas.</p>
                                        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-orange-500 to-orange-700 rounded-full" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase mt-1 text-right tracking-widest">Density</p>
                                    </div>

                                    {/* Overlay elements resembling street grid and nodes */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="absolute w-40 h-40 bg-white/10 rounded-full blur-2xl top-1/3 left-1/3" />
                                        <div className="absolute w-64 h-64 bg-orange-500/10 rounded-full blur-3xl bottom-1/4 right-1/4" />
                                        <div className="absolute w-20 h-20 bg-white/20 rounded-full blur-xl bottom-1/3 left-1/2" />
                                        
                                        <div className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] top-[35%] left-[38%] animate-pulse" />
                                        <div className="absolute w-2 h-2 bg-white/60 rounded-full top-[38%] left-[40%]" />
                                        <div className="absolute w-4 h-4 bg-orange-200 rounded-full shadow-[0_0_20px_rgba(251,146,60,0.8)] bottom-[30%] right-[30%] animate-ping" />
                                        <div className="absolute w-2 h-2 bg-white rounded-full bottom-[28%] right-[32%]" />
                                    </div>

                                    <div className="absolute right-6 top-6 bottom-6 w-48 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/50 p-4 space-y-4 hidden md:block">
                                        <div className="h-6 w-24 bg-slate-700/50 rounded-md" />
                                        <div className="h-10 w-full bg-slate-700/50 rounded-md" />
                                        <div className="h-10 w-full bg-slate-700/50 rounded-md" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right sidebar */}
                        <div className="space-y-6">
                            {/* CTA */}
                            <Card className="bg-orange-600 border-orange-500 shadow-xl shadow-orange-600/20 text-white overflow-hidden relative">
                                <div className="absolute -right-8 -bottom-8 opacity-10">
                                    <Zap className="w-48 h-48" />
                                </div>
                                <CardContent className="p-8 relative z-10 space-y-4">
                                    <h3 className="text-xl font-black tracking-tight">Blast Loyalty Reward</h3>
                                    <p className="text-orange-100 text-sm font-medium leading-relaxed">Instantly reward all customers in the "VIP Platinum" tier with bonus points.</p>
                                    <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 font-black tracking-wide h-12 shadow-lg mt-2 border-none">
                                        Launch Promotion
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Queue */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Customer Notification Queue</p>
                                    
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-xs text-slate-900">Abandoned Cart Reminder</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1">Scheduled for 14:00 PM (1,240 recipients)</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-xs text-slate-900">New Item/C Water Market</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1">Pending Approval (8,800 recipients)</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-black text-xs text-slate-900">Monthly Impact Report</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-1">Completed (12,482 recipients)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full mt-8 font-bold text-[11px] text-slate-600 border-slate-200 hover:bg-slate-50">
                                        View All Campaigns
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                {/* --- CAMPAIGNS CONTENT --- */}
                <TabsContent value="campaigns" className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Local Marketing Campaigns</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Driving borough growth through strategic business collaboration.</p>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button className="px-4 py-1.5 text-[11px] font-black text-slate-900 bg-white shadow-sm rounded-lg transition-all">Active</button>
                            <button className="px-4 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 rounded-lg transition-all">Scheduled</button>
                            <button className="px-4 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 rounded-lg transition-all">Past</button>
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reach</p>
                                    <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 12.4%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">428.5K</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Impressions this month</p>
                                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden mt-4">
                                    <div className="h-full rounded-full w-2/3 bg-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-slate-200 shadow-sm border-b-4 border-b-blue-600">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Rate</p>
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 4.2%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">8.92%</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Avg. Click-through rate</p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Participants</p>
                                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-black text-[10px]">- 0%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">142</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Participating businesses</p>
                                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden mt-4">
                                    <div className="h-full rounded-full w-1/3 bg-slate-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion Value</p>
                                    <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 21%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">£84.2K</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Tracked borough spend</p>
                                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden mt-4">
                                    <div className="h-full rounded-full w-4/5 bg-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Ongoing Campaigns List */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden bg-white flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                                <CardTitle className="text-lg font-black text-slate-900">Ongoing Campaigns</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Filter className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/30">
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-12">Campaign Name</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Status</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Reach</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Eng.</TableHead>
                                            <TableHead className="text-right pr-8 h-12">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { icon: Store, color: 'bg-orange-100 text-orange-600', name: 'Taste of High Street', desc: 'Ends in 4 days • 42 businesses', status: 'ACTIVE', statusColor: 'bg-blue-50 text-blue-600', reach: '124,502', eng: '7.2%', action: 'Details' },
                                            { icon: Building2, color: 'bg-blue-100 text-blue-600', name: 'Local Artisan Weekend', desc: 'Ends in 12 days • 18 businesses', status: 'ACTIVE', statusColor: 'bg-blue-50 text-blue-600', reach: '58,190', eng: '4.1%', action: 'Details' },
                                            { icon: Eye, color: 'bg-indigo-100 text-indigo-600', name: 'Green Monday Initiative', desc: 'Scheduled: Oct 12 • 82 businesses', status: 'DRAFTING', statusColor: 'bg-slate-100 text-slate-600', reach: '-', eng: '-', action: 'Edit' },
                                            { icon: Rocket, color: 'bg-orange-100 text-orange-600', name: 'Festive Glow Trail', desc: 'Past • Nov 20 - Dec 30', status: 'COMPLETED', statusColor: 'bg-emerald-50 text-emerald-600', reach: '245,000', eng: '11.8%', action: 'Report' },
                                        ].map((c, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="pl-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", c.color)}>
                                                            <c.icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="font-black text-slate-800 text-sm tracking-tight">{c.name}</p>
                                                            <p className="text-[11px] font-bold text-slate-400">{c.desc}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("text-[9px] font-black px-2.5 py-1 rounded-lg border-none uppercase shadow-sm", c.statusColor)}>
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs font-black text-slate-700">{c.reach}</TableCell>
                                                <TableCell className="text-xs font-black text-slate-700">{c.eng}</TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="link" className="text-[11px] font-black text-orange-600 hover:text-orange-700 p-0 uppercase tracking-widest">{c.action}</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* New Campaign Wizard */}
                            <Card className="bg-slate-900 border-slate-800 shadow-xl text-white overflow-hidden relative">
                                <div className="absolute right-0 top-0 opacity-5">
                                    <Rocket className="w-64 h-64 -translate-y-10 translate-x-10" />
                                </div>
                                <CardContent className="p-8 relative z-10 space-y-6">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight mb-2">New Campaign</h3>
                                        <p className="text-slate-400 text-xs font-bold leading-relaxed">Launch a cross-borough marketing push in 4 simple steps.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">1</div>
                                            <p className="text-xs font-black text-white">Define Objective & Branding</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-500 font-black text-[10px] flex items-center justify-center shrink-0">2</div>
                                            <p className="text-xs font-bold text-slate-500">Invite Businesses</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-500 font-black text-[10px] flex items-center justify-center shrink-0">3</div>
                                            <p className="text-xs font-bold text-slate-500">Set Budget & Target</p>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black tracking-wide h-12 shadow-lg mt-2 gap-2 border-none">
                                        Launch Wizard <Zap className="h-4 w-4 text-orange-500" />
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Ad Performance */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Ad Performance by Channel</p>
                                    
                                    <div className="space-y-5">
                                        {[
                                            { name: 'MCOM App Native', value: 68, color: 'bg-orange-600' },
                                            { name: 'Instagram (Ad Connect)', value: 22, color: 'bg-blue-600' },
                                            { name: 'Email Newsletters', value: 10, color: 'bg-indigo-600' }
                                        ].map((ch, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-black text-slate-900">{ch.name}</p>
                                                    <p className="text-[11px] font-black text-slate-500">{ch.value}%</p>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                    <div className={cn("h-full rounded-full transition-all duration-1000", ch.color)} style={{ width: `${ch.value}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex gap-3 items-start">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100 text-blue-600 shrink-0">
                                            <Search className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">Insight</p>
                                            <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                                                Visual content campaigns performed <span className="text-blue-600 font-black">3.2x better</span> this week.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                {/* --- EVENTS CONTENT --- */}
                <TabsContent value="events" className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Local Event Ecosystem</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Managing 8 active community events across the borough.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="font-bold text-slate-700 h-9">Calendar</Button>
                            <Button className="font-bold bg-slate-900 text-white hover:bg-slate-800 h-9">Map View</Button>
                        </div>
                    </div>

                    {/* KPI & Featured row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Graph */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col justify-between p-6">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Events (30 Days)</p>
                                    <div className="flex items-end gap-3 mt-1">
                                        <p className="text-4xl font-black text-slate-900 tracking-tight">124,892</p>
                                        <p className="text-xs font-bold text-emerald-500 mb-1">+14.2% vs last month</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-orange-600 shadow-sm" />
                                    <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm" />
                                </div>
                            </div>
                            <div className="h-40 flex items-end gap-2 w-full">
                                {[40, 55, 45, 60, 45, 70, 100, 80, 65, 55, 75, 45].map((h, i) => (
                                    <div key={i} className="flex-1 group relative h-full flex items-end">
                                        <div 
                                            className={cn("w-full rounded-t-sm transition-all duration-300", i === 6 ? "bg-orange-700" : "bg-slate-200")} 
                                            style={{ height: `${h}%` }} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Stats list */}
                        <Card className="border-slate-200 shadow-sm p-6 flex flex-col">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ticket Sales</p>
                            <div className="flex items-center gap-3 mb-8">
                                <p className="text-3xl font-black text-slate-900">3,412</p>
                                <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px] uppercase">Active Now</Badge>
                            </div>
                            
                            <div className="space-y-6 mt-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 rounded-xl text-orange-600"><Building2 className="w-4 h-4" /></div>
                                        <p className="text-sm font-black text-slate-800">Farmers Market</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-500">1,240</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Zap className="w-4 h-4" /></div>
                                        <p className="text-sm font-black text-slate-800">Local Art Expo</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-500">842</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-xl text-slate-600"><Globe className="w-4 h-4" /></div>
                                        <p className="text-sm font-black text-slate-800">Heritage</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-500">530</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Featured Events */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event 1 */}
                        <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/50 to-transparent z-10" />
                            <div className="absolute inset-0 bg-orange-900/40 mix-blend-multiply z-10" />
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174000287-43f16b251fcb?q=80&w=2000')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                                <Badge className="bg-orange-600 text-white border-none font-black text-[10px] w-fit mb-3 uppercase tracking-widest shadow-lg">Featured Event</Badge>
                                <h3 className="text-2xl font-black text-white leading-tight mb-2">Central Borough Food & Music Expo</h3>
                                <p className="text-orange-100 text-sm font-bold mb-6">Market Road Evening Stage • 8th - 10th Aug</p>
                                <Button className="w-fit bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/20 font-black">Manage Logistics</Button>
                            </div>
                        </div>
                        {/* Event 2 */}
                        <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/50 to-transparent z-10" />
                            <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10" />
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2000')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                                <Badge className="bg-blue-600 text-white border-none font-black text-[10px] w-fit mb-3 uppercase tracking-widest shadow-lg">Weekly Event</Badge>
                                <h3 className="text-2xl font-black text-white leading-tight mb-2">Weekly Artisanal Farmers Market</h3>
                                <p className="text-blue-100 text-sm font-bold mb-6">Station Square • Every Saturday</p>
                                <Button className="w-fit bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/20 font-black">Application Queue</Button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-6 px-8">
                            <div>
                                <CardTitle className="text-lg font-black text-slate-900">Upcoming Events Schedule</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-500 mt-1">Review, scale, or set approvals for local activities.</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200"><Filter className="h-4 w-4 text-slate-500" /></Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200"><Calendar className="h-4 w-4 text-slate-500" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-12">Event Details</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Location / Host</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Date & Time</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12 text-center">Tickets</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Status</TableHead>
                                        <TableHead className="text-right pr-8 h-12">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=80', name: 'Midnight Jazz Series', desc: 'Hosted by Le Journal', loc: "St. Mary's Cathedral Square", date: 'Oct 21, 20:00', tix: '4,500', status: 'ACTIVE', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                                        { img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&q=80', name: 'Heritage Craft Market', desc: 'Local Artisans Guild', loc: "Main High Street (North)", date: 'Oct 28, 09:00', tix: '12,000', status: 'PENDING APPROVAL', statusColor: 'bg-amber-50 text-amber-600 border-amber-100' },
                                        { img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80', name: 'Borough Beats in the Park', desc: 'Borough Initiative', loc: "Town Hall Lawn Suite", date: 'Nov 12, 14:00', tix: '850', status: 'ACTIVE', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                                    ].map((e, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <img src={e.img} alt={e.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                                    <div className="space-y-0.5">
                                                        <p className="font-black text-slate-800 text-sm tracking-tight">{e.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{e.desc}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-black text-slate-700">{e.loc}</TableCell>
                                            <TableCell>
                                                <p className="text-xs font-black text-slate-900">{e.date}</p>
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-black text-slate-700">{e.tix}</TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-[9px] font-black px-2 py-0.5 rounded-md uppercase", e.statusColor)}>
                                                    {e.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-6 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 3 of 24 events</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold text-slate-600 bg-white">Previous</Button>
                                    <Button size="sm" className="h-8 text-[11px] font-black bg-orange-700 text-white">Next</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Map */}
                    <Card className="border-slate-200 shadow-sm p-6 bg-white relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-sm text-slate-900">Geographic Concentration</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500"><div className="w-2 h-2 rounded-full bg-orange-700"/> High Density</div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500"><div className="w-2 h-2 rounded-full bg-orange-200"/> Low Density</div>
                            </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden relative h-[300px] flex items-center justify-center">
                            {/* Map grid */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                            
                            {/* Map Points */}
                            <div className="absolute w-24 h-24 bg-orange-700/20 rounded-full blur-xl bottom-1/4 left-1/3" />
                            <div className="absolute w-4 h-4 bg-orange-700 rounded-full shadow-[0_0_15px_rgba(194,65,12,0.6)] border-4 border-white bottom-[28%] left-[36%] animate-pulse" />
                            
                            <div className="absolute w-48 h-48 bg-orange-400/20 rounded-full blur-xl bottom-1/3 left-1/2" />
                            <div className="absolute w-6 h-6 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)] border-4 border-white bottom-[35%] left-[55%]" />
                            
                            <div className="absolute w-3 h-3 bg-orange-300 rounded-full border-2 border-white top-1/3 right-1/4" />
                            
                            {/* Tooltip mockup */}
                            <div className="absolute bottom-6 right-6 bg-white shadow-xl border border-slate-100 rounded-xl p-3 w-48 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 leading-tight">Central Square Event</p>
                                    <p className="text-[9px] font-bold text-slate-500 mt-0.5">3 events in this zone</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
                {/* --- REWARDS CONTENT --- */}
                <TabsContent value="rewards" className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Borough Rewards Management</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Overview local loyalty systems, redemption metrics, and incentive configurations.</p>
                        </div>
                        <Button variant="outline" className="font-bold text-slate-700 bg-orange-50 border-orange-200 gap-2"><Gift className="w-4 h-4 text-orange-600" /> Issue 30% Boost</Button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-slate-200 shadow-sm relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reward Points</p>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> +14%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900 relative z-10">12,482</p>
                                {/* Mini Bar Chart */}
                                <div className="absolute bottom-0 right-6 flex items-end gap-1 opacity-50 z-0">
                                    {[20, 25, 15, 35, 45, 60, 80].map((h, i) => (
                                        <div key={i} className="w-3 bg-orange-600 rounded-t-sm" style={{ height: `${h}px` }} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redemption Rate</p>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> +4.1%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">68.2%</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Active residents participating</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm border-l-4 border-l-blue-600 bg-slate-50 relative overflow-hidden group">
                            <CardContent className="p-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Equivalent MCOM Value</p>
                                <p className="text-3xl font-black text-slate-900">£42.5k</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Estimated boost to local economy</p>
                                <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-white to-transparent flex flex-col justify-center items-end pr-6 border-l border-white/50 backdrop-blur-[2px]">
                                    <div className="absolute -z-10 right-2 top-2 opacity-10">
                                        <Gift className="w-20 h-20 text-blue-600" />
                                    </div>
                                    <p className="text-[9px] font-black text-blue-600 uppercase">Top Performing Reward</p>
                                    <p className="text-xs font-bold text-slate-800 text-right">Weekend Spa Day</p>
                                    <p className="text-[10px] font-bold text-slate-400">1.4k redeemed this month</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Table */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col bg-white">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-4">
                                <CardTitle className="text-sm font-black text-slate-900">Active Rewards & Vouchers</CardTitle>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg"><Filter className="w-3.5 h-3.5 text-slate-500" /></Button>
                                    <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg"><Search className="w-3.5 h-3.5 text-slate-500" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward Name</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redeemed / Limit</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocity</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: 'Local Coffee Perk', count: '2,400', pct: 60, status: 'Active' },
                                            { name: 'Weekend Parking Disc.', count: '850', pct: 90, status: 'Active' },
                                            { name: 'Gym Intro Session', count: '1,200', pct: 30, status: 'Paused' },
                                            { name: 'Summer Festival Pass', count: '5,400', pct: 100, status: 'Closed' }
                                        ].map((r, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50/50">
                                                <TableCell className="font-bold text-xs text-slate-900">{r.name}</TableCell>
                                                <TableCell className="text-xs font-bold text-slate-600">{r.count}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={cn("h-full rounded-full", r.pct > 80 ? "bg-orange-600" : "bg-emerald-500")} style={{ width: `${r.pct}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500">{r.pct}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest border-none px-2",
                                                        r.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                                                        r.status === 'Paused' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {r.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900"><MoreVertical className="w-4 h-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Right Panel */}
                        <div className="space-y-6">
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="py-4 border-b border-slate-50">
                                    <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2"><Settings className="w-4 h-4 text-orange-600" /> Reward Configuration</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Global Borough Multiplier</label>
                                            <span className="text-sm font-black text-slate-900">1.5x</span>
                                        </div>
                                        <div className="relative h-2 w-full bg-slate-100 rounded-full">
                                            <div className="absolute left-0 top-0 h-full w-[40%] bg-orange-600 rounded-full" />
                                            <div className="absolute left-[40%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-orange-600 rounded-full shadow-sm cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-black text-slate-900">VIP Boost System</p>
                                                <div className="w-8 h-4 rounded-full bg-orange-600 relative">
                                                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Enables dynamic 2x rates at physical merchant locations for MCOM gold subscribers.</p>
                                        </div>
                                        <div className="p-4 border border-slate-200 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-black text-slate-900">Partner Program</p>
                                                <div className="w-8 h-4 rounded-full bg-slate-200 relative">
                                                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Allows merchants to co-fund rewards using their MCOM store credits directly.</p>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 font-bold shadow-none">Apply changes</Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl bg-slate-950 text-white relative overflow-hidden group cursor-pointer">
                                {/* bg image mockup */}
                                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10" />
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-700" />
                                <CardContent className="relative z-20 p-6 pt-16">
                                    <Badge className="bg-orange-600 text-white border-none text-[9px] font-black uppercase tracking-widest mb-3 hover:bg-orange-600">Featured Campaign</Badge>
                                    <h3 className="text-lg font-black tracking-tight mb-2">Boost: High Street Activity</h3>
                                    <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1 group-hover:text-orange-400 transition-colors">Launch Promotion <ArrowUpRight className="w-3 h-3" /></p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Bottom Map Section */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-4">
                            <div>
                                <CardTitle className="text-sm font-black text-slate-900">Geographic Redemption Velocity</CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-500 mt-1">Heatmap of existing offers redeemed by active users locally across the borough.</CardDescription>
                            </div>
                            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                                <button className="px-3 py-1 text-[10px] font-bold text-slate-900 bg-white shadow-sm rounded-md transition-all">Map View</button>
                                <button className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 rounded-md transition-all">Chart View</button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex flex-col md:flex-row">
                            {/* Map Mockup */}
                            <div className="md:w-1/2 bg-slate-50 relative min-h-[300px] border-r border-slate-100 flex items-center justify-center overflow-hidden">
                                <div className="absolute w-[300px] h-[300px] bg-slate-100 rounded-full blur-3xl opacity-50" />
                                <div className="relative">
                                    <MapPin className="w-12 h-12 text-slate-300/50" strokeWidth={1} />
                                </div>
                                {/* Heat nodes */}
                                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-orange-500/20 rounded-full blur-md flex items-center justify-center">
                                    <div className="w-16 h-16 bg-orange-600/40 rounded-full blur-sm" />
                                    <div className="absolute w-4 h-4 bg-orange-600 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.8)] border-2 border-white" />
                                </div>
                                <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-orange-500/20 rounded-full blur-md flex items-center justify-center">
                                    <div className="w-8 h-8 bg-orange-600/40 rounded-full blur-sm" />
                                    <div className="absolute w-3 h-3 bg-orange-600 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.8)] border-2 border-white" />
                                </div>
                                {/* Map Tooltip */}
                                <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-xl border border-slate-200 p-3">
                                    <p className="text-[10px] font-black text-slate-900">Morning Workout</p>
                                    <p className="text-[9px] font-bold text-slate-500">2.4k redeemed this week</p>
                                </div>
                            </div>
                            
                            {/* Stats */}
                            <div className="md:w-1/2 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-[11px] font-black text-slate-900 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-600" /> Redemption by Category</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Compared to last month</p>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { cat: 'Dining & Cafes', pct: 85, trend: '+15%' },
                                        { cat: 'Beauty / Fashion', pct: 45, trend: '-2%' },
                                        { cat: 'Leisure & Sports', pct: 90, trend: '+40%' },
                                        { cat: 'Transport', pct: 15, trend: '0%' }
                                    ].map((c, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between mb-2">
                                                <p className="text-[10px] font-black text-slate-700">{c.cat}</p>
                                                <p className="text-[10px] font-black text-slate-400">{c.trend}</p>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full", c.pct > 50 ? "bg-orange-600" : "bg-slate-400")} style={{ width: `${c.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* --- COMMUNITY CONTENT --- */}
                <TabsContent value="community" className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Community Participation</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Oversee local discussions, moderation, and member activity levels.</p>
                        </div>
                        <Button className="font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-600/20"><Plus className="h-4 w-4" /> Create Broadcast</Button>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-slate-200 shadow-sm border-b-4 border-b-orange-600">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Members</p>
                                    <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 12.4%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">42,891</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-slate-200 shadow-sm border-b-4 border-b-blue-600">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Rate</p>
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 8.2%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">88.5%</p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm border-b-4 border-b-red-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Moderation</p>
                                    <Badge className="bg-red-50 text-red-600 border-red-100 font-black text-[10px]"><ArrowUpRight className="h-3 w-3 mr-1" /> High</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">24</p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm border-b-4 border-b-emerald-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poll Participation</p>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px]">Stable</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">12,104</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Community Feed */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                                <CardTitle className="text-lg font-black text-slate-900">Community Feed</CardTitle>
                                <div className="flex items-center gap-2">
                                    <button className="text-[11px] font-black text-slate-900 bg-slate-100 px-4 py-1.5 rounded-full">All Posts</button>
                                    <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 px-4 py-1.5 rounded-full transition-colors">Announcements</button>
                                    <button className="text-[11px] font-bold text-slate-500 hover:text-slate-900 px-4 py-1.5 rounded-full transition-colors">Flagged</button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                {/* Post 1 */}
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md font-black">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-blue-600 flex items-center gap-1">Official Announcement <Badge className="h-4 px-1 bg-blue-100 text-blue-700 hover:bg-blue-100 ml-1 rounded border-none">✓</Badge></p>
                                                <p className="text-[10px] font-bold text-slate-400">2 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2">New Pedestrian Zone Proposal: Public Consultation Open</h4>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">We are inviting all residents of the Central High Street area to share their thoughts on the proposed 2025 pedestrianization project...</p>
                                    <div className="flex items-center gap-4 text-slate-500">
                                        <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-blue-600 transition-colors"><MessageSquare className="w-3.5 h-3.5" /> 142 Comments</button>
                                        <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-blue-600 transition-colors"><Heart className="w-3.5 h-3.5" /> 842 Likes</button>
                                        <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-blue-600 transition-colors"><Share2 className="w-3.5 h-3.5" /> 24 Shares</button>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-slate-100" />

                                {/* Post 2 */}
                                <div className="pl-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704b" alt="User" className="w-10 h-10 rounded-full border border-slate-200" />
                                            <div>
                                                <p className="text-sm font-black text-slate-800">Sarah Mitchell <span className="text-[10px] font-bold text-slate-400 font-normal ml-1">Local Resident</span></p>
                                                <p className="text-[10px] font-bold text-slate-400">5 hours ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed mb-4">Does anyone know why the waste collection was delayed in Sector 4 this morning? I've seen a few reports of this across the neighborhood.</p>
                                    
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Community Note</p>
                                        <p className="text-xs font-bold text-slate-600 italic">There was a temporary blockage on Miller Drive which has now been cleared. Service should resume normally within the hour.</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-slate-500">
                                        <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-orange-600 transition-colors"><MessageSquare className="w-3.5 h-3.5" /> 12 Comments</button>
                                        <button className="flex items-center gap-1.5 text-[11px] font-bold hover:text-orange-600 transition-colors"><Heart className="w-3.5 h-3.5" /> 48 Likes</button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Moderation Tasks */}
                            <Card className="border-red-200 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="bg-red-50/50 border-b border-red-100 py-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">Moderation Tasks <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[9px] px-1.5 py-0 border-none">URGENT</Badge></CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100">
                                        <div className="p-4 flex items-start justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex gap-3">
                                                <div className="p-1.5 bg-red-100 text-red-600 rounded-lg shrink-0 h-fit"><ShieldCheck className="w-4 h-4" /></div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 leading-tight">Inappropriate language detected</p>
                                                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Reported 14 mins ago • User: @jd_842</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">Review</Button>
                                        </div>
                                        <div className="p-4 flex items-start justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex gap-3">
                                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0 h-fit"><Users className="w-4 h-4" /></div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 leading-tight">Multiple account creation</p>
                                                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">IP Flag • 3 hours ago</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50">Review</Button>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                                        <button className="text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">View All Queue (24)</button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trending Topics */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="py-4 border-b border-slate-50">
                                    <CardTitle className="text-sm font-black text-slate-900">Trending Topics</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {[
                                            { topic: '#ParkingReform', posts: '4,210 posts', color: 'bg-red-500' },
                                            { topic: '#LocalProduce', posts: '1,842 posts', color: 'bg-emerald-500' },
                                            { topic: '#ArtsFestival', posts: '942 posts', color: 'bg-blue-500' },
                                            { topic: '#NightEconomy', posts: '412 posts', color: 'bg-orange-500' },
                                        ].map((t, i) => (
                                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", t.color)} />
                                                    <p className="text-sm font-black text-slate-700 group-hover:text-blue-600 transition-colors">{t.topic}</p>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400">{t.posts}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Instant Poll */}
                            <Card className="bg-orange-600 border-orange-500 shadow-xl shadow-orange-600/20 text-white overflow-hidden relative">
                                <CardContent className="p-6 relative z-10 space-y-4">
                                    <h3 className="text-lg font-black tracking-tight">New Instant Poll</h3>
                                    <p className="text-orange-100 text-xs font-bold leading-relaxed mb-2">Engage your citizens in seconds.</p>
                                    <div className="space-y-3">
                                        <Input placeholder="Question..." className="bg-orange-700/50 border-orange-500/50 text-white placeholder:text-orange-300 focus-visible:ring-white h-10" />
                                        <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 font-black tracking-wide shadow-lg border-none">
                                            Launch Poll
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Member Management Table */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-6 px-8">
                            <div>
                                <CardTitle className="text-lg font-black text-slate-900">Member Management</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-500 mt-1">High participation citizens and community leaders.</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="h-9 text-[11px] font-bold text-slate-600 border-slate-200">Activity: Highest first</Button>
                                <Button className="h-9 w-9 p-0 rounded-lg bg-slate-800 text-white"><Filter className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/30">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-12">Member</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Status</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Trust Score (100)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Activity Trend</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-12">Last Active</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[
                                        { img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', name: 'Marcus Chew', role: 'Community Leader', status: 'COMMUNITY STAR', statusColor: 'bg-blue-50 text-blue-600 border-blue-100', score: 98, trend: 'Increasing', active: '5 mins ago' },
                                        { img: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', name: 'Elena Rodriguez', role: 'Local Business Owner', status: 'ACTIVE CITIZEN', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', score: 84, trend: 'Stable', active: '2 hours ago' },
                                        { img: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', name: 'Julian Basile', role: 'Resident', status: 'WARNING', statusColor: 'bg-amber-50 text-amber-600 border-amber-100', score: 42, trend: 'Decreasing', active: '15 days ago' },
                                    ].map((m, i) => (
                                        <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={m.img} alt={m.name} className="w-10 h-10 rounded-full border border-slate-200" />
                                                    <div className="space-y-0.5">
                                                        <p className="font-black text-slate-800 text-sm tracking-tight">{m.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{m.role}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-[9px] font-black px-2 py-0.5 rounded-md uppercase border-none", m.statusColor)}>
                                                    {m.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-800 w-4">{m.score}</span>
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full", m.score > 90 ? "bg-blue-600" : m.score > 50 ? "bg-emerald-500" : "bg-orange-500")} style={{ width: `${m.score}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {m.trend === 'Increasing' && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                                                    {m.trend === 'Stable' && <Activity className="w-3.5 h-3.5 text-blue-500" />}
                                                    {m.trend === 'Decreasing' && <TrendingUp className="w-3.5 h-3.5 text-amber-500 rotate-180" />}
                                                    <span className="text-[11px] font-bold text-slate-600">{m.trend}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-500">{m.active}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing 3 of 42,891 members</p>
                                <div className="flex items-center gap-1">
                                    <button className="w-7 h-7 rounded text-[11px] font-black bg-orange-700 text-white shadow-md">1</button>
                                    <button className="w-7 h-7 rounded text-[11px] font-black text-slate-500 border border-slate-200 bg-white">2</button>
                                    <button className="w-7 h-7 rounded text-[11px] font-black text-slate-500 border border-slate-200 bg-white">3</button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* --- ANALYTICS CONTENT --- */}
                <TabsContent value="analytics" className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Borough Analytics Engine</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Deep dive into local economic health, demographics, and predictive trends.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button className="px-4 py-1.5 text-[11px] font-black text-slate-900 bg-white shadow-sm rounded-lg transition-all">30 Days</button>
                            <button className="px-4 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 rounded-lg transition-all">Q3 2024</button>
                            <button className="px-4 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 rounded-lg transition-all">YTD</button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 ml-2"><Download className="w-3.5 h-3.5" /></Button>
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-slate-400">Monthly GTV</p>
                                    <Badge className="bg-white/10 text-white border-none font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 24.8%</Badge>
                                </div>
                                <p className="text-3xl font-black text-white">£2.4M</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Gross Transaction Volume</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Residents</p>
                                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 12.1%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">84.2K</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Engaged this period</p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion Rate</p>
                                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-black text-[10px]">- 0.2%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">14.8%</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">App to store visits</p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention</p>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> 4.2%</Badge>
                                </div>
                                <p className="text-3xl font-black text-slate-900">92.4%</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Repeat local shoppers</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Chart */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm p-6 bg-white flex flex-col">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="font-black text-sm text-slate-900">Revenue vs Resident Growth</h3>
                                    <p className="text-[11px] font-bold text-slate-500 mt-1">Correlating community engagement with economic output.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-600"/> Revenue (£)</div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500"><div className="w-2 h-2 rounded-full bg-orange-500"/> Residents</div>
                                </div>
                            </div>
                            
                            {/* Line Chart Mockup */}
                            <div className="flex-1 relative min-h-[300px] w-full flex items-end">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between z-0">
                                    {[0,1,2,3,4].map(i => (
                                        <div key={i} className="w-full h-px bg-slate-100 relative">
                                            <span className="absolute -left-6 -top-2 text-[9px] font-black text-slate-300">{100 - (i*25)}k</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Fake Line paths */}
                                <svg className="absolute inset-0 h-full w-full z-10 preserve-aspect-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M 0 80 Q 20 70, 40 50 T 80 20 L 100 10" fill="none" stroke="currentColor" className="text-blue-600 drop-shadow-md" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                    <path d="M 0 90 Q 25 85, 50 70 T 90 40 L 100 35" fill="none" stroke="currentColor" className="text-orange-500 drop-shadow-md" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                                </svg>

                                {/* Data Points / Tooltips */}
                                <div className="absolute inset-0 z-20 flex justify-between">
                                    {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => (
                                        <div key={i} className="h-full flex flex-col justify-end w-px bg-transparent hover:bg-slate-200 group relative">
                                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400">{w}</span>
                                            {/* Hover indicator */}
                                            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-blue-600 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-orange-500 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Demographics */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="py-4 border-b border-slate-50">
                                    <CardTitle className="text-sm font-black text-slate-900">Demographic Shifts</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-xs font-black text-slate-700">Young Professionals (25-34)</p>
                                            <p className="text-xs font-black text-blue-600">+12%</p>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-blue-600 w-[65%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-xs font-black text-slate-700">Families (35-50)</p>
                                            <p className="text-xs font-black text-orange-500">+4%</p>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-orange-500 w-[45%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-xs font-black text-slate-700">Students (18-24)</p>
                                            <p className="text-xs font-black text-emerald-500">-2%</p>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-emerald-500 w-[25%]" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Categories */}
                            <Card className="border-slate-200 shadow-sm bg-white">
                                <CardHeader className="py-4 border-b border-slate-50">
                                    <CardTitle className="text-sm font-black text-slate-900">Top Performing Categories</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-50">
                                        {[
                                            { name: 'Artisan Food & Drink', rev: '£1.2M', trend: '+14%' },
                                            { name: 'Local Fashion', rev: '£842K', trend: '+8%' },
                                            { name: 'Health & Wellness', rev: '£420K', trend: '+22%' },
                                            { name: 'Home & Lifestyle', rev: '£210K', trend: '-1%' },
                                        ].map((c, i) => (
                                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <p className="text-xs font-black text-slate-800">{c.name}</p>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-slate-900">{c.rev}</p>
                                                    <p className={cn("text-[10px] font-bold", c.trend.startsWith('+') ? "text-emerald-500" : "text-amber-500")}>{c.trend}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Predictive Insights */}
                    <div>
                        <h3 className="text-lg font-black tracking-tight mb-4 text-slate-900">Predictive Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <Badge className="bg-blue-600 text-white font-black text-[9px] uppercase tracking-widest border-none mb-2">High Probability</Badge>
                                    <h4 className="font-black text-slate-900 mb-2">Weekend Coffee Surge</h4>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">Based on the upcoming weather forecast and historical data, expect a <span className="font-black text-blue-700">22% increase</span> in foot traffic around the artisanal café district this Saturday.</p>
                                </CardContent>
                            </Card>
                            <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                    <Badge className="bg-orange-600 text-white font-black text-[9px] uppercase tracking-widest border-none mb-2">Medium Probability</Badge>
                                    <h4 className="font-black text-slate-900 mb-2">Retail Slowdown (Apparel)</h4>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">Local fashion boutiques may see a <span className="font-black text-orange-700">15% dip</span> next week following the end-of-season sales. Recommend a flash-campaign to offset.</p>
                                </CardContent>
                            </Card>
                            <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <Badge className="bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest border-none mb-2">Opportunity Detected</Badge>
                                    <h4 className="font-black text-slate-900 mb-2">Untapped Evening Economy</h4>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">Search queries for "late night food" in the borough have grown 40% MoM. Huge opportunity for targeted vendor onboarding.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                {/* --- VISIBILITY CONTENT --- */}
                <TabsContent value="visibility" className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Visibility Management</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Analyze and boost borough commercial discovery through smart algorithmic controls.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="font-bold text-slate-700 h-9">Live View</Button>
                            <Button className="font-bold bg-slate-900 text-white hover:bg-slate-800 h-9">B2B Portal</Button>
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                                        <Eye className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <p className="text-[11px] font-black text-emerald-600 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +12.4%</p>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Impression Share</p>
                                <p className="text-3xl font-black text-slate-900">2.4M <span className="text-xs font-bold text-slate-400 tracking-normal">Impressions</span></p>
                                {/* Mini sparkline */}
                                <svg className="w-full h-8 mt-4 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                                    <path d="M0,15 L10,12 L20,18 L30,5 L40,10 L50,2 L60,8 L70,12 L80,4 L90,10 L100,2" fill="none" stroke="#ea580c" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="opacity-50" />
                                </svg>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Search className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-[11px] font-black text-emerald-600 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Top 5%</p>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Borough Search Index</p>
                                <p className="text-3xl font-black text-slate-900">#4 <span className="text-xs font-bold text-slate-400 tracking-normal">in Region</span></p>
                                <p className="text-xs font-bold text-slate-500 mt-4 leading-relaxed">Consistently outperforming 12 neighboring boroughs in engagement.</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-slate-800 text-white relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Smart Discovery Logic</p>
                                    </div>
                                    <Zap className="w-4 h-4 text-slate-600" />
                                </div>
                                <p className="text-xl font-black text-white mb-6 tracking-tight">High Street Pulse Active</p>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <p className="text-[10px] font-bold text-slate-400">Optimization Level</p>
                                        <p className="text-[10px] font-black text-orange-500">Dynamic (Max)</p>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 w-[90%]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Table */}
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-4">
                                <CardTitle className="text-sm font-black text-slate-900">Visibility Performance Scorecard</CardTitle>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg"><Filter className="w-3.5 h-3.5 text-slate-500" /></Button>
                                    <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg"><Download className="w-3.5 h-3.5 text-slate-500" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business / Hub</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visibility Score</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Impressions</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                                            <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: 'Central High Street', sub: 'Primary Hub', score: 98, imp: '452,000+', status: 'Optimized' },
                                            { name: 'The Artisan Block', sub: 'Zones 1 & 2', score: 72, imp: '12,400', status: 'Organic' },
                                            { name: 'Borough Bistro', sub: 'Dining', score: 44, imp: '5,700', status: 'Under-Pacing' },
                                            { name: 'Station Tech Hub', sub: 'Outskirts / Coworking', score: 21, imp: '2,100', status: 'Low Impact' },
                                        ].map((r, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white",
                                                            i === 0 ? "bg-blue-600" : i === 1 ? "bg-stone-300 text-stone-700" : i === 2 ? "bg-orange-300" : "bg-slate-800"
                                                        )}>{r.name.substring(0, 2).toUpperCase()}</div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900">{r.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-500">{r.sub}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full border-2 mx-auto flex items-center justify-center text-[10px] font-black",
                                                        r.score > 80 ? "border-emerald-500 text-emerald-600" : r.score > 50 ? "border-blue-500 text-blue-600" : r.score > 30 ? "border-orange-500 text-orange-600" : "border-slate-300 text-slate-500"
                                                    )}>{r.score}</div>
                                                </TableCell>
                                                <TableCell className="text-xs font-bold text-slate-600">{r.imp}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest border-none px-2",
                                                        r.status === 'Optimized' ? "bg-emerald-50 text-emerald-600" :
                                                        r.status === 'Organic' ? "bg-blue-50 text-blue-600" : 
                                                        r.status === 'Under-Pacing' ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {r.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" className="text-[10px] font-bold text-slate-400 hover:text-slate-900">View Data</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Right Panel */}
                        <div className="space-y-6">
                            <Card className="border-orange-200 shadow-sm bg-orange-50/30">
                                <CardHeader className="py-4 border-b border-orange-100">
                                    <CardTitle className="text-sm font-black text-slate-900">Discovery Logic Controls</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Homepage Promotion Bias</label>
                                            <span className="text-xs font-black text-orange-600">+45%</span>
                                        </div>
                                        <div className="relative h-1.5 w-full bg-white rounded-full border border-orange-100">
                                            <div className="absolute left-0 top-0 h-full w-[70%] bg-orange-500 rounded-full" />
                                            <div className="absolute left-[70%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-orange-600 rounded-full shadow-sm cursor-pointer" />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 mt-2">Boosts borough-level commerce on user entry screens.</p>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Search Result Weighting</label>
                                            <span className="text-[9px] font-bold text-blue-600 underline cursor-pointer">Optimized</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" className="h-8 text-[10px] font-black border-slate-200 text-slate-500 hover:text-slate-900">Distance</Button>
                                            <Button className="h-8 text-[10px] font-black bg-blue-600 text-white">Smart Match</Button>
                                            <Button variant="outline" className="h-8 text-[10px] font-black border-slate-200 text-slate-500 hover:text-slate-900">Rating</Button>
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between p-4 bg-white rounded-xl border border-orange-100 shadow-sm">
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900">Isolation Mode</p>
                                            <p className="text-[9px] font-bold text-slate-500 mt-0.5">Filter visibility for out-of-block viewers</p>
                                        </div>
                                        <div className="w-8 h-4 rounded-full bg-slate-200 relative">
                                            <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                    <Button className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold shadow-lg shadow-orange-700/20">Apply Algorithmic Changes</Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md bg-slate-800 overflow-hidden relative group h-48">
                                <div className="absolute top-4 left-4 z-20">
                                    <Badge className="bg-white text-slate-900 border-none font-black text-[9px] uppercase tracking-widest">B2B Search Map</Badge>
                                </div>
                                <div className="absolute top-4 right-4 z-20 flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-white/50" />
                                    <div className="w-1 h-1 rounded-full bg-white/50" />
                                    <div className="w-1 h-1 rounded-full bg-white/50" />
                                </div>
                                {/* Dark Map Mockup */}
                                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-80 group-hover:scale-105 transition-transform duration-700">
                                    {/* Grid background */}
                                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '12px 12px' }} />
                                    {/* Nodes */}
                                    <div className="absolute w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                                        <div className="w-12 h-12 bg-orange-500/40 rounded-full animate-pulse" />
                                    </div>
                                    <div className="absolute -right-8 bottom-4 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                                        <div className="w-8 h-8 bg-blue-500/40 rounded-full" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Proactive AI */}
                    <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2"><Share2 className="w-4 h-4 text-orange-600" /> Proactive AI Discovery</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-blue-50 rounded-lg"><Zap className="w-3.5 h-3.5 text-blue-600" /></div>
                                        <p className="text-[11px] font-black text-slate-800">Cross-Borough Synergy</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">The algorithm is currently positioning "Weekend Dining" to users in the North District based on high search intent trends detected in the past 12 hours.</p>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-orange-50 rounded-lg"><ShieldCheck className="w-3.5 h-3.5 text-orange-600" /></div>
                                        <p className="text-[11px] font-black text-slate-800">Peak Traffic Correction</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Incoming tourism traffic via South Station. Automatically throttling discount notifications for loyalty users within a 1.5km radius.</p>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-indigo-50 rounded-lg"><TrendingUp className="w-3.5 h-3.5 text-indigo-600" /></div>
                                        <p className="text-[11px] font-black text-slate-800">Predictive Visibility</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Anticipated surge for "Coffee & Coworking" tomorrow at 08:30 AM. Pre-boosting matching entities for priority search ranking.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard2({ title, value, trend, icon: Icon, color, trendDown }: any) {
    const colorMap: any = {
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };

    return (
        <Card className="border-slate-200 shadow-sm group hover:border-slate-300 transition-colors overflow-hidden">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div className={cn("p-2.5 rounded-xl border", colorMap[color])}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-0.5 text-[11px] font-black uppercase tracking-tighter",
                        trendDown ? "text-red-500" : "text-emerald-500"
                    )}>
                        {trend} {trendDown ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
                </div>
                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full w-2/3", 
                        color === 'orange' ? "bg-orange-500" : 
                        color === 'blue' ? "bg-blue-500" : 
                        color === 'indigo' ? "bg-indigo-500" : "bg-emerald-500"
                    )} />
                </div>
            </CardContent>
        </Card>
    );
}
