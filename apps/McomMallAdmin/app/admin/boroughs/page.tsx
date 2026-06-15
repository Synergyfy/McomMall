'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
    Building2, 
    Users, 
    Rocket, 
    Gift, 
    Calendar, 
    Activity,
    Search,
    Filter,
    MoreVertical,
    ExternalLink,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    LayoutDashboard,
    Heart,
    Store,
    BarChart3,
    MessageSquare,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// --- Mock Data ---

const boroughStats = [
    { title: 'Active Businesses', value: '1,248', trend: '+12%', icon: Store, trendType: 'up' },
    { title: 'Customer Part.', value: '45.2k', trend: '+8%', icon: Users, trendType: 'up' },
    { title: 'Borough Campaigns', value: '34', trend: '+2', icon: Rocket, trendType: 'up' },
    { title: 'Rewards Activity', value: '8.4k', trend: '+15%', icon: Gift, trendType: 'up' },
    { title: 'Local Events', value: '12', trend: '-3', icon: Calendar, trendType: 'down' },
    { title: 'Engagement Rate', value: '92%', trend: '+5%', icon: Activity, trendType: 'up' },
];

const boroughs = [
    {
        id: '1',
        name: 'Westminster',
        populationActivity: 'High',
        businessCount: 452,
        activeCampaigns: 12,
        rewardsParticipation: '88%',
        healthScore: 94,
        manager: 'James Wilson',
    },
    {
        id: '2',
        name: 'Camden',
        populationActivity: 'Medium',
        businessCount: 318,
        activeCampaigns: 8,
        rewardsParticipation: '76%',
        healthScore: 82,
        manager: 'Sarah Chen',
    },
    {
        id: '3',
        name: 'Tower Hamlets',
        populationActivity: 'Very High',
        businessCount: 284,
        activeCampaigns: 15,
        rewardsParticipation: '92%',
        healthScore: 89,
        manager: 'David G.',
    },
    {
        id: '4',
        name: 'Hackney',
        populationActivity: 'High',
        businessCount: 215,
        activeCampaigns: 6,
        rewardsParticipation: '81%',
        healthScore: 85,
        manager: 'Emma Thompson',
    },
];

export default function BoroughManagementPage() {
    const [selectedBorough, setSelectedBorough] = useState<typeof boroughs[0] | null>(null);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Borough Management</h1>
                    <p className="text-slate-500 italic font-medium">Command center for local borough ecosystems and engagement systems.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        District Filter
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-lg shadow-orange-200">
                                <PlusIcon className="h-4 w-4" />
                                Onboard Borough
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px] bg-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-slate-900">Onboard New Borough</DialogTitle>
                                <DialogDescription className="text-xs font-bold text-slate-500">
                                    Add a new geographic borough to the McomMall ecosystem.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="boroughName" className="text-xs font-black text-slate-700 uppercase tracking-wider">Borough Name</label>
                                    <Input id="boroughName" placeholder="e.g. Southwark" className="font-bold border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="adminName" className="text-xs font-black text-slate-700 uppercase tracking-wider">Assigned Admin</label>
                                    <Input id="adminName" placeholder="e.g. John Doe" className="font-bold border-slate-200 text-slate-900" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="population" className="text-xs font-black text-slate-700 uppercase tracking-wider">Activity Level</label>
                                        <Input id="population" placeholder="e.g. High" className="font-bold border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="initialBiz" className="text-xs font-black text-slate-700 uppercase tracking-wider">Initial Biz Count</label>
                                        <Input id="initialBiz" type="number" placeholder="0" className="font-bold border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">Confirm Onboarding</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Borough Overview KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {boroughStats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="w-full">
                {/* Borough List View - Now Full Width */}
                <Card className="border-slate-200 shadow-sm overflow-hidden w-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-800">Borough Inventory</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500">Live monitoring of community health, business density, and ecosystem participation.</CardDescription>
                            </div>
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Search high streets or borough admins..." className="pl-10 h-10 text-sm border-slate-200 bg-white" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30">
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-500 pl-6 h-12">Borough Name</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-500 text-center h-12">Population Activity</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-500 text-center h-12">Active Businesses</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-500 text-center h-12">Live Campaigns</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-500 text-center h-12">Rewards Participation</TableHead>
                                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-500 text-center h-12">Community Health</TableHead>
                                    <TableHead className="text-right pr-6 h-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {boroughs.map((b) => (
                                    <TableRow 
                                        key={b.id} 
                                        className={cn(
                                            "cursor-pointer hover:bg-slate-50/80 transition-colors group",
                                            selectedBorough?.id === b.id && "bg-orange-50/50 hover:bg-orange-50/80"
                                        )}
                                        onClick={() => setSelectedBorough(b)}
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                                                    <Building2 className="h-5 w-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-base leading-none">{b.name}</p>
                                                    <p className="text-[11px] text-slate-400 mt-1.5 uppercase font-black tracking-tighter flex items-center gap-1.5">
                                                        <ShieldCheck className="h-3 w-3" /> Admin: {b.manager}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge variant="outline" className={cn(
                                                "h-6 text-[11px] px-3 font-bold rounded-full",
                                                b.populationActivity === 'Very High' ? "bg-orange-50 text-orange-600 border-orange-200" :
                                                b.populationActivity === 'High' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                "bg-slate-50 text-slate-600 border-slate-200"
                                            )}>
                                                {b.populationActivity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-black text-slate-700 text-sm py-4">{b.businessCount}</TableCell>
                                        <TableCell className="text-center font-black text-slate-700 text-sm py-4">{b.activeCampaigns}</TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{b.rewardsParticipation}</span>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                    <div 
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            b.healthScore > 90 ? "bg-emerald-500" : "bg-orange-500"
                                                        )}
                                                        style={{ width: `${b.healthScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{b.healthScore}% Health</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200">
                                                        <MoreVertical className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Borough Management</DropdownMenuLabel>
                                                    <Link href={`/admin/boroughs/${b.id}`}>
                                                        <DropdownMenuItem className="gap-2.5 rounded-lg py-2.5 cursor-pointer">
                                                            <ExternalLink className="h-4 w-4 text-slate-500" /> View Detailed Borough Profile
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem className="gap-2.5 rounded-lg py-2.5 cursor-pointer"><Rocket className="h-4 w-4 text-orange-500" /> Launch Activation Campaign</DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2.5 rounded-lg py-2.5 cursor-pointer"><ShieldCheck className="h-4 w-4 text-blue-500" /> Reassign Borough Manager</DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2.5 rounded-lg py-2.5 cursor-pointer"><BarChart3 className="h-4 w-4 text-emerald-500" /> Advanced Ecosystem Analytics</DropdownMenuItem>
                                                    <DropdownMenuSeparator className="my-1.5" />
                                                    <DropdownMenuItem className="gap-2.5 text-blue-600 rounded-lg py-2.5 cursor-pointer font-bold"><MessageSquare className="h-4 w-4" /> Open Community Feedback</DropdownMenuItem>
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
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, trendType }: any) {
    return (
        <Card className="border-slate-200 hover:border-orange-200 transition-colors shadow-sm group">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-orange-50 transition-colors">
                        <Icon className="h-4 w-4 text-slate-600 group-hover:text-orange-600" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        trendType === 'up' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                        {trendType === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function PlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
