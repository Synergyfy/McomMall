'use client';

import React, { useState, useMemo } from 'react';
import { 
    Search, 
    Filter, 
    MoreVertical, 
    Edit3, 
    Copy, 
    Pause, 
    Play, 
    BarChart3, 
    RefreshCw,
    Plus,
    QrCode,
    ExternalLink,
    TrendingUp,
    Globe,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    MousePointer2,
    Target,
    Star
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
import { cn } from '@/lib/utils';

// --- Mock Data ---

const qlinks = [
    { id: 'QL001', name: 'Summer Coffee Campaign', destination: '/campaigns/summer', borough: 'Camden', scans: 1240, conversion: '12.4%', status: 'Active' },
    { id: 'QL002', name: 'Local Hero Voucher', destination: '/promotions/hero', borough: 'Westminster', scans: 890, conversion: '8.1%', status: 'Active' },
    { id: 'QL003', name: 'Borough Anniversary', destination: '/events/anniversary', borough: 'Hackney', scans: 450, conversion: '4.5%', status: 'Paused' },
    { id: 'QL004', name: 'Early Bird Breakfast', destination: '/deals/breakfast', borough: 'Greenwich', scans: 2300, conversion: '15.2%', status: 'Active' },
    { id: 'QL005', name: 'Staff Training Portal', destination: '/staff/training', borough: 'Islington', scans: 120, conversion: '0%', status: 'Archived' },
];

const kpis = [
    { title: 'Total QLinks', value: '1,428', trend: '+12', trendType: 'up', icon: QrCode, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Daily Scans', value: '8,492', trend: '+18%', trendType: 'up', icon: MousePointer2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Conversion Rate', value: '6.4%', trend: '-0.2%', trendType: 'down', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Active Campaigns', value: '42', trend: '+3', trendType: 'up', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Borough Engagement', value: '78%', trend: '+5%', trendType: 'up', icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Top Performing Links', value: 'QL004', trend: 'Early Bird', trendType: 'neutral', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function QLinksManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [links, setLinks] = useState(qlinks);
    const [selectedLink, setSelectedLink] = useState<any>(null);
    const [view, setView] = useState<'list' | 'analytics'>('list');

    const togglePause = (id: string) => {
        setLinks(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'Active' ? 'Paused' : 'Active' } : l));
    };

    const duplicateLink = (id: string) => {
        const linkToCopy = links.find(l => l.id === id);
        if (linkToCopy) {
            const newLink = { ...linkToCopy, id: `QL${Math.floor(Math.random() * 1000)}`, name: `${linkToCopy.name} (Copy)` };
            setLinks(prev => [newLink, ...prev]);
        }
    };

    const filteredQLinks = useMemo(() => {
        return links.filter(q => 
            q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.borough.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, links]);

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">QLinks Management</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Smart QR destination management and scan tracking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="h-11 px-6 font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-lg shadow-orange-200 gap-2">
                        <Plus className="h-4 w-4" /> Create New QLink
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

            {/* QLinks Table */}
            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900">Active Destinations</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">Manage, analyze, and reassign QR campaign links.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search link, ID, or borough..." 
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
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">QLink Name / ID</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Destination</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Borough</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Scans</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Conversion</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Status</TableHead>
                                <TableHead className="text-right pr-8 h-14"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQLinks.map((q) => (
                                <TableRow key={q.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="pl-8 py-5">
                                        <p className="text-sm font-black text-slate-900">{q.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{q.id}</p>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg w-fit">
                                            <Globe className="w-3.5 h-3.5 text-orange-500" />
                                            {q.destination}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 font-bold text-xs text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {q.borough}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-5 font-black text-sm text-slate-900">{q.scans.toLocaleString()}</TableCell>
                                    <TableCell className="text-center py-5 font-black text-sm text-emerald-600">{q.conversion}</TableCell>
                                    <TableCell className="py-5">
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1",
                                            q.status === 'Active' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                        )}>
                                            {q.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8 py-5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-slate-100">
                                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">QLink Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs"><Edit3 className="w-4 h-4 text-slate-500" /> Edit Destination</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={() => duplicateLink(q.id)}><Copy className="w-4 h-4 text-slate-500" /> Duplicate Link</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={() => togglePause(q.id)}>{q.status === 'Active' ? <Pause className="w-4 h-4 text-slate-500" /> : <Play className="w-4 h-4 text-emerald-500" />} {q.status === 'Active' ? 'Pause Link' : 'Resume Link'}</DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-blue-600" onClick={() => { setSelectedLink(q); setView('analytics'); }}><BarChart3 className="w-4 h-4" /> View Analytics</DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-orange-600"><RefreshCw className="w-4 h-4" /> Reassign Borough</DropdownMenuItem>
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
