'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Gamepad2, Users, Play, Gift, Trophy, AlertTriangle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetPlatformGames, useGetPlatformGameSummary } from '@/service/gamification/hook';

function statusStyle(status: string): string {
    switch (status) {
        case 'active':
            return 'bg-emerald-500 text-white';
        case 'scheduled':
            return 'bg-blue-500 text-white';
        case 'draft':
            return 'bg-slate-300 text-slate-600';
        default:
            return 'bg-slate-200 text-slate-600';
    }
}

export default function GamificationManagementDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data, isLoading, isError, error, refetch } = useGetPlatformGames(
        statusFilter === 'all' ? undefined : statusFilter,
    );
    const { data: summary, isLoading: summaryLoading } = useGetPlatformGameSummary();

    const games = useMemo(() => data ?? [], [data]);
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return games;
        return games.filter(
            (g) =>
                g.title.toLowerCase().includes(q) ||
                g.gameType.toLowerCase().includes(q) ||
                (g.business?.businessName ?? '').toLowerCase().includes(q),
        );
    }, [games, searchQuery]);

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gamification</h1>
                <p className="text-sm font-bold text-slate-500 mt-1">
                    Live platform-wide game campaigns and engagement totals.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Total Games', value: summary?.totalGames, icon: Gamepad2 },
                    { label: 'Active Games', value: summary?.activeGames, icon: Play },
                    { label: 'Participants', value: summary?.totalParticipants, icon: Users },
                    { label: 'Games Played', value: summary?.gamesPlayed, icon: Trophy },
                    { label: 'Rewards Issued', value: summary?.rewardsIssued, icon: Gift },
                    { label: 'Rewards Claimed', value: summary?.rewardsClaimed, icon: Gift },
                ].map((s) => (
                    <Card key={s.label} className="border-slate-200 shadow-sm bg-white rounded-2xl">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900">
                                    {summaryLoading ? '…' : (s.value?.toLocaleString?.() ?? s.value ?? '—')}
                                </p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load games: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Game Campaigns</CardTitle>
                            <CardDescription>
                                {isLoading ? 'Loading…' : `${filtered.length} games`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search title, type, business…"
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-44 bg-white">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="past">Past</SelectItem>
                                </SelectContent>
                            </Select>
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
                            <Gamepad2 className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No games found</p>
                            <p className="text-sm text-slate-400">Merchants create games from their dashboards.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/30">
                                    <TableHead className="pl-6">Game</TableHead>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reward</TableHead>
                                    <TableHead className="text-center">Played</TableHead>
                                    <TableHead className="text-center">Issued / Claimed</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((g) => (
                                    <TableRow key={g.id}>
                                        <TableCell className="pl-6 py-4 font-bold text-sm">{g.title}</TableCell>
                                        <TableCell className="text-xs text-slate-600">
                                            {g.business?.businessName ?? g.businessId.slice(0, 8)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize text-[10px]">
                                                {g.gameType.replace(/-/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {g.rewardValue}
                                            <span className="text-slate-400"> · {g.rewardType}</span>
                                        </TableCell>
                                        <TableCell className="text-center text-sm font-bold">
                                            {(g.gamesPlayed ?? 0).toLocaleString()}
                                            <span className="text-slate-400 font-normal"> / {(g.totalParticipants ?? 0).toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="text-center text-sm">
                                            {(g.rewardsIssued ?? 0).toLocaleString()} / {(g.rewardsClaimed ?? 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={cn('border-none text-[10px] font-black uppercase', statusStyle(g.status))}>
                                                {g.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
