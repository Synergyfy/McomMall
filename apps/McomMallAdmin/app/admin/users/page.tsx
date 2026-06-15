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
    Download
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
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// --- Mock Data ---

const mockCustomers = [
    {
        id: 'C8219',
        name: 'Eleanor Vance',
        email: 'eleanor.v@example.com',
        borough: 'Camden',
        membershipStatus: 'Premium',
        rewardsPoints: 12450,
        engagementScore: 94,
        lastActivity: '2 hours ago',
        loyaltyLevel: 'Platinum VIP',
        avatar: 'EV',
        status: 'Active'
    },
    {
        id: 'C4421',
        name: 'Marcus Thorne',
        email: 'marcus.t@example.com',
        borough: 'Westminster',
        membershipStatus: 'Basic',
        rewardsPoints: 840,
        engagementScore: 42,
        lastActivity: '1 day ago',
        loyaltyLevel: 'Silver',
        avatar: 'MT',
        status: 'Active'
    },
    {
        id: 'C9912',
        name: 'Sophie Laurent',
        email: 'sophie.l@example.com',
        borough: 'Hackney',
        membershipStatus: 'Elite',
        rewardsPoints: 45200,
        engagementScore: 98,
        lastActivity: '15 mins ago',
        loyaltyLevel: 'Diamond',
        avatar: 'SL',
        status: 'Active'
    },
    {
        id: 'C1045',
        name: 'David Chen',
        email: 'david.c@example.com',
        borough: 'Greenwich',
        membershipStatus: 'Basic',
        rewardsPoints: 120,
        engagementScore: 12,
        lastActivity: '3 weeks ago',
        loyaltyLevel: 'Bronze',
        avatar: 'DC',
        status: 'Inactive'
    },
    {
        id: 'C5532',
        name: 'Amelia Pond',
        email: 'amelia.p@example.com',
        borough: 'Islington',
        membershipStatus: 'Premium',
        rewardsPoints: 8900,
        engagementScore: 76,
        lastActivity: '5 hours ago',
        loyaltyLevel: 'Gold',
        avatar: 'AP',
        status: 'Flagged'
    }
];

const kpis = [
    { title: 'Total Customers', value: '142.5k', trend: '+12%', trendType: 'up', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Users', value: '89.2k', trend: '+5%', trendType: 'up', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Rewards Participation', value: '64%', trend: '+8%', trendType: 'up', icon: Gift, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Gamification Part.', value: '42%', trend: '+15%', trendType: 'up', icon: Gamepad2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Borough Engagement', value: '78/100', trend: 'Stable', trendType: 'neutral', icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-50' },
    { title: 'Loyalty Retention', value: '92%', trend: '-1%', trendType: 'down', icon: Gem, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function CustomerManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [bulkMessageOpen, setBulkMessageOpen] = useState(false);
    const [actionModal, setActionModal] = useState<{type: 'view' | 'suspend' | 'reward' | 'moderate' | 'contact', user: any} | null>(null);

    const filteredCustomers = useMemo(() => {
        return mockCustomers.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Management</h1>
                            <p className="text-sm font-bold text-slate-500 mt-1">Community engagement, loyalty tracking, and participation metrics.</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 font-bold text-slate-700 border-slate-200 bg-white rounded-xl shadow-sm gap-2">
                        <Download className="w-4 h-4" /> Export Data
                    </Button>
                    <Button className="h-11 px-6 font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 gap-2" onClick={() => setBulkMessageOpen(true)}>
                        <MessageSquare className="w-4 h-4" /> Bulk Message
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm hover:border-blue-200 transition-all group bg-white rounded-3xl overflow-hidden relative">
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
                            <CardTitle className="text-xl font-black text-slate-900">User Directory</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 mt-1">Manage all platform consumers and their engagement profiles.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search by name, email, or ID..." 
                                    className="pl-11 h-12 text-sm font-bold border-slate-200 shadow-sm bg-white rounded-xl focus:ring-2 focus:ring-blue-100 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-12 px-6 text-sm font-bold text-slate-700 border-slate-200 bg-white gap-2 rounded-xl shadow-sm hover:bg-slate-50">
                                <Filter className="w-4 h-4" /> Filter Segments
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 pl-8 h-14">Customer Name</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Borough</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Membership</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-right h-14">Rewards Pts</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Engagement Score</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 h-14">Last Activity</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 text-center h-14">Loyalty Level</TableHead>
                                <TableHead className="text-right pr-8 h-14"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((c) => (
                                <TableRow 
                                    key={c.id} 
                                    className="hover:bg-blue-50/30 cursor-pointer group transition-colors"
                                >
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[12px] font-black text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all relative">
                                                {c.avatar}
                                                {c.status === 'Flagged' && (
                                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{c.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{c.email} • {c.id}</p>
                                            </div>
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
                                            c.membershipStatus === 'Elite' ? "bg-slate-900 text-white" :
                                            c.membershipStatus === 'Premium' ? "bg-amber-100 text-amber-700" :
                                            "bg-slate-100 text-slate-600"
                                        )}>
                                            {c.membershipStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right py-5 text-sm font-black text-slate-900 tracking-tight">
                                        {c.rewardsPoints.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex flex-col items-center gap-1.5 w-full px-4">
                                            <div className="flex items-center justify-between w-full text-[10px] font-black">
                                                <span className={cn(
                                                    c.engagementScore > 80 ? "text-emerald-600" :
                                                    c.engagementScore > 40 ? "text-blue-600" : "text-slate-400"
                                                )}>{c.engagementScore}/100</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={cn(
                                                    "h-full rounded-full",
                                                    c.engagementScore > 80 ? "bg-emerald-500" :
                                                    c.engagementScore > 40 ? "bg-blue-500" : "bg-slate-300"
                                                )} style={{ width: `${c.engagementScore}%` }} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 text-xs font-bold text-slate-500">
                                        {c.lastActivity}
                                    </TableCell>
                                    <TableCell className="text-center py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <Award className={cn(
                                                "w-4 h-4",
                                                c.loyaltyLevel === 'Diamond' ? "text-purple-500" :
                                                c.loyaltyLevel === 'Platinum VIP' ? "text-slate-800" :
                                                c.loyaltyLevel === 'Gold' ? "text-amber-500" :
                                                c.loyaltyLevel === 'Silver' ? "text-slate-400" : "text-amber-800"
                                            )} />
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{c.loyaltyLevel}</span>
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
                                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Customer Actions</DropdownMenuLabel>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs" onClick={(e) => { e.stopPropagation(); setActionModal({ type: 'view', user: c }); }}>
                                                    <Eye className="w-4 h-4 text-slate-500" /> View Full Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-blue-600" onClick={(e) => { e.stopPropagation(); setActionModal({ type: 'contact', user: c }); }}>
                                                    <Contact className="w-4 h-4" /> Contact Customer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-orange-600" onClick={(e) => { e.stopPropagation(); setActionModal({ type: 'reward', user: c }); }}>
                                                    <Gift className="w-4 h-4" /> Issue Reward
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-amber-600" onClick={(e) => { e.stopPropagation(); setActionModal({ type: 'moderate', user: c }); }}>
                                                    <ShieldAlert className="w-4 h-4" /> Moderate Activity
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 rounded-xl py-3 cursor-pointer font-bold text-xs text-red-600" onClick={(e) => { e.stopPropagation(); setActionModal({ type: 'suspend', user: c }); }}>
                                                    <Ban className="w-4 h-4" /> Suspend Account
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

            {/* ACTION MODALS */}
            {/* View Profile Modal */}
            <Dialog open={actionModal?.type === 'view'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-0 overflow-hidden sm:max-w-lg">
                    {actionModal?.user && (
                        <>
                            <div className="bg-slate-900 p-8 text-white relative">
                                <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                    {actionModal.user.status}
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black shadow-lg">
                                        {actionModal.user.avatar}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">{actionModal.user.name}</h2>
                                        <p className="text-xs font-bold text-slate-400 mt-1">{actionModal.user.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-white space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Rewards Points</p>
                                        <p className="text-xl font-black text-slate-900">{actionModal.user.rewardsPoints.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Engagement</p>
                                        <p className="text-xl font-black text-blue-600">{actionModal.user.engagementScore}/100</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-slate-500">Borough</span>
                                        <span className="font-black text-slate-900">{actionModal.user.borough}</span>
                                    </div>
                                    <Separator className="bg-slate-100" />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-slate-500">Membership</span>
                                        <span className="font-black text-slate-900">{actionModal.user.membershipStatus}</span>
                                    </div>
                                    <Separator className="bg-slate-100" />
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-slate-500">Loyalty Level</span>
                                        <span className="font-black text-slate-900">{actionModal.user.loyaltyLevel}</span>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="p-4 pt-0 border-t border-slate-100">
                                <Button variant="ghost" onClick={() => setActionModal(null)} className="w-full rounded-xl font-bold">Close Profile</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Suspend Modal */}
            <Dialog open={actionModal?.type === 'suspend'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Ban className="w-5 h-5 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Suspend Account</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            You are about to suspend {actionModal?.user?.name}'s account. This prevents them from earning rewards or making purchases.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="tos">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Reason for suspension" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="tos" className="font-bold cursor-pointer rounded-lg">Terms of Service Violation</SelectItem>
                                <SelectItem value="fraud" className="font-bold cursor-pointer rounded-lg">Suspicious Payment Activity</SelectItem>
                                <SelectItem value="harassment" className="font-bold cursor-pointer rounded-lg">Community Harassment</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder="Internal notes (optional)" className="resize-none rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400" />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => setActionModal(null)} className="rounded-xl bg-red-600 hover:bg-red-700 font-black text-white shadow-lg shadow-red-200">Confirm Suspension</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reward Modal */}
            <Dialog open={actionModal?.type === 'reward'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Gift className="w-5 h-5 text-orange-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Issue Reward</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            Credit points or send a voucher directly to {actionModal?.user?.name}'s wallet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="points_1000">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Select Reward" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="points_500" className="font-bold cursor-pointer rounded-lg">500 Points Credit</SelectItem>
                                <SelectItem value="points_1000" className="font-bold cursor-pointer rounded-lg">1,000 Points Credit</SelectItem>
                                <SelectItem value="voucher_10" className="font-bold cursor-pointer rounded-lg">£10 Generic Voucher</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder="Message to user (optional)" defaultValue="Thank you for being a highly valued member of our community!" className="resize-none rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400" />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => setActionModal(null)} className="rounded-xl bg-orange-600 hover:bg-orange-700 font-black text-white shadow-lg shadow-orange-200">Issue Reward</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Moderate Modal */}
            <Dialog open={actionModal?.type === 'moderate'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-amber-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Moderate Activity</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            Flag {actionModal?.user?.name}'s account for review or issue a formal warning.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="warning">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="warning" className="font-bold cursor-pointer rounded-lg">Issue Formal Warning</SelectItem>
                                <SelectItem value="flag" className="font-bold cursor-pointer rounded-lg">Flag for Shadowban Review</SelectItem>
                                <SelectItem value="reset" className="font-bold cursor-pointer rounded-lg">Reset Gamification Stats</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => setActionModal(null)} className="rounded-xl bg-amber-600 hover:bg-amber-700 font-black text-white shadow-lg shadow-amber-200">Apply Moderation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Contact Modal */}
            <Dialog open={actionModal?.type === 'contact'} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Contact className="w-5 h-5 text-blue-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Contact Customer</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            Send a direct email or push notification to {actionModal?.user?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="email">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Delivery Method" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="email" className="font-bold cursor-pointer rounded-lg">Email ({actionModal?.user?.email})</SelectItem>
                                <SelectItem value="push" className="font-bold cursor-pointer rounded-lg">Push Notification</SelectItem>
                                <SelectItem value="sms" className="font-bold cursor-pointer rounded-lg">SMS (if verified)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="Subject" className="rounded-xl h-12 border-slate-200 font-bold placeholder:text-slate-400" />
                        <Textarea placeholder="Type your message..." className="resize-none h-32 rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400" />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionModal(null)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => setActionModal(null)} className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-white shadow-lg shadow-blue-200">Send Message</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Message Modal */}
            <Dialog open={bulkMessageOpen} onOpenChange={setBulkMessageOpen}>
                <DialogContent className="rounded-3xl border-slate-100 shadow-2xl p-6 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <DialogTitle className="text-xl font-black text-slate-900">Bulk Message Segment</DialogTitle>
                        </div>
                        <DialogDescription className="font-bold text-slate-500">
                            Send a mass message to a specific customer segment or all active users.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-full rounded-xl h-12 border-slate-200 font-bold text-slate-700">
                                <SelectValue placeholder="Target Segment" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="all" className="font-bold cursor-pointer rounded-lg">All Active Users (89.2k)</SelectItem>
                                <SelectItem value="premium" className="font-bold cursor-pointer rounded-lg">Premium & Elite Members (12.4k)</SelectItem>
                                <SelectItem value="inactive" className="font-bold cursor-pointer rounded-lg">Inactive Users (30+ Days)</SelectItem>
                                <SelectItem value="hackney" className="font-bold cursor-pointer rounded-lg">Hackney Borough Residents</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="Campaign Subject" className="rounded-xl h-12 border-slate-200 font-bold placeholder:text-slate-400" />
                        <Textarea placeholder="Type your broadcast message..." className="resize-none h-32 rounded-xl border-slate-200 text-sm font-bold placeholder:text-slate-400" />
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            <p className="text-[10px] uppercase tracking-widest font-black text-blue-800">Messages will be sent as push notifications and emails based on user prefs.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setBulkMessageOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => setBulkMessageOpen(false)} className="rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-white shadow-lg shadow-blue-200">Send Broadcast</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
