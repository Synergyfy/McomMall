'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Building2,
    Users,
    Rocket,
    Search,
    MoreVertical,
    ExternalLink,
    ShieldCheck,
    Store,
    Trash2,
    AlertTriangle,
    Loader2,
    Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import {
    useGetBoroughs,
    useGetBoroughStats,
    useGetAllBoroughCampaigns,
    useCreateBorough,
    useDeleteBorough,
} from '@/service/boroughs/hook';
import { useGetBusinessStats } from '@/service/admin/hook';

export default function BoroughManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [onboardOpen, setOnboardOpen] = useState(false);
    const [name, setName] = useState('');
    const [managerName, setManagerName] = useState('');
    const [activityLevel, setActivityLevel] = useState('');

    const { data, isLoading, isError, error, refetch } = useGetBoroughs();
    const { data: stats, isLoading: statsLoading } = useGetBoroughStats();
    const { data: campaigns } = useGetAllBoroughCampaigns();
    const { data: businessStats } = useGetBusinessStats();
    const create = useCreateBorough();
    const remove = useDeleteBorough();

    const boroughs = useMemo(() => data ?? [], [data]);
    const campaignCountByBorough = useMemo(() => {
        const map = new Map<string, number>();
        for (const c of campaigns ?? []) {
            if (c.boroughId) map.set(c.boroughId, (map.get(c.boroughId) ?? 0) + 1);
        }
        return map;
    }, [campaigns]);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return boroughs;
        return boroughs.filter(
            (b) =>
                b.name.toLowerCase().includes(q) ||
                (b.managerName ?? '').toLowerCase().includes(q),
        );
    }, [boroughs, searchQuery]);

    const handleOnboard = () => {
        if (!name.trim()) return;
        create.mutate(
            {
                name: name.trim(),
                managerName: managerName.trim() || undefined,
                activityLevel: activityLevel.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setOnboardOpen(false);
                    setName('');
                    setManagerName('');
                    setActivityLevel('');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Borough Management</h1>
                    <p className="text-slate-500 italic font-medium">Live borough records from the API.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={onboardOpen} onOpenChange={setOnboardOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-lg shadow-orange-200">
                                <Plus className="h-4 w-4" />
                                Onboard Borough
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px] bg-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-slate-900">Onboard New Borough</DialogTitle>
                                <DialogDescription className="text-xs font-bold text-slate-500">
                                    Creates a live borough via POST /boroughs.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="boroughName">Borough Name *</Label>
                                    <Input
                                        id="boroughName"
                                        placeholder="e.g. Southwark"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adminName">Assigned Manager</Label>
                                    <Input
                                        id="adminName"
                                        placeholder="e.g. John Doe"
                                        value={managerName}
                                        onChange={(e) => setManagerName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="population">Activity Level</Label>
                                    <Input
                                        id="population"
                                        placeholder="e.g. High"
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleOnboard}
                                    disabled={!name.trim() || create.isPending}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                                >
                                    {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Confirm Onboarding
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Boroughs', value: stats?.total, icon: Building2 },
                    { title: 'Active Boroughs', value: stats?.active, icon: ShieldCheck },
                    { title: 'Platform Businesses', value: businessStats?.total, icon: Store },
                    { title: 'Borough Campaigns', value: campaigns?.length, icon: Rocket },
                ].map((stat) => (
                    <Card key={stat.title} className="border-slate-200 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-xl">
                                <stat.icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                <p className="text-xl font-black text-slate-900">{statsLoading ? '…' : (stat.value ?? '—')}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load boroughs: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-slate-200 shadow-sm overflow-hidden w-full">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Borough Inventory</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-500">
                                {isLoading ? 'Loading…' : `${filtered.length} boroughs`}
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search boroughs or managers..."
                                className="pl-10 h-10 text-sm border-slate-200 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No boroughs found</p>
                            <p className="text-sm text-slate-400">Onboard your first borough to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30">
                                    <TableHead className="pl-6">Borough Name</TableHead>
                                    <TableHead className="text-center">Activity</TableHead>
                                    <TableHead className="text-center">Campaigns</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right pr-6" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((b) => (
                                    <TableRow key={b.id} className="hover:bg-slate-50/80">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-slate-100 rounded-xl">
                                                    <Building2 className="h-5 w-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-base leading-none">{b.name}</p>
                                                    <p className="text-[11px] text-slate-400 mt-1.5 uppercase font-black flex items-center gap-1.5">
                                                        <ShieldCheck className="h-3 w-3" /> Manager: {b.managerName || 'Unassigned'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge variant="outline">{b.activityLevel || '—'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-black text-sm py-4">
                                            {campaignCountByBorough.get(b.id) ?? 0}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <Badge
                                                className={cn(
                                                    'border-none text-[10px] font-black uppercase',
                                                    b.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500',
                                                )}
                                            >
                                                {b.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                                                        <MoreVertical className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase px-2 py-1.5">
                                                        Borough Management
                                                    </DropdownMenuLabel>
                                                    <Link href={`/admin/boroughs/${b.id}`}>
                                                        <DropdownMenuItem className="gap-2.5 rounded-lg py-2.5 cursor-pointer">
                                                            <ExternalLink className="h-4 w-4 text-slate-500" /> View Borough Profile
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="gap-2.5 rounded-lg py-2.5 cursor-pointer text-red-600"
                                                        disabled={remove.isPending}
                                                        onClick={() => {
                                                            if (confirm(`Remove borough "${b.name}"?`)) remove.mutate(b.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Remove Borough
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="h-3 w-3" /> Per-borough business density and rewards participation need a
                borough field on business records — not available in the API yet.
            </p>
        </div>
    );
}
